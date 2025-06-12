import { api } from '@/lib/api';
import React, { useEffect, useState } from 'react';
import { useEditorStore } from '../store';
import { DraftSummary } from '@/types';
import { setVibeVars } from '@/lib/vibeUtils';
import { WritingStreak } from './WritingStreak';

interface HomeScreenProps {
  onDraftSelect: (draftId: string | null) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onDraftSelect }) => {
  const [drafts, setDrafts] = useState<DraftSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingDraftId, setDeletingDraftId] = useState<string | null>(null);
  const { resetState } = useEditorStore();

  useEffect(() => {
    loadDrafts();
  }, []);

  // Poll for new drafts every 2 seconds
  useEffect(() => {
    const interval = setInterval(loadDrafts, 2000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + N for new draft
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        handleNewDraft();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadDrafts = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await await api.listDrafts();
      console.log('Loaded drafts:', result);
      
      if (result.success && result.drafts) {
        setDrafts(result.drafts);
      } else {
        setError(result.error || 'Failed to load drafts');
      }
    } catch (err) {
      console.error('Error loading drafts:', err);
      setError('An error occurred while loading drafts');
    } finally {
      setLoading(false);
    }
  };

  const handleNewDraft = () => {
    console.log('HomeScreen: Creating new draft');
    resetState();
    onDraftSelect(null);
  };

  const handleDraftClick = (draftId: string) => {
    console.log('HomeScreen: Selecting draft:', draftId);
    onDraftSelect(draftId);
  };

  const handleDeleteDraft = async (e: React.MouseEvent, draftId: string) => {
    e.stopPropagation(); // Prevent opening the draft
    
    // Show confirmation dialog
    const confirmed = window.confirm('Are you sure you want to delete this draft? This action cannot be undone.');
    
    if (!confirmed) return;
    
    try {
      setDeletingDraftId(draftId);
      const result = await await api.deleteDraft(draftId);
      
      if (result.success) {
        // Remove the draft from the list
        setDrafts(drafts.filter(d => d.id !== draftId));
      } else {
        setError(result.error || 'Failed to delete draft');
      }
    } catch (err) {
      console.error('Error deleting draft:', err);
      setError('An error occurred while deleting the draft');
    } finally {
      setDeletingDraftId(null);
    }
  };

  const getVibeDescription = (score: number | undefined) => {
    if (score === undefined) return '';
    if (score >= 0.5) return 'INSPIRING';
    if (score >= 0.2) return 'ENGAGING';
    if (score >= -0.2) return 'NEUTRAL';
    if (score >= -0.5) return 'FLAT';
    return 'NEEDS WORK';
  };

  const getVibeColor = (score: number | undefined) => {
    if (score === undefined) return '#6B7280'; // gray
    if (score >= 0.5) return '#10B981'; // green
    if (score >= 0.2) return '#3B82F6'; // blue
    if (score >= -0.2) return '#6B7280'; // gray
    if (score >= -0.5) return '#F59E0B'; // orange
    return '#EF4444'; // red
  };

  return (
    <div className="home-container">
      {/* Writing Streak Badge */}
      <WritingStreak />
      
      {/* Header Section */}
      <div className="home-header">
        <h1 className="home-title">Your Writing</h1>
        <p className="home-subtitle">
          Where words find their rhythm and stories discover their soul
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-6 text-center">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-pulse">
            <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full mb-4"></div>
            <p className="text-gray-500">Loading your drafts...</p>
          </div>
        </div>
      ) : (
        /* Drafts Grid */
        <div className="drafts-grid">
          {/* New Draft Card */}
          <div
            onClick={handleNewDraft}
            className="new-draft-card"
            aria-label="Create new draft"
            title="Create new draft (⌘N)"
          >
            <svg
              className="new-draft-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span className="new-draft-text">Start New Draft</span>
          </div>

          {/* Existing Drafts */}
          {drafts.map((draft) => (
            <div
              key={draft.id}
              onClick={() => handleDraftClick(draft.id)}
              className="draft-card group"
            >
              {/* Delete button - appears on hover */}
              <button
                onClick={(e) => handleDeleteDraft(e, draft.id)}
                className="draft-delete-button"
                disabled={deletingDraftId === draft.id}
                aria-label="Delete draft"
              >
                {deletingDraftId === draft.id ? (
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" strokeWidth="3" strokeDasharray="40 20" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" />
                  </svg>
                )}
              </button>
              <h3 className="draft-title">
                {draft.title || 'Untitled Draft'}
              </h3>
              <p className="draft-date">
                {new Date(draft.updatedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </p>
              <p className="draft-preview">
                Start writing and watch your words come alive...
              </p>
              {draft.lastVibe !== undefined && (
                <div className="draft-vibe-indicator">
                  <div 
                    className="draft-vibe-dot"
                    style={{ backgroundColor: getVibeColor(draft.lastVibe) }}
                  />
                  <span style={{ color: getVibeColor(draft.lastVibe) }}>
                    {draft.lastVibe.toFixed(2)} {getVibeDescription(draft.lastVibe)}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Keyboard shortcuts help */}
      <div className="keyboard-shortcuts-hint">
        <p>
          <kbd>⌘</kbd> + <kbd>N</kbd> New Draft • 
          <kbd>⌘</kbd> + <kbd>O</kbd> Open Draft • 
          <kbd>ESC</kbd> Close Dialogs
        </p>
      </div>
    </div>
  );
}; 