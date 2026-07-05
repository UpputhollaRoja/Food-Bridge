import { createClient } from '@supabase/supabase-js'
import { ENV } from '../config/env'

/**
 * Standard Supabase client using the anon key.
 * Respects Row Level Security — suitable for user-scoped queries
 * when a JWT is forwarded in the Authorization header.
 */
export const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY)

/**
 * Admin Supabase client using the service-role key.
 * BYPASSES Row Level Security — use only for admin operations
 * (e.g. verification queue, creating profiles server-side).
 * Never expose this client or its key to the browser.
 */
export const supabaseAdmin = ENV.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SERVICE_ROLE_KEY)
  : null

/**
 * Creates a per-request Supabase client that forwards the user's JWT,
 * so RLS policies apply correctly for that user's session.
 */
export function createUserClient(jwtToken: string) {
  return createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, {
    global: {
      headers: { Authorization: `Bearer ${jwtToken}` },
    },
  })
}
