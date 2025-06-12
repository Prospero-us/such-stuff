# Flow Web Deployment Checklist

## ✅ Completed
- [x] Created Supabase project
- [x] Set up database schema in Supabase
- [x] Converted Electron app to Next.js
- [x] Pushed code to GitHub (Prospero-us/such-stuff)
- [x] Initial deployment to Vercel
- [x] App is live at: https://flow-jladomso1-zachs-projects-b406b3ae.vercel.app

## 🔄 In Progress
- [ ] Add environment variables in Vercel dashboard
- [ ] Update Supabase redirect URLs
- [ ] Redeploy with environment variables

## 📋 Environment Variables to Add in Vercel

Go to: https://vercel.com/zachs-projects-b406b3ae/flow-web/settings/environment-variables

Add these variables:
```
NEXT_PUBLIC_SUPABASE_URL = [Your Supabase Project URL]
NEXT_PUBLIC_SUPABASE_ANON_KEY = [Your Supabase anon key]
CLAUDE_API_KEY = [Your Claude API key]
DEFAULT_MODEL = claude-3-5-sonnet-20241022
SUPABASE_SERVICE_ROLE_KEY = [Your Supabase service role key]
NEXT_PUBLIC_APP_URL = https://flow-jladomso1-zachs-projects-b406b3ae.vercel.app
```

## 🔗 Quick Links
- **Live App**: https://flow-jladomso1-zachs-projects-b406b3ae.vercel.app
- **Vercel Dashboard**: https://vercel.com/zachs-projects-b406b3ae/flow-web
- **GitHub Repo**: https://github.com/Prospero-us/such-stuff
- **Supabase Dashboard**: https://app.supabase.com

## 🚀 After Adding Environment Variables

1. Redeploy:
   ```bash
   npx vercel --prod
   ```

2. Test the app:
   - Sign up with email
   - Create a draft
   - Test vibe analysis
   - Save and reload

## 📝 Optional: Custom Domain
1. Go to Vercel project settings → Domains
2. Add your custom domain
3. Update `NEXT_PUBLIC_APP_URL` environment variable
4. Update Supabase redirect URLs 