const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL || 'https://zijjwaubebbmazqphspx.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key-to-prevent-crash-in-ci'

if (supabaseKey === 'dummy-key-to-prevent-crash-in-ci' && process.env.NODE_ENV !== 'test') {
  console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY is missing. Database operations will fail.')
}

const supabase = createClient(supabaseUrl, supabaseKey)

module.exports = { supabase }
