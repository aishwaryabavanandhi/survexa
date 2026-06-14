import { createClient } from '@supabase/supabase-js';

// Retrieve credentials from environment variables or use fallback configurations
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key-string-xyz';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false, // Managed separately via useAuthStore or Firebase
  },
});

export default supabase;
