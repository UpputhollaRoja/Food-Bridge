import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { type EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  if (token_hash && type) {
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
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) {
      if (type === 'signup') {
        await supabase.auth.signOut()
        return NextResponse.redirect(`${origin}/login?message=${encodeURIComponent('Email confirmed successfully. Please log in.')}`)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  let errorMessage = 'Could not verify link. Please request a new one.'
  if (type === 'recovery') {
    errorMessage = 'Could not verify reset link. Please request a new one.'
  } else if (type === 'signup') {
    errorMessage = 'Could not verify confirmation link. Please request a new signup link.'
  }
  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent(errorMessage)}`
  )
}
