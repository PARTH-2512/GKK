import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[supabase] Missing env vars', {
    VITE_SUPABASE_URL: supabaseUrl,
    VITE_SUPABASE_ANON_KEY: Boolean(supabaseAnonKey),
  })
  throw new Error('Supabase env variables are not defined. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.')
}

// Single Supabase client — used for auth, database, and storage
export const supabase = createClient(supabaseUrl, supabaseAnonKey)