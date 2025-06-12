import React from 'react';
import { useEditorStore } from '../store';
import { WritingMode } from '@/types';

export const ModeToggle: React.FC = () => {
  const { writingMode, setWritingMode } = useEditorStore();

  const handleModeChange = (mode: WritingMode) => {
    setWritingMode(mode);
  };

  return (
    <div className="mode-toggle">
      <div className="mode-toggle-buttons">
        <button
          className={`mode-button ${writingMode === WritingMode.WRITER ? 'active' : ''}`}
          onClick={() => handleModeChange(WritingMode.WRITER)}
          title="Writer Mode - Focus on writing without distractions"
          aria-label="Writer Mode"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14"></path>
            <path d="M5 12h14"></path>
          </svg>
          <span>Writer</span>
        </button>
        
        <button
          className={`mode-button ${writingMode === WritingMode.VIBE ? 'active' : ''}`}
          onClick={() => handleModeChange(WritingMode.VIBE)}
          title="Vibe Mode - Show vibe meters"
          aria-label="Vibe Mode"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
          </svg>
          <span>Vibe</span>
        </button>
      </div>
    </div>
  );
}; 