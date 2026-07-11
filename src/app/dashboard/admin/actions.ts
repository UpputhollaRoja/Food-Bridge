'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
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

/**
 * Generates a short-lived signed URL for a private storage object.
 * Called client-side on "View Document" click — the URL is freshly minted
 * at click time so it never arrives stale.
 * @param bucket  Supabase storage bucket name
 * @param path    Storage object path (relative to bucket root)
 * @param expiresIn  Seconds until expiry (default 600 = 10 minutes)
 */
export async function generateSignedUrl(bucket: string, path: string, expiresIn = 600) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Ensure the user is an admin
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') {
    return { error: 'Unauthorized' }
  }

  const adminClient = createAdminClient()
  if (!adminClient) {
    return { error: 'Admin client failed' }
  }

  const { data, error } = await adminClient.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)

  if (error || !data?.signedUrl) {
    return { error: error?.message ?? 'Could not generate signed URL' }
  }

  return { signedUrl: data.signedUrl }
}

export async function suspendUserAction(userId: string) {
  const supabase = await createClient()

  // 1. Update verification status to 'suspended'
  const { error } = await supabase
    .from('profiles')
    .update({ verification_status: 'suspended', updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }

  // 2. Notify the user
  await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type: 'account_suspension',
      payload: {
        message: `Your account has been suspended by the administrator.`
      }
    })

  revalidatePath('/dashboard/admin')
  return { success: true }
}

export async function updateUserRoleAction(userId: string, newRole: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/admin')
  return { success: true }
}

export async function updateDeliveryStatusAction(deliveryId: string, newStatus: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('deliveries')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', deliveryId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/admin')
  return { success: true }
}
