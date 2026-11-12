import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as any
  const next = searchParams.get('next') ?? '/'
  const role = searchParams.get('role')

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

  let user: any = null
  let authError: any = null

  // 1. Kottha rakam link - token_hash
  if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ token_hash, type })
    if (error) authError = error
    else user = data.user
  }
  // 2. Paatha rakam link - code
  else if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) authError = error
    else user = data.user
  }

  if (authError) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(authError.message)}`)
  }

  if (user) {
    // next unte mundu daniki vellakunda, profile check chesi appudu pampu
    // next = /onboarding ayithe danike velthadhi

    let { data: profile } = await supabase
      .from('profiles')
      .select('role, verification_status, phone, address, encrypted_data')
      .eq('id', user.id)
      .single()

    const adminClient = createAdminClient()

    if (!profile) {
      const newRole = role || 'donor'
      if (adminClient) {
        const { data: newProfile } = await adminClient
          .from('profiles')
          .insert({
            id: user.id,
            role: newRole,
            full_name: user.user_metadata?.full_name || 'New User',
            verification_status: 'pending'
          })
          .select('role, verification_status, phone, address, encrypted_data')
          .single()
        profile = newProfile
      }
    } else if (role && profile.role !== role) {
      if (adminClient) {
        await adminClient.from('profiles').update({ role }).eq('id', user.id)
        profile.role = role
      }
    }

    // Profile incomplete ayithe - Direct ga Profile Setup / Onboarding ki
    const hasPlaintext = Boolean(profile?.phone && profile?.address)
    const hasEncrypted = Boolean(profile?.encrypted_data && Object.keys(profile.encrypted_data).length > 0)
    const isComplete = hasPlaintext || hasEncrypted

    if (!isComplete) {
      return NextResponse.redirect(`${origin}/onboarding`)
    }

    // Profile complete ayithe - next unte daniki, lekapothe dashboard ki
    if (next !== '/' && next !== '/onboarding') {
      return NextResponse.redirect(`${origin}${next}`)
    }

    if (profile?.role) {
      return NextResponse.redirect(`${origin}/dashboard/${profile.role}`)
    }

    return NextResponse.redirect(`${origin}${next}`)
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent('Invalid authentication request. Please try again.')}`
  )
}
