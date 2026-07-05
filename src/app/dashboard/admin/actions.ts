'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function verifyUserAction(userId: string, status: 'verified' | 'rejected') {
  const supabase = await createClient()

  // 1. Update verification status
  const { error } = await supabase
    .from('profiles')
    .update({ verification_status: status, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }

  // 2. Notify the user
  await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type: 'account_verification',
      payload: {
        message: `Your account verification request was review and ${status} by the administrator.`
      }
    })

  revalidatePath('/dashboard/admin')
  return { success: true }
}

export async function approveDonationAction(donationId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('donations')
    .update({ status: 'available', updated_at: new Date().toISOString() })
    .eq('id', donationId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/admin')
  return { success: true }
}

export async function rejectDonationAction(donationId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('donations')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', donationId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/admin')
  return { success: true }
}
