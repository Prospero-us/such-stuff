import React, { useEffect, useState } from 'react';
import { useEditorStore } from '../store';

export const ReadingMode: React.FC = () => {
  const { 
    content, 
    metadata, 
    toggleReadingMode, 
    readingModeSettings,
    setReadingModeSettings 
  } = useEditorStore();
  
  const [plainText, setPlainText] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Convert HTML content to plain text for reading mode
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    // Convert to markdown-like format for better reading
    let text = tempDiv.innerHTML;
    
    // Convert headers
    text = text.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\n# $1\n');
    text = text.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n## $1\n');
    text = text.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n### $1\n');
    
    // Convert paragraphs
    text = text.replace(/<p[^>]*>/gi, '\n');
    text = text.replace(/<\/p>/gi, '\n');
    
    // Convert lists
    text = text.replace(/<li[^>]*>(.*?)<\/li>/gi, '• $1\n');
    text = text.replace(/<ul[^>]*>|<\/ul>|<ol[^>]*>|<\/ol>/gi, '');
    
    // Convert blockquotes
    text = text.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '\n> $1\n');
    
    // Remove remaining HTML tags
    text = text.replace(/<[^>]*>/g, '');
    
    // Clean up extra whitespace
    text = text.replace(/\n{3,}/g, '\n\n');
    text = text.trim();
    
    setPlainText(text);
  }, [content]);

  const getFontSizeClass = () => {
    switch (readingModeSettings.fontSize) {
      case 'small': return 'text-base';
      case 'medium': return 'text-lg';
      case 'large': return 'text-xl';
      case 'xlarge': return 'text-2xl';
      default: return 'text-xl';
    }
  };

  const getLineHeightClass = () => {
    switch (readingModeSettings.lineHeight) {
      case 'tight': return 'leading-snug';
      case 'normal': return 'leading-normal';
      case 'relaxed': return 'leading-relaxed';
      default: return 'leading-relaxed';
    }
  };

  const getMaxWidthClass = () => {
    switch (readingModeSettings.maxWidth) {
      case 'narrow': return 'max-w-2xl';
      case 'medium': return 'max-w-4xl';
      case 'wide': return 'max-w-6xl';
      default: return 'max-w-2xl';
    }
  };

  const getThemeClass = () => {
    switch (readingModeSettings.theme) {
      case 'dark': return 'reading-mode-dark';
      case 'sepia': return 'reading-mode-sepia';
      default: return 'reading-mode-light';
    }
  };

  const getFontFamilyClass = () => {
    switch (readingModeSettings.fontFamily) {
      case 'serif': return 'font-serif';
      case 'mono': return 'font-mono';
      default: return 'font-sans';
    }
  };

  return (
    <div className={`reading-mode ${getThemeClass()}`}>
      <div className="reading-mode-header">
        <button
          className="reading-mode-close"
          onClick={toggleReadingMode}
          title="Exit Reading Mode (Esc)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
        
        <h1 className="reading-mode-title">{metadata.title || 'Untitled'}</h1>
        
        <button
          className="reading-mode-settings-toggle"
          onClick={() => setShowSettings(!showSettings)}
          title="Reading Settings"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
          </svg>
        </button>
      </div>

      {showSettings && (
        <div className="reading-mode-settings">
          <div className="settings-group">
            <label>Font</label>
            <select 
              value={readingModeSettings.fontFamily}
              onChange={(e) => setReadingModeSettings({ fontFamily: e.target.value as any })}
            >
              <option value="serif">Serif</option>
              <option value="sans-serif">Sans-serif</option>
              <option value="mono">Monospace</option>
            </select>
          </div>

          <div className="settings-group">
            <label>Size</label>
            <select 
              value={readingModeSettings.fontSize}
              onChange={(e) => setReadingModeSettings({ fontSize: e.target.value as any })}
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="xlarge">Extra Large</option>
            </select>
          </div>

          <div className="settings-group">
            <label>Line Height</label>
            <select 
              value={readingModeSettings.lineHeight}
              onChange={(e) => setReadingModeSettings({ lineHeight: e.target.value as any })}
            >
              <option value="tight">Tight</option>
              <option value="normal">Normal</option>
              <option value="relaxed">Relaxed</option>
            </select>
          </div>

          <div className="settings-group">
            <label>Width</label>
            <select 
              value={readingModeSettings.maxWidth}
              onChange={(e) => setReadingModeSettings({ maxWidth: e.target.value as any })}
            >
              <option value="narrow">Narrow</option>
              <option value="medium">Medium</option>
              <option value="wide">Wide</option>
            </select>
          </div>

          <div className="settings-group">
            <label>Theme</label>
            <select 
              value={readingModeSettings.theme}
              onChange={(e) => setReadingModeSettings({ theme: e.target.value as any })}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="sepia">Sepia</option>
            </select>
          </div>
        </div>
      )}

      <div className={`reading-mode-content ${getMaxWidthClass()} ${getFontSizeClass()} ${getLineHeightClass()} ${getFontFamilyClass()}`}>
        <div className="reading-mode-text">
          {plainText.split('\n').map((paragraph, index) => {
            if (paragraph.startsWith('# ')) {
              return <h1 key={index}>{paragraph.substring(2)}</h1>;
            } else if (paragraph.startsWith('## ')) {
              return <h2 key={index}>{paragraph.substring(3)}</h2>;
            } else if (paragraph.startsWith('### ')) {
              return <h3 key={index}>{paragraph.substring(4)}</h3>;
            } else if (paragraph.startsWith('> ')) {
              return <blockquote key={index}>{paragraph.substring(2)}</blockquote>;
            } else if (paragraph.startsWith('• ')) {
              return <li key={index}>{paragraph.substring(2)}</li>;
            } else if (paragraph.trim()) {
              return <p key={index}>{paragraph}</p>;
            }
            return null;
          })}
        </div>
        
        <div className="reading-mode-stats">
          <div className="stat">
            <span className="stat-label">Words</span>
            <span className="stat-value">{plainText.split(/\s+/).filter(w => w.length > 0).length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Reading Time</span>
            <span className="stat-value">{Math.ceil(plainText.split(/\s+/).filter(w => w.length > 0).length / 200)} min</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 