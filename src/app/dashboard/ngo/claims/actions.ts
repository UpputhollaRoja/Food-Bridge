'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function cancelClaimAction(claimId: string, donationId: string) {
  const supabase = await createClient()

  // 1. Update claim status to 'cancelled'
  const { error: claimError } = await supabase
    .from('claims')
    .update({ status: 'cancelled' })
    .eq('id', claimId)

  if (claimError) {
    return { error: claimError.message }
  }

  // 2. Update donation status back to 'available'
  const { error: donationError } = await supabase
    .from('donations')
    .update({ status: 'available', updated_at: new Date().toISOString() })
    .eq('id', donationId)

  if (donationError) {
    return { error: donationError.message }
  }

  // 3. Cancel associated delivery
  await supabase
    .from('deliveries')
    .delete() // delete the unassigned delivery to clean up logistics board
    .eq('claim_id', claimId)

  revalidatePath('/dashboard/ngo/claims')
  revalidatePath('/dashboard/ngo/browse')
  return { success: true }
}

export async function confirmReceiptAction(claimId: string, donationId: string, deliveryId: string) {
  const supabase = await createClient()

  // 1. Update claim status to 'completed'
  const { error: claimError } = await supabase
    .from('claims')
    .update({ status: 'completed' })
    .eq('id', claimId)

  if (claimError) return { error: claimError.message }

  // 2. Update donation status to 'completed'
  const { error: donationError } = await supabase
    .from('donations')
    .update({ status: 'completed', updated_at: new Date().toISOString() })
    .eq('id', donationId)

  if (donationError) return { error: donationError.message }

  // 3. Update delivery status to 'confirmed'
  const { error: deliveryError } = await supabase
    .from('deliveries')
    .update({ status: 'confirmed' })
    .eq('id', deliveryId)

  if (deliveryError) return { error: deliveryError.message }

  revalidatePath('/dashboard/ngo/claims')
  revalidatePath('/dashboard/ngo')
  revalidatePath('/dashboard/donor')
  revalidatePath('/dashboard/volunteer')
  return { success: true }
}
