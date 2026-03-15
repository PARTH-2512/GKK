import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Single Supabase client — used for auth, database, and storage
export const supabase = createClient(supabaseUrl, supabaseAnonKey)