import { createClient } from '@supabase/supabase-js'

// Admin client bypasses Row Level Security
// Only use in server-side code (webhooks, server actions)
export function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secretKey = process.env.SUPABASE_SECRET_KEY

  if (!supabaseUrl || !secretKey) {
    throw new Error('Missing SUPABASE_SECRET_KEY environment variable')
  }

  return createClient(supabaseUrl, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
