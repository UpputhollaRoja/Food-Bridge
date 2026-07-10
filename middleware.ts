import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/signup', '/verify-email', '/reset-password', '/auth/callback']
const DASHBOARD_ROUTES = ['/dashboard/donor', '/dashboard/ngo', '/dashboard/volunteer']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes to pass through
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next()
  }

  // Check auth for dashboard routes
  if (pathname.startsWith('/dashboard')) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Not authenticated
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Fetch user role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const userRole = profile?.role

    // No role set - redirect to onboarding
    if (!userRole) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }

    // Check if accessing correct role dashboard
    const requestedRole = pathname.split('/')[2] // Extract 'donor', 'ngo', or 'volunteer'
    
    if (requestedRole && userRole !== requestedRole) {
      // User trying to access wrong dashboard - redirect to their own
      return NextResponse.redirect(new URL(`/dashboard/${userRole}`, request.url))
    }

    return supabaseResponse
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
