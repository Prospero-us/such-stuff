import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { useState } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  const [supabaseClient] = useState(() => {
    // Check if we have valid environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // During build or with invalid env vars, skip Supabase initialization
    if (!supabaseUrl || !supabaseAnonKey || 
        supabaseUrl === 'your_supabase_project_url' || 
        supabaseAnonKey === 'your_supabase_anon_key') {
      return null as any;
    }
    
    return createPagesBrowserClient();
  });

  // If Supabase isn't configured, render without the provider
  if (!supabaseClient) {
    return <Component {...pageProps} />;
  }

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <Component {...pageProps} />
    </SessionContextProvider>
  );
}
