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

export async function completeDeliveryAction(deliveryId: string, proofPaths: string[]) {
  const supabase = await createClient()

  if (!proofPaths || proofPaths.length < 2) {
    return { error: 'Both food proof and delivery proof photos are required' }
  }

  // 1. Update delivery status and proof image
  const { data: delivery, error: delError } = await supabase
    .from('deliveries')
    .update({ 
      status: 'delivered', 
      delivered_at: new Date().toISOString(),
      proof_image_url: proofPaths[0],
      proof_image_2_url: proofPaths[1]
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

export async function reportDeliveryIssueAction(deliveryId: string, failureReason: string, isVolunteerHungry: boolean) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const status = isVolunteerHungry ? 'failed_by_volunteer' : 'failed'

  const { error } = await supabase
    .from('deliveries')
    .update({
      status,
      failure_reason: failureReason
    })
    .eq('id', deliveryId)

  if (error) {
    return { error: error.message }
  }

  // Optionally, if the volunteer is hungry, we might cancel the claim so the NGO knows
  // or notify admin. For now, updating delivery status is sufficient.

  revalidatePath('/dashboard/volunteer/deliveries')
  revalidatePath('/dashboard/volunteer')
  return { success: true }
}

export async function fetchNearbyDeliveriesAction(lat: number, lng: number, radiusKm: number = 15) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // We call our RPC to get unassigned deliveries near the volunteer
  const { data, error } = await supabase.rpc('get_nearby_deliveries', {
    volunteer_lat: lat,
    volunteer_lng: lng,
    radius_km: radiusKm
  })

  if (error) {
    console.error('RPC Error:', error)
    return { error: error.message }
  }

  // We need to shape this data to match what DeliveriesListClient expects for unassigned.
  // We'll fetch the full claims & donation info for these specific deliveries.
  if (!data || data.length === 0) {
    return { data: [] }
  }

  const deliveryIds = data.map((d: any) => d.delivery_id)

  const { data: fullDeliveries, error: fullError } = await supabase
    .from('deliveries')
    .select(`
      id,
      status,
      created_at,
      claims (
        id,
        notes,
        donations (
          id,
          title,
          category,
          quantity,
          quantity_unit,
          pickup_location,
          pickup_latitude,
          pickup_longitude,
          expiry_at,
          pickup_window_start,
          pickup_window_end,
          profiles (
            full_name,
            phone
          )
        ),
        profiles (
          full_name,
          organization_name,
          phone,
          address,
          latitude,
          longitude
        )
      )
    `)
    .in('id', deliveryIds)
    
  if (fullError) return { error: fullError.message }

  // Attach distance back to the results
  const result = fullDeliveries.map(d => {
    const rpcMatch = data.find((rpcD: any) => rpcD.delivery_id === d.id)
    return {
      ...d,
      distance_km: rpcMatch ? rpcMatch.distance_km : null
    }
  }).sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0))

  return { data: result }
}

