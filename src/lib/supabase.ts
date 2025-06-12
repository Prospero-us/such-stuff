import { createClient } from '@supabase/supabase-js';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

// Check if we have valid environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// For client-side operations
export const supabase = (() => {
  // During build time or if env vars are missing, return a mock client
  if (!supabaseUrl || !supabaseAnonKey || 
      supabaseUrl === 'your_supabase_project_url' || 
      supabaseAnonKey === 'your_supabase_anon_key') {
    // Return a null-safe mock during build
    return null as any;
  }
  
  return createPagesBrowserClient();
})();

// For server-side operations (when needed)
export const getServiceSupabase = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey || 
      supabaseUrl === 'your_supabase_project_url' || 
      serviceRoleKey === 'your_service_role_key') {
    throw new Error('Supabase environment variables are not properly configured');
  }
  
  return createClient(supabaseUrl, serviceRoleKey);
}; 