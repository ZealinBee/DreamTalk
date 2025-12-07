'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signInWithGoogle() {
  const supabase = await createClient()

  console.log('Starting Google sign-in...')
  console.log('Redirect URL:', `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`)

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    console.error('Error signing in with Google:', error)
    return { error: error.message }
  }

  console.log('OAuth URL generated:', data.url)

  if (data.url) {
    redirect(data.url)
  }

  return { error: 'No redirect URL generated' }
}

export async function signOut() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Error signing out:', error)
    return { error: error.message }
  }

  redirect('/')
}

export async function getUser() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  // Get additional user data from our users table
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return userData
}
