'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function claimDonationAction(donationId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Fetch profile to verify status
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('verification_status')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return { error: 'Could not retrieve user profile' }
  }

  if (profile.verification_status !== 'verified') {
    return { error: 'Your organization must be verified by an admin before you can claim donations.' }
  }

  // Call the database atomic RPC
  const { error } = await supabase.rpc('claim_donation', {
    p_donation_id: donationId,
    p_ngo_id: user.id,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/ngo/claims')
  revalidatePath('/dashboard/ngo/browse')
  redirect('/dashboard/ngo/claims')
}
