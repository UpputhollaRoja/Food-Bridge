/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/auth-helpers'
import { createClient } from '@/lib/supabase/server'
import ClaimsListClient from './ClaimsListClient'

export default async function ClaimsPage() {
  const result = await getUserProfile()

  if (!result || !result.user) {
    redirect('/login')
  }

  const { profile } = result

  if (!profile || (profile.role !== 'ngo' && profile.role !== 'admin')) {
    redirect('/')
  }

  const supabase = await createClient()

  // Fetch claims with joined donations and deliveries
  const { data: claims, error } = await supabase
    .from('claims')
    .select(`
      id,
      status,
      claimed_at,
      donation_id,
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
        expiry_at
      ),
      deliveries (
        id,
        status,
        volunteer_id,
        proof_image_url
      )
    `)
    .eq('ngo_id', profile.id)
    .order('claimed_at', { ascending: false })

  if (error) {
    console.error('Error fetching claims:', error)
  }

  // Enhance deliveries with volunteer profile info if assigned
  let enhancedClaims = claims || []
  if (enhancedClaims.length > 0) {
    const volunteerIds = enhancedClaims
      .map(c => c.deliveries?.[0]?.volunteer_id)
      .filter((id): id is string => !!id)

    if (volunteerIds.length > 0) {
      const { data: volunteers } = await supabase
        .from('profiles')
        .select('id, full_name, phone')
        .in('id', volunteerIds)

      const volunteerMap = new Map(volunteers?.map(v => [v.id, v]))
      
      enhancedClaims = enhancedClaims.map(c => {
        if (c.deliveries?.[0]?.volunteer_id) {
          const vol = volunteerMap.get(c.deliveries[0].volunteer_id)
          if (vol) {
            (c.deliveries[0] as any).volunteer = vol
          }
        }
        return c
      })
    }
  }

  return (
    <div className="min-h-screen bg-transparent px-4 py-8">
      <ClaimsListClient 
        initialClaims={enhancedClaims} 
        ngoLat={profile?.latitude}
        ngoLng={profile?.longitude}
        ngoAddress={profile?.address}
      />
    </div>
  )
}
