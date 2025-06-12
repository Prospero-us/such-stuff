import { create } from 'zustand';
import { DraftMetadata, VibeAnalysis, VibeRecord, WritingMode, FocusSettings, SessionStats, ReadingModeSettings } from './types';

interface EditorState {
  // Editor content
  content: string;
  setContent: (content: string) => void;
  
  // Current draft
  currentDraftId: string | null;
  setCurrentDraftId: (id: string | null) => void;
  
  // Draft metadata
  metadata: DraftMetadata;
  setMetadata: (metadata: DraftMetadata) => void;
  updateMetadataField: <K extends keyof DraftMetadata>(key: K, value: DraftMetadata[K]) => void;
  
  // Vibe analysis
  vibe: VibeAnalysis | null;
  setVibe: (vibe: VibeAnalysis) => void;
  
  // Vibe history (last 10 scores)
  vibeHistory: VibeRecord[];
  addVibeRecord: (record: VibeRecord) => void;
  
  // Writing Mode
  writingMode: WritingMode;
  setWritingMode: (mode: WritingMode) => void;
  
  // Save status
  lastSavedContent: string;
  lastSavedAt: Date | null;
  setLastSaved: (content: string) => void;
  hasUnsavedChanges: () => boolean;
  
  // Reset the editor state for a new document
  resetState: () => void;
  
  // New state properties
  focusSettings: FocusSettings;
  setFocusSettings: (settings: Partial<FocusSettings>) => void;
  
  readingModeSettings: ReadingModeSettings;
  setReadingModeSettings: (settings: Partial<ReadingModeSettings>) => void;
  
  sessionStats: SessionStats | null;
  startSession: () => void;
  endSession: () => void;
  updateSessionStats: (stats: Partial<SessionStats>) => void;
  
  showReadingMode: boolean;
  toggleReadingMode: () => void;
}

// Default metadata for a new draft
const createDefaultMetadata = (): DraftMetadata => ({
  title: 'Untitled Draft',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  vibeHistory: [],
});

// Create the store
export const useEditorStore = create<EditorState>((set, get) => ({
  // Editor content
  content: '',
  setContent: (content) => set({ content }),
  
  // Current draft
  currentDraftId: null,
  setCurrentDraftId: (id) => set({ currentDraftId: id }),
  
  // Draft metadata
  metadata: createDefaultMetadata(),
  setMetadata: (metadata) => set({ metadata }),
  updateMetadataField: (key, value) => set((state) => ({
    metadata: {
      ...state.metadata,
      [key]: value,
      updatedAt: new Date().toISOString(),
    },
  })),
  
  // Vibe analysis
  vibe: null,
  setVibe: (vibe) => {
    set({ vibe });
    
    // Add to vibe history if score is available
    if (vibe && typeof vibe.score === 'number') {
      const record: VibeRecord = {
        timestamp: new Date().toISOString(),
        score: vibe.score,
        reason: vibe.reason,
      };
      
      get().addVibeRecord(record);
      
      // Update the last vibe in metadata
      set((state) => ({
        metadata: {
          ...state.metadata,
          lastVibe: vibe.score,
          updatedAt: new Date().toISOString(),
        },
      }));
    }
  },
  
  // Vibe history
  vibeHistory: [],
  addVibeRecord: (record) => set((state) => {
    // Add record to the beginning of the array (newest first)
    const newHistory = [record, ...state.vibeHistory].slice(0, 10);
    
    // Also update the metadata vibe history
    const updatedMetadata = {
      ...state.metadata,
      vibeHistory: newHistory,
    };
    
    return { 
      vibeHistory: newHistory,
      metadata: updatedMetadata,
    };
  }),
  
  // Writing Mode
  writingMode: WritingMode.VIBE,
  setWritingMode: (mode) => set({ writingMode: mode }),
  
  // Save status
  lastSavedContent: '',
  lastSavedAt: null,
  setLastSaved: (content) => {
    console.log('Setting lastSavedContent:', {
      oldLength: get().lastSavedContent.length,
      newLength: content.length,
      areEqual: get().lastSavedContent === content
    });
    set({ 
      lastSavedContent: content,
      lastSavedAt: new Date(),
    });
  },
  hasUnsavedChanges: () => {
    const areEqual = get().content === get().lastSavedContent;
    console.log('Checking for unsaved changes:', {
      contentLength: get().content.length,
      lastSavedContentLength: get().lastSavedContent.length,
      areEqual
    });
    return !areEqual;
  },
  
  // Reset the editor state for a new document
  resetState: () => set({
    content: '',
    currentDraftId: null,
    metadata: createDefaultMetadata(),
    vibe: null,
    vibeHistory: [],
    writingMode: WritingMode.VIBE,
    lastSavedContent: '',
    lastSavedAt: null,
  }),
  
  // New state implementations
  focusSettings: {
    enabled: false,
    typewriterMode: false,
    hideUI: false,
    ambientMode: false,
    lineHighlight: true,
  },
  
  setFocusSettings: (settings) => 
    set((state) => ({
      focusSettings: { ...state.focusSettings, ...settings }
    })),
  
  readingModeSettings: {
    enabled: false,
    fontFamily: 'serif',
    fontSize: 'large',
    lineHeight: 'relaxed',
    maxWidth: 'narrow',
    theme: 'light',
  },
  
  setReadingModeSettings: (settings) =>
    set((state) => ({
      readingModeSettings: { ...state.readingModeSettings, ...settings }
    })),
  
  sessionStats: null,
  
  startSession: () => {
    const initialWordCount = get().content.split(/\s+/).filter(word => word.length > 0).length;
    set({
      sessionStats: {
        startTime: new Date(),
        wordCount: 0, // Words written during session starts at 0
        initialWordCount, // Store the initial word count
        vibeProgression: [],
        flowDuration: 0,
        averageVibe: 0,
      }
    });
  },
  
  endSession: () => {
    const current = get().sessionStats;
    if (current) {
      set({
        sessionStats: {
          ...current,
          endTime: new Date(),
        }
      });
    }
  },
  
  updateSessionStats: (stats) => {
    set((state) => ({
      sessionStats: state.sessionStats 
        ? { ...state.sessionStats, ...stats }
        : null
    }));
  },
  
  showReadingMode: false,
  
  toggleReadingMode: () => set((state) => ({ showReadingMode: !state.showReadingMode })),
})); 