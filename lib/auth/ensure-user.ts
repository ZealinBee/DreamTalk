'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Ensures a user exists in the public.users table
 * This is a fallback in case the trigger doesn't fire or for existing users
 */
export async function ensureUserExists() {
  const supabase = await createClient()

  // Get the current authenticated user
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

  if (authError || !authUser) {
    console.error('No authenticated user found:', authError)
    return { error: 'Not authenticated' }
  }

  // Check if user exists in public.users
  const { data: existingUser, error: fetchError } = await supabase
    .from('users')
    .select('id')
    .eq('id', authUser.id)
    .single()

  if (fetchError && fetchError.code !== 'PGRST116') {
    // PGRST116 is "not found" error, which is expected for new users
    console.error('Error checking user existence:', fetchError)
    return { error: fetchError.message }
  }

  // If user already exists, we're done
  if (existingUser) {
    console.log('User already exists in public.users')
    return { success: true, existed: true }
  }

  // User doesn't exist, create them
  console.log('Creating user in public.users...')
  const { error: insertError } = await supabase
    .from('users')
    .insert({
      id: authUser.id,
      email: authUser.email!,
      full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || null,
      avatar_url: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null,
    })

  if (insertError) {
    console.error('Error creating user:', insertError)
    return { error: insertError.message }
  }

  console.log('User created successfully in public.users')
  return { success: true, existed: false }
}
