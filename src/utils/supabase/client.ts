import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client singleton.
 *
 * Environment variables (set in your .env file):
 *   VITE_SUPABASE_URL       – Your project URL (e.g. https://xxxx.supabase.co)
 *   VITE_SUPABASE_ANON_KEY  – Your project's anon/public key
 *
 * These are exposed to the browser by Vite because of the VITE_ prefix.
 * Never put the service_role key here — it is for server-side use only.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables.\n' +
      'Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
