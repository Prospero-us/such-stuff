import React, { useState, useRef, useEffect } from 'react';
import { useEditorStore } from '../store';

export const FocusModeToggle: React.FC = () => {
  const { focusSettings, setFocusSettings } = useEditorStore();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleFocus = () => {
    setFocusSettings({ enabled: !focusSettings.enabled });
  };

  return (
    <div className="focus-mode-toggle" ref={menuRef}>
      <button
        className={`focus-toggle-button ${focusSettings.enabled ? 'active' : ''}`}
        onClick={toggleFocus}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowMenu(!showMenu);
        }}
        title="Focus Mode (Right-click for options)"
      >
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
        </svg>
      </button>

      {showMenu && (
        <div className="focus-mode-menu">
          <div className="focus-menu-item">
            <label>
              <input
                type="checkbox"
                checked={focusSettings.typewriterMode}
                onChange={(e) => setFocusSettings({ typewriterMode: e.target.checked })}
              />
              <span>Typewriter Mode</span>
              <small>Keep current line centered</small>
            </label>
          </div>

          <div className="focus-menu-item">
            <label>
              <input
                type="checkbox"
                checked={focusSettings.hideUI}
                onChange={(e) => setFocusSettings({ hideUI: e.target.checked })}
              />
              <span>Hide UI Elements</span>
              <small>Only show text editor</small>
            </label>
          </div>

          <div className="focus-menu-item">
            <label>
              <input
                type="checkbox"
                checked={focusSettings.ambientMode}
                onChange={(e) => setFocusSettings({ ambientMode: e.target.checked })}
              />
              <span>Ambient Mode</span>
              <small>Subtle background based on vibe</small>
            </label>
          </div>

          <div className="focus-menu-item">
            <label>
              <input
                type="checkbox"
                checked={focusSettings.lineHighlight}
                onChange={(e) => setFocusSettings({ lineHighlight: e.target.checked })}
              />
              <span>Highlight Current Line</span>
              <small>Subtle highlight on active line</small>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}; 