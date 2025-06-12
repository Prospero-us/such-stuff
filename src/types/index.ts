// Types for Flow web application
// API calls are now handled through the API client instead of window.electronAPI

// Electron window API exposed by preload


// Vibe analysis result
export interface VibeAnalysis {
  score: number;  // Between -1 and 1
  reason: string; // Brief explanation
  error?: string; // Optional error message
}

// Sentence vibe data
export interface SentenceVibe {
  text: string;
  score: number;
  delta: number;
  startPos: number;
  endPos: number;
  reason?: string;
}

// Vibe progression result
export interface VibeProgressionResult {
  overall: VibeAnalysis;
  sentences: SentenceVibe[];
  error?: string;
}

// Draft metadata
export interface DraftMetadata {
  title: string;
  createdAt: string;
  updatedAt: string;
  lastVibe?: number;  // Last vibe score
  vibeHistory?: VibeRecord[];  // History of vibe scores
  versions?: VersionInfo[];  // Version history
  restoredFrom?: {  // If restored from a version
    versionId: string;
    timestamp: string;
    restoredAt: string;
  };
}

// Version info
export interface VersionInfo {
  id: string;
  timestamp: string;
  title: string;
}

// Vibe history record
export interface VibeRecord {
  timestamp: string;
  score: number;
  reason?: string;
}

// Draft summary
export interface DraftSummary extends DraftMetadata {
  id: string;
}

// Save result
export interface SaveResult {
  success: boolean;
  id?: string;
  error?: string;
}

// Load result
export interface LoadResult {
  success: boolean;
  content?: string;
  metadata?: DraftMetadata;
  error?: string;
}

// List drafts result
export interface ListDraftsResult {
  success: boolean;
  drafts?: DraftSummary[];
  error?: string;
}

// Export result
export interface ExportResult {
  success: boolean;
  path?: string;
  error?: string;
}

// Versions result
export interface VersionsResult {
  success: boolean;
  versions?: VersionInfo[];
  error?: string;
}

// Delete result
export interface DeleteResult {
  success: boolean;
  error?: string;
}

// Writing mode enum
export enum WritingMode {
  WRITER = 'writer',
  VIBE = 'vibe',
}

// New types for enhanced UX features
export interface FocusSettings {
  enabled: boolean;
  typewriterMode: boolean;
  hideUI: boolean;
  ambientMode: boolean;
  lineHighlight: boolean;
}

export interface SessionStats {
  startTime: Date;
  endTime?: Date;
  wordCount: number; // Words written during session
  initialWordCount: number; // Word count when session started
  vibeProgression: Array<{ time: Date; score: number }>;
  flowDuration: number; // minutes in flow state
  averageVibe: number;
}

export interface ReadingModeSettings {
  enabled: boolean;
  fontFamily: 'serif' | 'sans-serif' | 'mono';
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  lineHeight: 'tight' | 'normal' | 'relaxed';
  maxWidth: 'narrow' | 'medium' | 'wide';
  theme: 'light' | 'dark' | 'sepia';
}

export {}; 