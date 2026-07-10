'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function saveOnboarding(prevState: unknown, formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return { error: 'Profile not found' }
  }

  const role = (formData.get('role') as string) || profile.role
  const fullName = formData.get('fullName') as string
  const organizationName = formData.get('organizationName') as string
  const latStr = formData.get('latitude') as string
  const lngStr = formData.get('longitude') as string

  // E2E encryption fields
  const encryptedData = formData.get('encrypted_data') as string
  const publicKey = formData.get('public_key') as string

  // Plaintext fields for admin dashboard visibility
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string
  const docUrl = formData.get('docUrl') as string

  const latitude = latStr ? parseFloat(latStr) : 37.7749 // default fallback coordinates (SF)
  const longitude = lngStr ? parseFloat(lngStr) : -122.4194

  const updateData: Record<string, string | number | string[] | any | null> = {
    id: user.id,
    role,
    full_name: fullName || profile.full_name,
    phone,
    address,
    latitude,
    longitude,
    updated_at: new Date().toISOString(),
  }

  if (encryptedData && publicKey) {
    updateData.encrypted_data = JSON.parse(encryptedData)
    updateData.public_key = publicKey
  }

  if (role === 'donor' || role === 'ngo') {
    updateData.organization_name = organizationName
    // Keep verification status as pending so admins must approve them
    updateData.verification_status = 'pending'
    if (docUrl && !encryptedData) {
      updateData.verification_documents = [docUrl]
    }
  } else {
    // If the user selected volunteer, ensure their status is verified
    updateData.verification_status = 'verified'
  }

  const { error } = await supabase
    .from('profiles')
    .upsert(updateData)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect(`/dashboard/${role}`)
}
