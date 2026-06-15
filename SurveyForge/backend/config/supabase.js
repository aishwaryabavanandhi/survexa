const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL || 'https://your-supabase-url.supabase.co'
// Prefer service role key for backend calculations and report uploads
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'your-service-key'

const WebSocket = require('ws');

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    WebSocket: WebSocket,
  }
})

module.exports = { supabase }
