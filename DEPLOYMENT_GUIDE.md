# Flow Web Deployment Guide

This guide will walk you through deploying Flow as a web application on Vercel with Supabase as the database.

## Prerequisites

- GitHub account
- Vercel account (free tier works)
- Supabase account (free tier works)
- Claude API key from Anthropic

## Step 1: Set up Supabase

1. **Create a new Supabase project**
   - Go to [app.supabase.com](https://app.supabase.com)
   - Click "New project"
   - Choose your organization
   - Name your project (e.g., "flow-app")
   - Generate a strong database password (save this!)
   - Select a region close to your users
   - Click "Create new project"

2. **Set up the database schema**
   - Once your project is ready, go to the SQL Editor
   - Click "New query"
   - Copy the entire contents of `supabase-schema.sql`
   - Paste and run the query
   - This creates all necessary tables with proper security

3. **Configure authentication**
   - Go to Authentication > Providers
   - Enable Email provider (for email/password auth)
   - Optionally enable OAuth providers (Google, GitHub, etc.)
   - Go to Authentication > URL Configuration
   - Add your production URL to "Redirect URLs" (e.g., `https://your-app.vercel.app`)

4. **Get your API keys**
   - Go to Settings > API
   - Copy the "Project URL" - this is your `NEXT_PUBLIC_SUPABASE_URL`
   - Copy the "anon public" key - this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy the "service_role" key - this is your `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## Step 2: Prepare the Web App

1. **Create a new directory for the web app**
   ```bash
   mkdir flow-web
   cd flow-web
   ```

2. **Copy necessary files**
   - Copy `web-package.json` as `package.json`
   - Copy `next.config.js`
   - Copy `env.example` as `.env.local`
   - Create directories: `src/`, `src/pages/`, `src/components/`, `src/lib/`, `src/styles/`

3. **Move React components**
   - Copy all components from `packages/renderer/src/components/` to `src/components/`
   - Copy utilities from `packages/renderer/src/utils/` to `src/lib/`
   - Copy types from `packages/renderer/src/types.ts` to `src/types/`

4. **Update imports**
   - Change all `window.electronAPI` calls to use the new API client
   - Update import paths to match Next.js structure

## Step 3: Create API Routes

Create the following API routes in `src/pages/api/`:

### `src/pages/api/analyze.ts`
```typescript
import type { NextApiRequest, NextApiResponse } from 'next'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY!,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Create authenticated Supabase client
  const supabase = createServerSupabaseClient({ req, res })
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { text, draftId } = req.body

  try {
    // Call Claude API for analysis
    const response = await anthropic.messages.create({
      model: process.env.DEFAULT_MODEL || 'claude-3-7-sonnet-20250219',
      max_tokens: 150,
      messages: [{
        role: 'user',
        content: text // Your prompt here
      }]
    })

    // Parse response and calculate vibe score
    // Save to vibe_history if draftId provided
    
    res.status(200).json({
      score: 0.8, // Calculated score
      reason: 'Your writing vibrates with energy!'
    })
  } catch (error) {
    console.error('Analysis error:', error)
    res.status(500).json({ error: 'Failed to analyze text' })
  }
}
```

### `src/pages/api/drafts/[id].ts`
```typescript
// API route for individual draft operations (GET, PUT, DELETE)
```

### `src/pages/api/drafts/index.ts`
```typescript
// API route for listing and creating drafts
```

## Step 4: Create Supabase Client

Create `src/lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'

export const supabase = createPagesBrowserClient()

// For server-side operations
export const getServiceSupabase = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
```

## Step 5: Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial web app setup"
   git remote add origin https://github.com/YOUR_USERNAME/flow-web.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `CLAUDE_API_KEY`
     - `DEFAULT_MODEL`
   - Click "Deploy"

3. **Configure domain (optional)**
   - Go to your project settings in Vercel
   - Add a custom domain
   - Update Supabase redirect URLs

## Step 6: Post-Deployment

1. **Test authentication**
   - Visit your deployed app
   - Sign up with email/password
   - Verify email (check spam folder)
   - Sign in

2. **Test core features**
   - Create a new draft
   - Type some text
   - Check vibe analysis works
   - Save and reload

3. **Monitor usage**
   - Check Vercel Analytics for performance
   - Monitor Supabase dashboard for database usage
   - Track API usage in Anthropic console

## Security Considerations

1. **API Keys**
   - Never expose `CLAUDE_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY` to the client
   - Use Vercel environment variables for all secrets

2. **Rate Limiting**
   - Implement rate limiting on API routes
   - Consider using Vercel Edge Middleware

3. **Row Level Security**
   - All database tables have RLS enabled
   - Users can only access their own data

## Troubleshooting

### "Unauthorized" errors
- Check that authentication is properly configured
- Verify Supabase redirect URLs include your domain

### Vibe analysis not working
- Verify Claude API key is correct
- Check API route logs in Vercel Functions tab

### Data not persisting
- Check Supabase dashboard for errors
- Verify RLS policies are correct
- Check browser console for network errors

## Next Steps

1. **Add monitoring**
   - Set up error tracking (Sentry)
   - Add analytics (Vercel Analytics, PostHog)

2. **Optimize performance**
   - Enable Vercel Edge Functions for API routes
   - Implement caching strategies
   - Use Supabase Realtime for live updates

3. **Enhance features**
   - Add social features (sharing, collaboration)
   - Implement premium tiers
   - Add more AI coaching modes

## Support

For issues or questions:
- Check Vercel docs: [vercel.com/docs](https://vercel.com/docs)
- Check Supabase docs: [supabase.com/docs](https://supabase.com/docs)
- Create an issue in your GitHub repository 