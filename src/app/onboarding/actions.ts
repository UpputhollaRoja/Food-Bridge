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
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string
  const organizationName = formData.get('organizationName') as string
  const docUrl = formData.get('docUrl') as string
  const latStr = formData.get('latitude') as string
  const lngStr = formData.get('longitude') as string

  const latitude = latStr ? parseFloat(latStr) : 37.7749 // default fallback coordinates (SF)
  const longitude = lngStr ? parseFloat(lngStr) : -122.4194

  const updateData: Record<string, string | number | string[] | null> = {
    role,
    phone,
    address,
    latitude,
    longitude,
    updated_at: new Date().toISOString(),
  }

  if (role === 'donor' || role === 'ngo') {
    updateData.organization_name = organizationName
    // Automatically verify and accept the profile in development upon submitting details
    updateData.verification_status = 'verified'
    if (docUrl) {
      updateData.verification_documents = [docUrl]
    }
  } else {
    // If the user selected volunteer, ensure their status is verified
    updateData.verification_status = 'verified'
  }

  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect(`/dashboard/${role}`)
}
