// Example implementation for src/pages/api/analyze.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { VibeAnalysis } from '@/types';

// Initialize Claude API (you'll need to install @anthropic-ai/sdk)
// npm install @anthropic-ai/sdk
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY!,
});

// Vibe analysis prompt template
const createVibePrompt = (text: string) => `You are a writing coach analyzing the "vibe" of a text passage. 

Evaluate this text and provide:
1. A vibe score between -1 (lifeless/boring) and 1 (vibrant/engaging)
2. A brief, encouraging explanation (max 50 words) focusing on what makes the writing engaging or how to improve it

Text to analyze:
"${text}"

Respond in JSON format:
{
  "score": 0.0,
  "reason": "Your explanation here"
}`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create authenticated Supabase client
    const supabase = createServerSupabaseClient({ req, res });
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { text, draftId } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Truncate text if too long (to manage API costs)
    const truncatedText = text.slice(0, 2000);

    // Call Claude API
    const response = await anthropic.messages.create({
      model: process.env.DEFAULT_MODEL || 'claude-3-5-sonnet-20241022',
      max_tokens: 150,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: createVibePrompt(truncatedText)
      }]
    });

    // Parse Claude's response
    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response format');
    }

    let vibeData: VibeAnalysis;
    try {
      // Extract JSON from response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      vibeData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', content.text);
      vibeData = {
        score: 0,
        reason: "I couldn't analyze the vibe right now. Try again!"
      };
    }

    // Validate score is in range
    vibeData.score = Math.max(-1, Math.min(1, vibeData.score));

    // If a draftId was provided, save to vibe history
    if (draftId) {
      const { error: insertError } = await supabase
        .from('vibe_history')
        .insert({
          draft_id: draftId,
          score: vibeData.score,
          reason: vibeData.reason
        });

      if (insertError) {
        console.error('Failed to save vibe history:', insertError);
        // Don't fail the request, just log the error
      }

      // Update the draft's last vibe score
      const { error: updateError } = await supabase
        .from('drafts')
        .update({ 
          last_vibe: vibeData.score,
          updated_at: new Date().toISOString()
        })
        .eq('id', draftId)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Failed to update draft vibe:', updateError);
      }
    }

    // Track usage for analytics (optional)
    const wordCount = text.split(/\s+/).length;
    await supabase
      .from('api_usage')
      .insert({
        user_id: user.id,
        endpoint: 'analyze',
        tokens_used: response.usage?.total_tokens || 0,
        word_count: wordCount
      })
      .catch(err => console.error('Failed to track usage:', err));

    return res.status(200).json(vibeData);

  } catch (error) {
    console.error('Analysis error:', error);
    
    // Handle specific error types
    if (error instanceof Anthropic.APIError) {
      if (error.status === 429) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded. Please try again later.' 
        });
      }
      if (error.status === 401) {
        return res.status(500).json({ 
          error: 'API configuration error. Please contact support.' 
        });
      }
    }

    // Generic error response
    return res.status(500).json({ 
      error: 'Failed to analyze text. Please try again.' 
    });
  }
}

// Configure API route
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100kb',
    },
  },
}; 