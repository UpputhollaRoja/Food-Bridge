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
    
    if (!error && sessionData.user) {
      if (next !== '/') {
        return NextResponse.redirect(`${origin}${next}`)
      }

      if (role) {
        const adminClient = createAdminClient()
        if (adminClient) {
          await adminClient.from('profiles').update({ role }).eq('id', sessionData.user.id)
        }
        return NextResponse.redirect(`${origin}/dashboard/${role}`)
      }

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', sessionData.user.id).single()
      if (profile?.role) {
        return NextResponse.redirect(`${origin}/dashboard/${profile.role}`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=Could not verify reset link. Please request a new one.`
  )
}
