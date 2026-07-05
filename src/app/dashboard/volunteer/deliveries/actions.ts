'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function acceptDeliveryAction(deliveryId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase.rpc('assign_delivery', {
    p_delivery_id: deliveryId,
    p_volunteer_id: user.id,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/volunteer/deliveries')
  revalidatePath('/dashboard/volunteer')
  return { success: true }
}

export async function confirmPickupAction(deliveryId: string) {
  const supabase = await createClient()

  // 1. Update delivery status and pickup timestamp
  const { data: delivery, error: delError } = await supabase
    .from('deliveries')
    .update({ 
      status: 'pickup_completed', 
      pickup_confirmed_at: new Date().toISOString() 
    })
    .eq('id', deliveryId)
    .select('claim_id')
    .single()

  if (delError) {
    return { error: delError.message }
  }

  // 2. Fetch donation details
  const { data: claim } = await supabase
    .from('claims')
    .select('donation_id')
    .eq('id', delivery.claim_id)
    .single()

  if (claim) {
    // 3. Update donation status to 'collected'
    await supabase
      .from('donations')
      .update({ status: 'collected', updated_at: new Date().toISOString() })
      .eq('id', claim.donation_id)
  }

  revalidatePath('/dashboard/volunteer/deliveries')
  revalidatePath('/dashboard/volunteer')
  return { success: true }
}

export async function startTransitAction(deliveryId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('deliveries')
    .update({ status: 'in_transit' })
    .eq('id', deliveryId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/volunteer/deliveries')
  revalidatePath('/dashboard/volunteer')
  return { success: true }
}

export async function completeDeliveryAction(deliveryId: string, proofPath: string) {
  const supabase = await createClient()

  // 1. Update delivery status, delivered timestamp and proof image URL
  const { data: delivery, error: delError } = await supabase
    .from('deliveries')
    .update({ 
      status: 'delivered', 
      proof_image_url: proofPath,
      delivered_at: new Date().toISOString()
    })
    .eq('id', deliveryId)
    .select('claim_id')
    .single()

  if (delError) {
    return { error: delError.message }
  }

  // 2. Fetch donation details
  const { data: claim } = await supabase
    .from('claims')
    .select('donation_id')
    .eq('id', delivery.claim_id)
    .single()

  if (claim) {
    // 3. Update donation status to 'delivered'
    await supabase
      .from('donations')
      .update({ status: 'delivered', updated_at: new Date().toISOString() })
      .eq('id', claim.donation_id)
  }

  revalidatePath('/dashboard/volunteer/deliveries')
  revalidatePath('/dashboard/volunteer')
  return { success: true }
}
