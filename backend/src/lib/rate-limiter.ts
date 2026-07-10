import { createClient } from '@supabase/supabase-js'

// Use service role for backend admin tables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

const TOKEN_LIMIT_PER_HOUR = 50000;
const REQUEST_LIMIT_PER_HOUR = 1000;

export async function checkRateLimit(route: string): Promise<boolean> {
  if (!supabaseUrl || !supabaseKey) return true; // Fail open if no DB config

  const now = new Date()
  
  // Get current usage
  const { data, error } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('route', route)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Rate limit DB error:', error)
    return false; // Fail closed if DB error (not 'Not found')
  }

  let record = data;
  if (!record || new Date(record.reset_at) < now) {
    // Reset or initialize
    const resetTime = new Date(now)
    resetTime.setHours(resetTime.getHours() + 1)
    
    const { data: newRecord } = await supabase
      .from('rate_limits')
      .upsert({
        route,
        tokens_used: 0,
        requests_count: 0,
        reset_at: resetTime.toISOString()
      }, { onConflict: 'route' })
      .select()
      .single()
      
    record = newRecord
  }

  if (record.requests_count >= REQUEST_LIMIT_PER_HOUR || record.tokens_used >= TOKEN_LIMIT_PER_HOUR) {
    console.warn(`Rate limit exceeded for route ${route}. Requests: ${record.requests_count}, Tokens: ${record.tokens_used}`)
    return false; // Exceeded
  }

  return true;
}

export async function recordUsage(route: string, tokens: number) {
  if (!supabaseUrl || !supabaseKey) return;
  
  // Execute increment using RPC or direct update
  // Since we don't have an RPC, we just read and update (race condition possible but acceptable for demo)
  const { data } = await supabase
    .from('rate_limits')
    .select('tokens_used, requests_count')
    .eq('route', route)
    .single()
    
  if (data) {
    await supabase
      .from('rate_limits')
      .update({
        tokens_used: data.tokens_used + tokens,
        requests_count: data.requests_count + 1
      })
      .eq('route', route)
  }
}
