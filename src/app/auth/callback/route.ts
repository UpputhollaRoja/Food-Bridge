import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const role = searchParams.get('role')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )
    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
    }
    
    if (sessionData.user) {
      if (next !== '/') {
        return NextResponse.redirect(`${origin}${next}`)
      }

      // Check if profile exists
      let { data: profile } = await supabase
        .from('profiles')
        .select('role, verification_status, phone, address, encrypted_data')
        .eq('id', sessionData.user.id)
        .single()

      const adminClient = createAdminClient()

      if (!profile) {
        // Create profile if it doesn't exist
        const newRole = role || 'donor'
        if (adminClient) {
          const { data: newProfile } = await adminClient
            .from('profiles')
            .insert({
              id: sessionData.user.id,
              role: newRole,
              full_name: sessionData.user.user_metadata?.full_name || 'New User',
              verification_status: 'pending'
            })
            .select('role, verification_status, phone, address, encrypted_data')
            .single()
            
          profile = newProfile
        }
      } else if (role && profile.role !== role) {
        if (adminClient) {
          await adminClient.from('profiles').update({ role }).eq('id', sessionData.user.id)
          profile.role = role
        }
      }

      const type = searchParams.get('type')
      
      if (type === 'signup') {
        // Sign the user out so they have to manually log in
        await supabase.auth.signOut()
        return NextResponse.redirect(`${origin}/login?message=${encodeURIComponent('Email confirmed successfully. Please log in.')}`)
      }

      const hasPlaintext = Boolean(profile?.phone && profile?.address)
      const hasEncrypted = Boolean(profile?.encrypted_data && Object.keys(profile.encrypted_data).length > 0)
      const isComplete = hasPlaintext || hasEncrypted

      if (!isComplete) {
        return NextResponse.redirect(`${origin}/onboarding`)
      }

      if (profile?.role === 'donor' && profile?.verification_status !== 'verified') {
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Your donor account is pending approval. Please wait for an admin to verify your account.')}`)
      }

      if (profile?.role) {
        return NextResponse.redirect(`${origin}/dashboard/${profile.role}`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent('Invalid authentication request. Please try again.')}`
  )
}
