'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createDonation(prevState: unknown, formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const title = formData.get('title') as string
  const category = formData.get('category') as string
  const quantityStr = formData.get('quantity') as string
  const quantityUnit = formData.get('quantityUnit') as string
  const estimatedMealsStr = formData.get('estimatedMeals') as string
  const expiryAt = formData.get('expiryAt') as string
  const pickupLocation = formData.get('pickupLocation') as string
  const pickupWindowStart = formData.get('pickupWindowStart') as string
  const pickupWindowEnd = formData.get('pickupWindowEnd') as string
  const storageInstructions = formData.get('storageInstructions') as string
  const allergenInfo = formData.get('allergenInfo') as string
  
  const imagesJson = formData.get('images') as string
  const images = imagesJson ? JSON.parse(imagesJson) : []

  if (!title || !category || !quantityStr || !quantityUnit || !estimatedMealsStr || !expiryAt || !pickupLocation || !pickupWindowStart || !pickupWindowEnd) {
    return { error: 'Please fill in all required fields' }
  }

  const quantity = parseFloat(quantityStr)
  const estimatedMeals = parseInt(estimatedMealsStr)

  // Fetch coordinates and verification status from profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('latitude, longitude, verification_status')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return { error: 'Profile not found' }
  }

  if (profile.verification_status !== 'verified') {
    return { error: 'Your account is not verified yet. You can list food items once approved by an admin.' }
  }

  const { data: donation, error } = await supabase
    .from('donations')
    .insert({
      donor_id: user.id,
      title,
      category,
      quantity,
      quantity_unit: quantityUnit,
      estimated_meals: estimatedMeals,
      expiry_at: new Date(expiryAt).toISOString(),
      pickup_location: pickupLocation,
      pickup_latitude: profile.latitude || 37.7749,
      pickup_longitude: profile.longitude || -122.4194,
      pickup_window_start: new Date(pickupWindowStart).toISOString(),
      pickup_window_end: new Date(pickupWindowEnd).toISOString(),
      storage_instructions: storageInstructions || null,
      allergen_info: allergenInfo || null,
      images,
      status: 'pending_approval',
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Trigger non-blocking prioritization recomputation
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    // Fire-and-forget background fetch
    fetch(`${siteUrl}/api/ai/prioritize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ donationId: donation.id }),
    }).catch((err) => console.error('Priority request background error:', err))
  } catch (e) {
    console.error('Failed to dispatch priority recompute:', e)
  }

  revalidatePath('/dashboard/donor')
  redirect('/dashboard/donor')
}
