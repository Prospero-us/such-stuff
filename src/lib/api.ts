import { supabase } from './supabase';
import { 
  VibeAnalysis, 
  DraftMetadata, 
  SaveResult, 
  LoadResult, 
  ListDraftsResult, 
  DeleteResult,
  ExportResult,
  VersionsResult,
  VibeProgressionResult 
} from '@/types';

class ApiClient {
  async analyzeText(text: string): Promise<VibeAnalysis> {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to analyze text');
    }
    
    return response.json();
  }
  
  async analyzeTextWithProgression(text: string): Promise<VibeProgressionResult> {
    const response = await fetch('/api/analyze/progression', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to analyze text progression');
    }
    
    return response.json();
  }
  
  async saveDraft(data: { id?: string; content: string; metadata: DraftMetadata }): Promise<SaveResult> {
    const response = await fetch('/api/drafts', {
      method: data.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save draft');
    }
    
    return response.json();
  }
  
  async loadDraft(id: string): Promise<LoadResult> {
    const response = await fetch(`/api/drafts/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to load draft');
    }
    
    return response.json();
  }
  
  async listDrafts(): Promise<ListDraftsResult> {
    const response = await fetch('/api/drafts');
    
    if (!response.ok) {
      throw new Error('Failed to list drafts');
    }
    
    return response.json();
  }
  
  async deleteDraft(id: string): Promise<DeleteResult> {
    const response = await fetch(`/api/drafts/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete draft');
    }
    
    return response.json();
  }
  
  async exportDraft(data: { id: string; format?: 'md' | 'txt' }): Promise<ExportResult> {
    const response = await fetch(`/api/drafts/${data.id}/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format: data.format || 'md' }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to export draft');
    }
    
    return response.json();
  }
  
  async getDraftVersions(id: string): Promise<VersionsResult> {
    const response = await fetch(`/api/drafts/${id}/versions`);
    
    if (!response.ok) {
      throw new Error('Failed to get draft versions');
    }
    
    return response.json();
  }
  
  async loadDraftVersion(data: { draftId: string; versionId: string }): Promise<LoadResult> {
    const response = await fetch(`/api/drafts/${data.draftId}/versions/${data.versionId}`);
    
    if (!response.ok) {
      throw new Error('Failed to load draft version');
    }
    
    return response.json();
  }
  
  async restoreDraftVersion(data: { draftId: string; versionId: string }): Promise<LoadResult> {
    const response = await fetch(`/api/drafts/${data.draftId}/versions/${data.versionId}/restore`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Failed to restore draft version');
    }
    
    return response.json();
  }
  
  // Placeholder methods for Electron-specific features
  async createNew(): Promise<{ success: boolean }> {
    return { success: true };
  }
  
  async openDraftsDirectory(): Promise<{ success: boolean }> {
    // Not applicable in web version
    return { success: false };
  }
}

export const api = new ApiClient();
