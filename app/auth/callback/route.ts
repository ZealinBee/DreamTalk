import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  console.log('=== AUTH CALLBACK DEBUG ===')
  console.log('Full URL:', request.url)
  console.log('Code:', code ? 'present' : 'missing')
  console.log('Origin:', origin)
  console.log('Request headers:', {
    host: request.headers.get('host'),
    'x-forwarded-host': request.headers.get('x-forwarded-host'),
    'x-forwarded-proto': request.headers.get('x-forwarded-proto'),
  })
  console.log('NODE_ENV:', process.env.NODE_ENV)
  console.log('NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL)
  console.log('=========================')

  if (code) {
    const supabase = await createClient()
    console.log('Exchanging code for session...')
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Error exchanging code:', error)
      return NextResponse.redirect(`${origin}/auth/auth-code-error`)
    }

    console.log('Session exchange successful!')

    // Ensure user exists in public.users table (fallback if trigger didn't fire)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        console.log('Checking if user exists in public.users...')
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single()

        if (!existingUser) {
          console.log('User not found in public.users, creating...')
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: user.id,
              email: user.email!,
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
              avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
            })

          if (insertError) {
            console.error('Error creating user in public.users:', insertError)
          } else {
            console.log('User created successfully in public.users')
          }
        } else {
          console.log('User already exists in public.users')
        }
      }
    } catch (e) {
      console.error('Error ensuring user exists:', e)
      // Don't fail the auth flow if this fails
    }

    const forwardedHost = request.headers.get('x-forwarded-host')
    const isLocalEnv = process.env.NODE_ENV === 'development'

    if (isLocalEnv) {
      return NextResponse.redirect(`${origin}${next}`)
    } else if (forwardedHost) {
      return NextResponse.redirect(`https://${forwardedHost}${next}`)
    } else {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  console.error('No code in callback URL')
  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
