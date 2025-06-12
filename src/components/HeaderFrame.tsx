import React from 'react';
import { ModeToggle } from './ModeToggle';
import { VibeMeter } from './VibeMeter';
import { useEditorStore } from '../store';
import { WritingMode } from '@/types';

interface HeaderFrameProps {
  title: string;
  onTitleChange: (title: string) => void;
  wordCount: number;
  onBack: () => void;
  onSave: () => void;
  isSaving: boolean;
  hasChanges: boolean;
  onShowVersions: () => void;
  onExport: (format: 'md' | 'txt') => void;
}

export const HeaderFrame: React.FC<HeaderFrameProps> = ({
  title,
  onTitleChange,
  wordCount,
  onBack,
  onSave,
  isSaving,
  hasChanges,
  onShowVersions,
  onExport
}) => {
  const { vibe, writingMode } = useEditorStore();
  const [showOptionsMenu, setShowOptionsMenu] = React.useState(false);
  const optionsMenuRef = React.useRef<HTMLDivElement>(null);

  // Effect to close the options menu when clicking outside
  React.useEffect(() => {
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

  return (
    <>
      <div className="app-header">
        <div className="app-header-content">
          {/* Left section - back button and title */}
          <div className="header-left">
            <button
              onClick={onBack}
              className="text-gray-400 hover:text-gray-800 transition-colors"
              aria-label="Back to drafts"
            >
              ←
            </button>
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="title-input"
              placeholder="Title your draft..."
            />
          </div>

          {/* Center section - mode toggle only */}
          <div className="header-center">
            <ModeToggle />
          </div>

          {/* Right section - word count, options, and save */}
          <div className="header-right">
            <span className="word-count">{wordCount} words</span>
            
            {/* Options dropdown */}
            <div className="relative" ref={optionsMenuRef}>
              <button
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                className="text-gray-400 hover:text-gray-800 transition-colors"
                aria-label="Options"
              >
                •••
              </button>
              
              {showOptionsMenu && (
                <div className="options-menu">
                  <button
                    onClick={() => { 
                      onExport('md');
                      setShowOptionsMenu(false);
                    }}
                    className="options-item"
                  >
                    Export as Markdown
                  </button>
                  <button
                    onClick={() => {
                      onExport('txt');
                      setShowOptionsMenu(false);
                    }}
                    className="options-item"
                  >
                    Export as Text
                  </button>
                  <button
                    onClick={() => {
                      onShowVersions();
                      setShowOptionsMenu(false);
                    }}
                    className="options-item"
                  >
                    Version History
                  </button>
                </div>
              )}
            </div>
            
            <button 
              onClick={onSave}
              className={`save-button ${
                isSaving ? 
                'bg-blue-100 text-blue-600' : 
                hasChanges ? 
                'bg-blue-500 text-white hover:bg-blue-600' : 
                'bg-gray-100 text-gray-500'
              }`}
            >
              {isSaving ? 'Saving...' : hasChanges ? 'Save' : 'Saved'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Show VibeMeter below header in Vibe mode */}
      {writingMode === WritingMode.VIBE && vibe && (
        <div className="vibe-meter-container">
          <VibeMeter score={vibe.score} reason={vibe.reason} />
        </div>
      )}
    </>
  );
}; 