import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/auth-helpers'
import { createClient } from '@/lib/supabase/server'
import FoodBrowser from './FoodBrowser'

export default async function BrowsePage() {
  const result = await getUserProfile()

  if (!result || !result.user) {
    redirect('/login')
  }

  const { profile } = result

  if (!profile || (profile.role !== 'ngo' && profile.role !== 'admin')) {
    redirect('/')
  }

  const supabase = await createClient()

  const { data: donations, error } = await supabase.rpc('get_nearby_donations', {
    p_lat: profile.latitude || 37.7749,
    p_lng: profile.longitude || -122.4194,
    p_max_distance_km: 100.0,
  })

  if (error) {
    console.error('Error fetching nearby donations:', error)
  }

  return (
    <div className="min-h-screen bg-transparent px-4 py-8">
      <FoodBrowser 
        initialDonations={donations || []} 
        verificationStatus={profile.verification_status} 
      />
    </div>
  )
}
