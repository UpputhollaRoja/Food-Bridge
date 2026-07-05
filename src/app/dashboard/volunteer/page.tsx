import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/auth-helpers'
import { createClient } from '@/lib/supabase/server'
import VolunteerDashboardClient from './VolunteerDashboardClient'

export default async function VolunteerDashboard() {
  const result = await getUserProfile()

  if (!result || !result.user) {
    redirect('/login')
  }

  const { profile } = result

  if (!profile || (profile.role !== 'volunteer' && profile.role !== 'admin')) {
    redirect('/')
  }

  const supabase = await createClient()

  // Fetch stats from volunteer_stats view
  const { data: stats } = await supabase
    .from('volunteer_stats')
    .select('*')
    .eq('volunteer_id', profile.id)
    .single()

  // Fetch active assigned deliveries
  const { data: activeDeliveries, error } = await supabase
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
          expiry_at
        ),
        profiles (
          full_name,
          organization_name,
          phone,
          address
        )
      )
    `)
    .eq('volunteer_id', profile.id)
    .neq('status', 'confirmed')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching volunteer active deliveries:', error)
  }

  return (
    <div className="min-h-screen bg-transparent px-4 py-8">
      <VolunteerDashboardClient 
        profile={profile} 
        stats={stats || { deliveries_completed: 0, avg_delivery_time_hours: 0 }} 
        activeDeliveries={activeDeliveries || []} 
      />
    </div>
  )
}
