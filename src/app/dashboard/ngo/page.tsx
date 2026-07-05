/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/auth-helpers'
import { createClient } from '@/lib/supabase/server'
import NgoDashboardClient from './NgoDashboardClient'

export default async function NgoDashboard() {
  const result = await getUserProfile()

  if (!result || !result.user) {
    redirect('/login')
  }

  const { profile } = result

  if (!profile || (profile.role !== 'ngo' && profile.role !== 'admin')) {
    redirect('/')
  }

  const supabase = await createClient()

  // Fetch stats from ngo_stats view
  const { data: stats } = await supabase
    .from('ngo_stats')
    .select('*')
    .eq('ngo_id', profile.id)
    .single()

  // Fetch NGO active claims (excluding completed/cancelled)
  const { data: claims, error } = await supabase
    .from('claims')
    .select(`
      id,
      status,
      claimed_at,
      donations (
        id,
        title,
        category,
        quantity,
        quantity_unit,
        pickup_location,
        expiry_at
      ),
      deliveries (
        id,
        status,
        volunteer_id
      )
    `)
    .eq('ngo_id', profile.id)
    .neq('status', 'cancelled')
    .neq('status', 'completed')
    .order('claimed_at', { ascending: false })

  if (error) {
    console.error('Error fetching NGO claims:', error)
  }

  // Fetch volunteer info if assigned
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
      <NgoDashboardClient 
        profile={profile} 
        stats={stats || { donations_received: 0, beneficiaries_served_est: 0, completed_claims: 0 }} 
        initialClaims={enhancedClaims} 
      />
    </div>
  )
}
