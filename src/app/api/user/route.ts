import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { role, is_onboarded } = body

    const adminClient = createAdminClient()
    if (!adminClient) {
      return NextResponse.json({ error: 'Admin client failed' }, { status: 500 })
    }

    // Only allow setting is_onboarded to true during the onboarding step
    const updateData: any = { role }
    if (is_onboarded) {
      updateData.is_onboarded = true
    }

    const { data, error } = await adminClient
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ user: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
