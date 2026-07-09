'use server'

import { createClient } from '@/lib/supabase/server'

export async function reportUserAction(reportedUserId: string, reason: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  if (!reason || reason.trim() === '') {
    return { error: 'Reason for report is required' }
  }

  const { error } = await supabase
    .from('reports')
    .insert({
      reporter_id: user.id,
      reported_user_id: reportedUserId,
      reason: reason.trim()
    })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
