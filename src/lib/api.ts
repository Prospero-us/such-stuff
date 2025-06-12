import { supabase } from './supabase';

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
  
  // Add other methods as needed...
}

export const api = new ApiClient();
