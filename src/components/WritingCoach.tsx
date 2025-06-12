import { api } from '@/lib/api';
import React, { useState, useEffect, useRef } from 'react';
import { getCoachPrompt, WRITING_TIPS } from '@/lib/writingCoachPrompts';
import { VibeAnalysis } from '@/types';

interface WritingCoachProps {
  selectedText: string;
  vibeScore: number;
  vibeReason?: string;
  onClose: () => void;
  isLoading?: boolean;
}

export const WritingCoach: React.FC<WritingCoachProps> = ({ 
  selectedText, 
  vibeScore,
  vibeReason,
  onClose,
  isLoading = false 
}) => {
  const [suggestions, setSuggestions] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('clarity'); // Start with clarity check
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const coachRef = useRef<HTMLDivElement>(null);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Handle clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (coachRef.current && !coachRef.current.contains(event.target as Node)) {
        // Don't close if clicking on the document editor
        const target = event.target as HTMLElement;
        if (!target.closest('.ProseMirror')) {
          onClose();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Get writing suggestions based on the active tab
  const getSuggestions = async (type: string) => {
    if (!selectedText || isGenerating) return;

    setIsGenerating(true);
    try {
      const prompt = getCoachPrompt(type, { score: vibeScore });
      const fullPrompt = `${prompt}\n\nNow analyze THIS SPECIFIC PASSAGE:\n\n"${selectedText}"\n\nBe completely honest - if this passage is already strong in this area, tell me why it works. If it needs improvement, give specific fixes. Don't invent problems that don't exist.`;
      
      const result: VibeAnalysis = await await api.analyzeText(fullPrompt);
      
      setSuggestions({
        type,
        content: result.reason
      });
    } catch (err) {
      console.error('Error getting suggestions:', err);
      setSuggestions({
        type,
        content: "I'm having trouble analyzing this passage right now. Try selecting a different section or refreshing."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Get suggestions when tab changes or text is selected
  useEffect(() => {
    if (selectedText && !isLoading) {
      getSuggestions(activeTab);
    }
  }, [selectedText, activeTab]);

  const tabConfig = Object.entries(WRITING_TIPS).map(([key, tip]: [string, any]) => ({
    id: key,
    label: tip.title,
    icon: tip.icon,
    description: tip.description
  }));

  const handleCopy = (text: string, index?: number) => {
    navigator.clipboard.writeText(text);
    if (index !== undefined) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  return (
    <div 
      ref={coachRef}
      className="writing-coach" 
      style={{ zIndex: 2147483647, position: 'fixed' }}
      role="dialog"
      aria-label="Writing Coach"
    >
      <div className="coach-header">
        <h3 className="coach-title">Writing Coach</h3>
        <button onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onClose();
        }} className="coach-close" type="button">×</button>
      </div>

      {/* Vibe Context */}
      <div className="vibe-context">
        <div className="vibe-indicator" style={{ 
          backgroundColor: vibeScore > 0.5 ? '#10B981' : 
                          vibeScore > 0 ? '#3B82F6' : 
                          vibeScore > -0.5 ? '#F59E0B' : '#EF4444' 
        }}>
          {vibeScore.toFixed(2)}
        </div>
        <span className="vibe-label">
          {vibeReason || (vibeScore > 0.5 ? 'Strong writing — let\'s make it stronger' : 
           vibeScore > 0 ? 'Good foundation to build on' : 
           vibeScore > -0.5 ? 'Needs work, but fixable' : 'Major issues — but every draft can improve')}
        </span>
      </div>

      {/* Tab Navigation */}
      <div className="coach-tabs">
        {tabConfig.map(tab => (
          <button
            key={tab.id}
            className={`coach-tab ${activeTab === tab.id ? 'active' : ''}`}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setActiveTab(tab.id);
            }}
            type="button"
            title={tab.description}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Suggestions Content */}
      <div className="coach-content">
        {isGenerating ? (
          <div className="coach-loading">
            <div className="loading-animation">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p>Your coach is reading...</p>
          </div>
        ) : suggestions ? (
          <div className="suggestions-container">
            {suggestions.type === 'style' && suggestions.variations ? (
              <div className="style-variations">
                {suggestions.variations.map((variation: any, index: number) => (
                  <div key={index} className="style-variation">
                    <h4>{variation.name}</h4>
                    <div className="variation-content">{variation.text}</div>
                    <button 
                      className={`copy-button ${copiedIndex === index ? 'copied' : ''}`}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleCopy(variation.text, index);
                      }}
                      type="button"
                    >
                      {copiedIndex === index ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="suggestion-content">
                <div className="coach-feedback">{suggestions.content}</div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Quick Actions */}
      <div className="coach-actions">
        <button 
          className="action-button secondary"
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (!isGenerating) {
              getSuggestions(activeTab);
            }
          }}
          disabled={isGenerating}
          type="button"
        >
          <span className="refresh-icon">🔄</span>
          New Take
        </button>
        <button 
          className="action-button primary"
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            // Copy the selected text with coach notes
            const note = `"${selectedText}"\n\n--- Coach Notes (${activeTab}) ---\n${suggestions?.content || 'No feedback yet'}`;
            navigator.clipboard.writeText(note);
          }}
          type="button"
        >
          <span className="copy-icon">📋</span>
          Copy All
        </button>
      </div>
    </div>
  );
}; 