import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

// Public Supabase client initialized with anon key (respects RLS)
export const supabaseAnon = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Admin Supabase client initialized with service role key (bypasses RLS for Express backend controllers)
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
