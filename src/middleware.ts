import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { supabase, supabaseResponse, user } = await updateSession(request)

  const path = request.nextUrl.pathname

  // Allow static assets, images, next-internals
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path === '/favicon.ico'
  ) {
    return supabaseResponse
  }

  // 1. If not logged in and trying to access dashboard/onboarding, redirect to /login
  if (!user) {
    if (path.startsWith('/dashboard') || path === '/onboarding') {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // 2. Fetch user profile from database to check role & onboarding status
  if (path.startsWith('/dashboard') || path === '/onboarding') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, verification_status, phone, address, encrypted_data')
      .eq('id', user.id)
      .single()

    // If profile doesn't exist, they need to onboarding page
    if (!profile) {
      if (path !== '/onboarding') {
        const url = request.nextUrl.clone()
        url.pathname = '/onboarding'
        return NextResponse.redirect(url)
      }
      return supabaseResponse
    }

    // Check if user has completed basic onboarding (has phone & address, OR has encrypted_data)
    const isProfileIncomplete = (!profile.phone || !profile.address) && !profile.encrypted_data
    
    if (isProfileIncomplete) {
      if (path !== '/onboarding') {
        const url = request.nextUrl.clone()
        url.pathname = '/onboarding'
        return NextResponse.redirect(url)
      }
      return supabaseResponse
    }

    // If onboarding is complete, redirect away from onboarding page to their dashboard
    if (path === '/onboarding') {
      const url = request.nextUrl.clone()
      url.pathname = `/dashboard/${profile.role}`
      return NextResponse.redirect(url)
    }

    // Check role route authorization
    if (path.startsWith('/dashboard/donor') && profile.role !== 'donor' && profile.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = `/dashboard/${profile.role}`
      return NextResponse.redirect(url)
    }

    if (path.startsWith('/dashboard/ngo') && profile.role !== 'ngo' && profile.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = `/dashboard/${profile.role}`
      return NextResponse.redirect(url)
    }

    if (path.startsWith('/dashboard/volunteer') && profile.role !== 'volunteer' && profile.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = `/dashboard/${profile.role}`
      return NextResponse.redirect(url)
    }

    if (path.startsWith('/dashboard/admin') && profile.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = `/dashboard/${profile.role}`
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/onboarding',
    '/login',
    '/signup',
  ],
}
