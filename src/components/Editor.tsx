import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { useEditorStore } from '../store';

interface EditorProps {
  onTextChange?: (text: string) => void;
  onSelectionChange?: (selection: string) => void;
}

export const Editor: React.FC<EditorProps> = ({ onTextChange, onSelectionChange }) => {
  const { content, setContent } = useEditorStore();
  const [selection, setSelection] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);

  // Initialize the editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
    ],
    content,
    autofocus: 'end',
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none',
      },
    },
    onCreate: ({ editor }) => {
      // Ensure editor is always focusable
      if (!editor.getText().trim()) {
        editor.commands.setContent('<p></p>');
      }
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      console.log('Editor updated:', {
        htmlLength: html.length,
        textLength: text.length
      });
      setContent(html);
      onTextChange?.(text);
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      if (from !== to) {
        const selectedText = editor.state.doc.textBetween(from, to, ' ');
        setSelection(selectedText);
        onSelectionChange?.(selectedText);
      } else {
        setSelection('');
        onSelectionChange?.('');
      }
    },
  });

  // Handle clicks to clear selection when clicking in the editor
  useEffect(() => {
    if (!editor) return;

    // This handles clicks inside the editor which should clear selection
    const handleClick = () => {
      if (selection && editor.state.selection.empty) {
        setSelection('');
        onSelectionChange?.('');
      }
    };

    // Add event listener to the editor DOM element
    const editorElement = document.querySelector('.ProseMirror');
    if (editorElement) {
      editorElement.addEventListener('click', handleClick);
    }

    // Handle clicks outside the editor that should also clear selection
    const handleDocumentClick = (event: MouseEvent) => {
      if (!selection) return;
      
      const target = event.target as Node;
      const editorContainer = document.querySelector('.editor-container');
      
      // If we have an editor container and the click is outside it, clear selection
      if (editorContainer && !editorContainer.contains(target)) {
        // Check if we're clicking on the selection vibe popup
        const selectionVibePopup = document.querySelector('.selection-vibe');
        // Only clear if we're not clicking on the popup (if it exists)
        if (!selectionVibePopup || !selectionVibePopup.contains(target)) {
          setSelection('');
          onSelectionChange?.('');
        }
      }
    };

    document.addEventListener('mousedown', handleDocumentClick);
    
    return () => {
      if (editorElement) {
        editorElement.removeEventListener('click', handleClick);
      }
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, [editor, selection, onSelectionChange]);

  // Update editor content when store content changes (e.g., when loading a draft)
  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      console.log('Updating editor content from store:', {
        editorContentLength: editor.getHTML().length,
        storeContentLength: content.length
      });
      editor.commands.setContent(content, false);
    }
  }, [editor, content]);

  // Set up keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+S or Cmd+S to save
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        document.dispatchEvent(new CustomEvent('editor:save'));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Formatting toolbar
  const Toolbar = useCallback(() => {
    if (!editor) return null;

    return (
      <div className="editor-toolbar">
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`toolbar-button ${editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}`}
          title="Heading 1"
        >
          <span className="text-button">H1</span>
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`toolbar-button ${editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}`}
          title="Heading 2"
        >
          <span className="text-button">H2</span>
        </button>
        
        <span className="toolbar-divider"></span>
        
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`toolbar-button ${editor.isActive('bold') ? 'is-active' : ''}`}
          title="Bold (Ctrl+B)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
            <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
          </svg>
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`toolbar-button ${editor.isActive('italic') ? 'is-active' : ''}`}
          title="Italic (Ctrl+I)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="4" x2="10" y2="4"></line>
            <line x1="14" y1="20" x2="5" y2="20"></line>
            <line x1="15" y1="4" x2="9" y2="20"></line>
          </svg>
        </button>
        
        <span className="toolbar-divider"></span>
        
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`toolbar-button ${editor.isActive('bulletList') ? 'is-active' : ''}`}
          title="Bullet List"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`toolbar-button ${editor.isActive('orderedList') ? 'is-active' : ''}`}
          title="Numbered List"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="10" y1="6" x2="21" y2="6"></line>
            <line x1="10" y1="12" x2="21" y2="12"></line>
            <line x1="10" y1="18" x2="21" y2="18"></line>
            <path d="M4 6h1v4"></path>
            <path d="M4 10h2"></path>
            <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path>
          </svg>
        </button>
        
        <span className="toolbar-divider"></span>
        
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`toolbar-button ${editor.isActive('blockquote') ? 'is-active' : ''}`}
          title="Quote"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
            <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
          </svg>
        </button>
        
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="toolbar-button"
          title="Horizontal Rule"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>
    );
  }, [editor]);

  return (
    <div className="editor-container" ref={editorRef}>
      <div className="floating-sidebar">
        <Toolbar />
      </div>
      <div className="editor-content">
        {(!editor || !editor.getText().trim()) && (
          <div className="editor-placeholder">
            <p>Start writing...</p>
          </div>
        )}
        <EditorContent 
          editor={editor} 
          className="prose prose-lg max-w-none focus:outline-none" 
        />
      </div>
      
      {/* Add CSS for sentence markers and placeholder */}
      <style dangerouslySetInnerHTML={{__html: `
        .editor-placeholder {
          position: absolute;
          top: 56px;
          left: 72px;
          color: #9CA3AF;
          font-size: 21px;
          font-family: 'EB Garamond', Georgia, serif;
          pointer-events: none;
          z-index: 1;
        }
        
        .editor-placeholder p {
          margin: 0;
          font-style: italic;
        }
        
        .ProseMirror:focus + .editor-placeholder,
        .ProseMirror:not(:empty) + .editor-placeholder {
          display: none;
        }
        
        .sentence-vibe-marker {
          position: absolute;
          left: -70px;
          background: white;
          border-radius: 12px;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 600;
          font-family: 'Space Mono', monospace;
          box-shadow: 
            0 2px 12px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
          display: flex;
          align-items: center;
          gap: 6px;
          opacity: 0.7;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          white-space: nowrap;
        }
        
        .sentence-vibe-marker:hover {
          opacity: 1;
          transform: translateX(2px) scale(1.05);
        }
        
        .sentence-vibe-marker.positive {
          color: #34D399;
          border: 1px solid rgba(52, 211, 153, 0.2);
          background: linear-gradient(135deg, rgba(52, 211, 153, 0.05), white);
        }
        
        .sentence-vibe-marker.negative {
          color: #FB923C;
          border: 1px solid rgba(251, 146, 60, 0.2);
          background: linear-gradient(135deg, rgba(251, 146, 60, 0.05), white);
        }
        
        .sentence-vibe-marker.neutral {
          color: #94A3B8;
          border: 1px solid rgba(148, 163, 184, 0.2);
        }
      `}} />
    </div>
  );
};
 