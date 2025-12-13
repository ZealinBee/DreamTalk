'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signInWithGoogle(redirectAfterLogin?: string) {
  const supabase = await createClient()

  const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL
  const callbackUrl = redirectAfterLogin
    ? `${redirectUrl}/auth/callback?next=${encodeURIComponent(redirectAfterLogin)}`
    : `${redirectUrl}/auth/callback`

  console.log('=== GOOGLE SIGN-IN DEBUG ===')
  console.log('All NEXT_PUBLIC env vars:', {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  })
  console.log('NODE_ENV:', process.env.NODE_ENV)
  console.log('Redirect URL being used:', callbackUrl)
  console.log('=========================')

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: callbackUrl,
    },
  })

  if (error) {
    console.error('Error signing in with Google:', error)
    return { error: error.message }
  }

  console.log('OAuth URL generated:', data.url)
  console.log('Full OAuth data:', JSON.stringify(data, null, 2))

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
