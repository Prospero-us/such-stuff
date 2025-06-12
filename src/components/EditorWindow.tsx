import { api } from '@/lib/api';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Editor } from './Editor';
import { VibeMeter } from './VibeMeter';
import { VibeSparkline } from './VibeSparkline';
import { ModeToggle } from './ModeToggle';
import { HeaderFrame } from './HeaderFrame';
import { FocusModeToggle } from './FocusModeToggle';
import { ReadingMode } from './ReadingMode';
import { WritingCoach } from './WritingCoach';
import { useEditorStore } from '../store';
import { VibeAnalysis, VersionInfo, WritingMode } from '@/types';
import { setVibeVars } from '@/lib/vibeUtils';

interface EditorWindowProps {
  draftId: string | null;
  onBack: () => void;
}

// Debounce function to limit how often a function can be called
const debounce = <F extends (...args: any[]) => any>(
  func: F,
  wait: number
): ((...args: Parameters<F>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<F>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const EditorWindow: React.FC<EditorWindowProps> = ({ draftId, onBack }) => {
  const {
    content,
    currentDraftId,
    setCurrentDraftId,
    metadata,
    updateMetadataField,
    vibe,
    setVibe,
    vibeHistory,
    setMetadata,
    resetState,
    setLastSaved,
    hasUnsavedChanges,
    writingMode,
    focusSettings,
    showReadingMode,
    toggleReadingMode,
    startSession,
    endSession,
    updateSessionStats,
    sessionStats
  } = useEditorStore();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editorText, setEditorText] = useState('');
  const [lastAnalyzedText, setLastAnalyzedText] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [selectedText, setSelectedText] = useState('');
  const [selectionVibe, setSelectionVibe] = useState<VibeAnalysis | null>(null);
  const [isAnalyzingSelection, setIsAnalyzingSelection] = useState(false);
  
  // Version history state
  const [versions, setVersions] = useState<VersionInfo[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [loadingVersions, setLoadingVersions] = useState(false);
  
  // Options dropdown state
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const optionsMenuRef = useRef<HTMLDivElement>(null);
  
  // Writing suggestions state - removed old implementation
  const [showWritingCoach, setShowWritingCoach] = useState(false);
  
  // Effect to close the options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target as Node)) {
        setShowOptionsMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // ESC key handler for various popups
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Close in priority order
        if (showVersions) {
          setShowVersions(false);
        } else if (showOptionsMenu) {
          setShowOptionsMenu(false);
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showVersions, showOptionsMenu]);
  
  // Load draft if draftId is provided
  useEffect(() => {
    const loadDraft = async () => {
      if (!draftId) {
        // Reset state for a new draft
        resetState();
        setLoading(false); // Make sure loading is false for new drafts
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        const result = await await api.loadDraft(draftId);
        
        if (result.success && result.content && result.metadata) {
          setCurrentDraftId(draftId);
          setMetadata(result.metadata);
          useEditorStore.setState({ content: result.content });
          setLastSaved(result.content);
          
          // Extract text content from HTML for analysis
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = result.content;
          const textContent = tempDiv.textContent || tempDiv.innerText || '';
          setEditorText(textContent);
          
          // Set initial vibe if available, but trigger re-analysis
          if (result.metadata.lastVibe !== undefined) {
            setVibe({
              score: result.metadata.lastVibe,
              reason: 'Analyzing your writing...',
            });
          }
          
          // Trigger analysis of the loaded content after a short delay
          setTimeout(() => {
            if (textContent) {
              analyzeText(textContent);
            }
          }, 500);
        } else {
          setError(result.error || 'Failed to load draft');
          resetState();
        }
      } catch (err) {
        console.error('Error loading draft:', err);
        setError('An error occurred while loading the draft');
        resetState();
      } finally {
        setLoading(false);
      }
    };
    
    loadDraft();
  }, [draftId]);
  
  // After loading a draft, analyze its content
  useEffect(() => {
    if (editorText && draftId && !loading) {
      // Small delay to ensure everything is initialized
      const timer = setTimeout(() => {
        analyzeText(editorText);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [draftId, loading]); // Don't include analyzeText in deps as it's defined later
  
  // Save the draft
  const saveDraft = useCallback(async () => {
    console.log('Save draft called. Current state:', {
      currentDraftId,
      contentLength: content.length,
      hasChanges: hasUnsavedChanges(),
      metadata
    });
    
    try {
      setSaving(true);
      setError(null);
      
      // Clean content by removing empty paragraph tags
      const cleanedContent = content.replace(/<p><\/p>/g, '').trim();
      
      // Prepare save data
      const saveData = {
        id: currentDraftId || undefined,
        content: cleanedContent,
        metadata,
      };
      
      console.log('Sending save request with data:', {
        id: saveData.id,
        contentLength: saveData.content.length,
        metadata: {
          title: saveData.metadata.title,
          updatedAt: saveData.metadata.updatedAt
        }
      });
      
      const result = await await api.saveDraft(saveData);
      console.log('Save result:', result);
      
      if (result.success && result.id) {
        setCurrentDraftId(result.id);
        setLastSaved(cleanedContent);
        console.log('Save successful, updated lastSavedContent');
        return true;
      } else {
        setError(result.error || 'Failed to save draft');
        console.error('Save failed:', result.error);
        return false;
      }
    } catch (err) {
      console.error('Error saving draft:', err);
      setError('An error occurred while saving the draft');
      return false;
    } finally {
      setSaving(false);
    }
  }, [content, currentDraftId, metadata, hasUnsavedChanges, setCurrentDraftId, setLastSaved]);
  
  // Auto-save draft
  useEffect(() => {
    if (!content || !hasUnsavedChanges()) return;
    
    const autoSaveInterval = setInterval(() => {
      if (hasUnsavedChanges()) {
        saveDraft();
      }
    }, 10000);
    
    return () => clearInterval(autoSaveInterval);
  }, [content, hasUnsavedChanges, saveDraft]);
  
  // Save on Ctrl+S
  useEffect(() => {
    const handleSaveEvent = () => {
      saveDraft();
    };
    
    document.addEventListener('editor:save', handleSaveEvent);
    return () => {
      document.removeEventListener('editor:save', handleSaveEvent);
    };
  }, [saveDraft]);
  
  // Export the draft
  const exportDraft = async (format: 'md' | 'txt' = 'md') => {
    if (!currentDraftId) {
      // Save first if this is a new draft
      const saved = await saveDraft();
      if (!saved) return;
    }
    
    try {
      setError(null);
      const result = await await api.exportDraft({ 
        id: currentDraftId as string,
        format 
      });
      
      if (!result.success) {
        setError(result.error || 'Failed to export draft');
      }
      
      // Close the options menu
      setShowOptionsMenu(false);
    } catch (err) {
      console.error('Error exporting draft:', err);
      setError('An error occurred while exporting the draft');
    }
  };
  
  // Load version history
  const loadVersionHistory = async () => {
    if (!currentDraftId) return;
    
    try {
      setLoadingVersions(true);
      setError(null);
      
      const result = await await api.getDraftVersions(currentDraftId);
      
      if (result.success && result.versions) {
        setVersions(result.versions);
        setShowVersions(true);
      } else {
        setError(result.error || 'Failed to load version history');
      }
    } catch (err) {
      console.error('Error loading versions:', err);
      setError('An error occurred while loading version history');
    } finally {
      setLoadingVersions(false);
    }
  };
  
  // Restore a version
  const restoreVersion = async (versionId: string) => {
    if (!currentDraftId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await await api.restoreDraftVersion({
        draftId: currentDraftId,
        versionId
      });
      
      if (result.success && result.content && result.metadata) {
        // Update the editor with the restored version
        useEditorStore.setState({ content: result.content });
        setMetadata(result.metadata);
        setLastSaved(result.content);
        setShowVersions(false);
        
        // Reset vibe state for the restored version
        if (result.metadata.lastVibe !== undefined) {
          setVibe({
            score: result.metadata.lastVibe,
            reason: 'Restored from previous version',
          });
        }
      } else {
        setError(result.error || 'Failed to restore version');
      }
    } catch (err) {
      console.error('Error restoring version:', err);
      setError('An error occurred while restoring the version');
    } finally {
      setLoading(false);
    }
  };
  
  // Helper to get the current passage for analysis
  const getCurrentPassage = useCallback((text: string): string => {
    if (!text.trim()) return '';
    
    // Split text into sentences
    // This regex looks for sentence endings (period, question mark, exclamation point)
    // followed by a space or end of string
    const sentenceEndings = /[.!?](?:\s|$)/g;
    
    // Find the last complete sentence
    let lastIndex = -1;
    let match;
    
    while ((match = sentenceEndings.exec(text)) !== null) {
      lastIndex = match.index + 1; // +1 to include the punctuation
    }
    
    // If no complete sentence is found, use the whole text
    if (lastIndex === -1) {
      return text;
    }
    
    // Otherwise, return up to the end of the last complete sentence
    return text.substring(0, lastIndex + 1).trim();
  }, []);
  
  // Function to analyze text for vibe
  const analyzeText = useCallback(
    async (text: string) => {
      if (!text.trim()) {
        setVibe({
          score: 0,
          reason: 'No text to analyze',
        });
        setLastAnalyzedText('');
        return;
      }
      
      // Get the current passage (complete sentences)
      const currentPassage = getCurrentPassage(text);
      
      // Only analyze if the complete sentence portion has changed
      if (currentPassage === lastAnalyzedText) {
        return;
      }
      
      try {
        console.log('Analyzing text:', currentPassage.substring(0, 50) + '...');
        
        // Regular analysis for both modes now
        const result: VibeAnalysis = await await api.analyzeText(currentPassage);
        
        // Log the response from Claude to debug
        console.log('Analysis result:', result);
        
        // Make sure we have a valid reason
        if (!result.reason || result.reason === 'Generated fallback response from non-JSON output' || result.reason === "DriftingNeutralFlowing") {
          console.warn('Missing or invalid reason from API, using placeholder');
          // Generate a better reason based on the score
          if (result.score >= 0.5) {
            result.reason = 'Your writing has a strong, inspiring energy that deeply engages readers.';
          } else if (result.score >= 0.2) {
            result.reason = 'Your narrative flows well and maintains reader interest throughout.';
          } else if (result.score >= -0.2) {
            result.reason = 'Your writing maintains a steady, neutral tone that could benefit from more emotional resonance.';
          } else if (result.score >= -0.5) {
            result.reason = 'The narrative feels somewhat flat and could use more dynamic elements to engage readers.';
          } else {
            result.reason = 'Your writing lacks emotional connection and could benefit from more vivid language and personal touches.';
          }
        }
        
        // Only update if we have a meaningful response
        if (result.reason !== 'Error with cloud API' && result.reason !== 'API error') {
          setVibe(result);
          setLastAnalyzedText(currentPassage);
        } else {
          console.error('API error in analysis:', result);
        }
      } catch (err) {
        console.error('Error analyzing text:', err);
        // Don't show an error to the user, just log it
      }
    },
    [lastAnalyzedText, getCurrentPassage, setVibe]
  );
  
  // Removed old getWritingSuggestion function - now handled by WritingCoach
  
  // Function to analyze selected text
  const analyzeSelectedText = useCallback(
    debounce(async (text: string) => {
      if (!text.trim()) {
        setSelectionVibe(null);
        return;
      }
      
      try {
        setIsAnalyzingSelection(true);
        const result: VibeAnalysis = await await api.analyzeText(text);
        
        // Make sure the reason is valid
        if (!result.reason || result.reason === 'Generated fallback response from non-JSON output' || result.reason === "DriftingNeutralFlowing") {
          // Generate a better reason based on the score
          if (result.score >= 0.5) {
            result.reason = 'This passage has exceptional energy and emotional resonance.';
          } else if (result.score >= 0.2) {
            result.reason = 'This selection engages well with vivid language and good pacing.';
          } else if (result.score >= -0.2) {
            result.reason = 'This passage is neutral but could use more dynamic elements.';
          } else if (result.score >= -0.5) {
            result.reason = 'This selection feels flat and needs more life and energy.';
          } else {
            result.reason = 'This passage lacks engagement and emotional connection.';
          }
        }
        
        setSelectionVibe(result);
        
        // Show writing coach in vibe mode
        if (writingMode === WritingMode.VIBE && text.length > 20) {
          setShowWritingCoach(true);
        }
      } catch (err) {
        console.error('Error analyzing selected text:', err);
      } finally {
        setIsAnalyzingSelection(false);
      }
    }, 300),
    [writingMode]
  );
  
  // Handle text selection change
  const handleSelectionChange = useCallback(
    (selection: string) => {
      setSelectedText(selection);
      if (selection) {
        analyzeSelectedText(selection);
      } else {
        setSelectionVibe(null);
        setShowWritingCoach(false);
      }
    },
    [analyzeSelectedText]
  );
  
  // Removed old writing suggestion useEffect
  
  // Handle editor text changes - we debounce slightly to avoid too many API calls
  const handleTextChange = useCallback(
    debounce((text: string) => {
      setEditorText(text);
      
      // More robust word count calculation
      const cleanText = text.replace(/<[^>]*>/g, ' '); // Remove HTML tags
      const words = cleanText.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
      
      analyzeText(text);
    }, 300),
    [analyzeText]
  );
  
  // Format timestamp
  const formatDate = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };
  
  // Selection floating UI
  const SelectionVibe = useCallback(() => {
    if (!selectedText || !selectionVibe) return null;
    
    return (
      <div className="selection-vibe-popup">
        <div className="selection-vibe-content">
          <div className="selection-vibe-score">
            <span className={selectionVibe.score >= 0 ? 'text-blue-500' : 'text-gray-500'}>
              {selectionVibe.score.toFixed(2)}
            </span>
            <span className="selection-vibe-label">
              {selectionVibe.score > 0.3 ? 'Engaging' : 
               selectionVibe.score < -0.3 ? 'Disengaging' : 'Neutral'}
            </span>
          </div>
          {selectionVibe.reason && (
            <div className="selection-vibe-reason">
              {selectionVibe.reason}
            </div>
          )}
        </div>
      </div>
    );
  }, [selectedText, selectionVibe]);

  // Start session when component mounts
  useEffect(() => {
    startSession();
    
    return () => {
      endSession();
    };
  }, [startSession, endSession]);

  // Track flow state - Fixed to prevent infinite loops
  useEffect(() => {
    if (!sessionStats || !vibe) return;
    
    // Use a timeout to debounce updates and prevent rapid state changes
    const timeoutId = setTimeout(() => {
      // Update session stats with vibe progression
      const currentStats = { ...sessionStats };
      const now = new Date();
      
      // Initialize vibeProgression if needed
      if (!currentStats.vibeProgression) {
        currentStats.vibeProgression = [];
      }
      
      // Only add new vibe score if it's different from the last one
      const lastVibeScore = currentStats.vibeProgression.length > 0 
        ? currentStats.vibeProgression[currentStats.vibeProgression.length - 1].score 
        : null;
        
      if (lastVibeScore === null || Math.abs(lastVibeScore - vibe.score) > 0.01) {
        currentStats.vibeProgression.push({ time: now, score: vibe.score });
        
        // Update flow duration if in flow state (vibe > 0.2)
        if (vibe.score > 0.2) {
          const lastCheck = currentStats.vibeProgression.length > 1 
            ? currentStats.vibeProgression[currentStats.vibeProgression.length - 2].time
            : currentStats.startTime;
          const timeDiff = (now.getTime() - new Date(lastCheck).getTime()) / 1000 / 60; // in minutes
          currentStats.flowDuration = (currentStats.flowDuration || 0) + timeDiff;
        }
      }
      
      // Update word count diff
      const currentWordCount = editorText.split(/\s+/).filter(word => word.length > 0).length;
      
      // The sessionStats.initialWordCount stores the initial word count when session started
      // So we need to track how many words were written since session start
      const initialWordCount = sessionStats.initialWordCount || 0;
      const wordsWrittenInSession = currentWordCount - initialWordCount;
      
      // Store the words written in this session (not the total word count)
      currentStats.wordCount = wordsWrittenInSession;
      
      // Only update if something actually changed
      if (JSON.stringify(currentStats) !== JSON.stringify(sessionStats)) {
        updateSessionStats(currentStats);
      }
    }, 1000); // 1 second debounce
    
    return () => clearTimeout(timeoutId);
  }, [vibe, editorText, updateSessionStats]); // Removed sessionStats from dependencies

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + R for reading mode
      if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault();
        toggleReadingMode();
      }
      // Ctrl/Cmd + . for focus mode
      if ((event.ctrlKey || event.metaKey) && event.key === '.') {
        event.preventDefault();
        useEditorStore.getState().setFocusSettings({ 
          enabled: !useEditorStore.getState().focusSettings.enabled 
        });
      }
      // Escape to exit reading mode
      if (event.key === 'Escape' && showReadingMode) {
        toggleReadingMode();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showReadingMode, toggleReadingMode]);

  // Update ambient mode colors based on vibe
  useEffect(() => {
    if (focusSettings.ambientMode && vibe) {
      // Set CSS variable for ambient mode
      document.documentElement.style.setProperty('--vibe-score', vibe.score.toString());
      
      // Calculate the ambient color based on vibe score
      let ambientColor = 'rgba(156, 163, 175, 0.04)'; // neutral
      
      if (vibe.score >= 0.5) {
        ambientColor = 'rgba(52, 211, 153, 0.08)'; // very positive - green
      } else if (vibe.score >= 0.2) {
        ambientColor = 'rgba(59, 130, 246, 0.06)'; // positive - blue
      } else if (vibe.score <= -0.5) {
        ambientColor = 'rgba(239, 68, 68, 0.08)'; // very negative - red
      } else if (vibe.score <= -0.2) {
        ambientColor = 'rgba(251, 146, 60, 0.06)'; // negative - orange
      }
      
      document.documentElement.style.setProperty('--vibe-color-ambient', ambientColor);
    }
  }, [vibe, focusSettings.ambientMode]);

  // Add loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full"></div>
          </div>
          <p className="text-gray-600">Loading your draft...</p>
        </div>
      </div>
    );
  }

  // Add error screen
  if (error && !content) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-500 text-2xl">!</span>
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-2">Unable to Load Draft</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Drafts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-white ${writingMode === WritingMode.VIBE ? 'vibe-progression-enabled' : ''} ${focusSettings.enabled ? 'focus-mode-enabled' : ''} ${focusSettings.hideUI ? 'hide-ui' : ''} ${focusSettings.ambientMode ? 'ambient-mode' : ''}`}>
      {/* Reading Mode Overlay */}
      {showReadingMode && <ReadingMode />}
      
      <header className={`app-header-redesigned ${focusSettings.hideUI ? 'hidden' : ''}`}>
        <div className="header-top-row">
          {/* Left: Back button and title */}
          <div className="header-left-section">
            <button
              onClick={onBack}
              className="back-button"
              aria-label="Back to drafts"
            >
              ←
            </button>
            <input
              type="text"
              value={metadata.title}
              onChange={(e) => updateMetadataField('title', e.target.value)}
              className="title-input-redesigned"
              placeholder="Untitled"
            />
          </div>
          
          {/* Center: Mode toggle, focus mode, and vibe meter combined */}
          <div className="header-center-section">
            <ModeToggle />
            <FocusModeToggle />
            <button
              onClick={toggleReadingMode}
              className="reading-mode-button"
              title="Reading Mode (Ctrl+R)"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </button>
            {writingMode === WritingMode.VIBE && vibe && (
              <div className="vibe-meter-inline">
                <VibeMeter score={vibe.score} reason="" />
              </div>
            )}
          </div>
          
          {/* Right: Word count and actions */}
          <div className="header-right-section">
            <span className="word-count-redesigned">{wordCount} words</span>
            
            {/* Options dropdown */}
            <div className="relative" ref={optionsMenuRef}>
              <button
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                className="options-button"
                aria-label="Options"
                title="More options (•••)"
              >
                •••
              </button>
              
              {showOptionsMenu && (
                <div className="options-dropdown" role="menu">
                  <button
                    onClick={() => exportDraft('md')}
                    className="option-item"
                    role="menuitem"
                  >
                    Export as Markdown
                  </button>
                  <button
                    onClick={() => exportDraft('txt')}
                    className="option-item"
                    role="menuitem"
                  >
                    Export as Text
                  </button>
                  <button
                    onClick={loadVersionHistory}
                    className="option-item"
                    role="menuitem"
                  >
                    Version History
                  </button>
                </div>
              )}
            </div>
            
            <button 
              onClick={saveDraft}
              className={`save-button-redesigned ${
                saving ? 'saving' : hasUnsavedChanges() ? 'unsaved' : 'saved'
              }`}
            >
              {saving ? 'Saving...' : hasUnsavedChanges() ? 'Save' : 'Saved'}
            </button>
          </div>
        </div>
        
        {/* Vibe reason text below header */}
        {writingMode === WritingMode.VIBE && vibe && vibe.reason && (
          <div className="vibe-reason-bar">
            <p className="vibe-reason-text">{vibe.reason}</p>
          </div>
        )}
      </header>
      
      {error && (
        <div className="bg-red-50 text-red-500 p-2 text-center text-sm max-w-[750px] mx-auto my-2">
          {error}
        </div>
      )}
      
      <main className={`editor-container ${focusSettings.typewriterMode ? 'typewriter-mode' : ''} ${focusSettings.lineHighlight ? 'line-highlight' : ''}`}>
        <Editor 
          onTextChange={handleTextChange}
          onSelectionChange={handleSelectionChange}
        />
      </main>
      
      {/* Version history panel */}
      {showVersions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Version History</h2>
              <button
                onClick={() => setShowVersions(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            {loadingVersions ? (
              <div className="text-center py-8 text-gray-500">Loading versions...</div>
            ) : versions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No previous versions found</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {versions.map((version) => (
                  <li key={version.id} className="py-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{version.title || "Untitled"}</div>
                        <div className="text-sm text-gray-400">
                          {formatDate(version.timestamp)}
                        </div>
                      </div>
                      <button
                        onClick={() => restoreVersion(version.id)}
                        className="px-3 py-1.5 text-xs bg-indigo-500 text-white rounded hover:bg-indigo-600"
                      >
                        Restore
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      
      {/* Writing Coach - Unified interface for selection analysis */}
      {/* Temporarily simplified for debugging - just need selectedText and vibe mode */}
      {writingMode === WritingMode.VIBE && selectedText && selectedText.length > 20 && (
        <WritingCoach
          selectedText={selectedText}
          vibeScore={selectionVibe?.score || 0.5}
          vibeReason={selectionVibe?.reason || 'Analyzing...'}
          onClose={() => {
            setSelectedText('');
            setSelectionVibe(null);
            setShowWritingCoach(false);
          }}
          isLoading={isAnalyzingSelection}
        />
      )}
      
      {writingMode === WritingMode.VIBE && isAnalyzingSelection && selectedText && !selectionVibe && (
        <div className="selection-analyzing">
          Analyzing selection...
        </div>
      )}
    </div>
  );
}; 