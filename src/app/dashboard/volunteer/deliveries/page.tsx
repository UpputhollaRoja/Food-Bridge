import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/auth-helpers'
import { createClient } from '@/lib/supabase/server'
import DeliveriesListClient from './DeliveriesListClient'

export default async function DeliveriesPage() {
  const result = await getUserProfile()

  if (!result || !result.user) {
    redirect('/login')
  }

  const { profile } = result

  if (!profile || (profile.role !== 'volunteer' && profile.role !== 'admin')) {
    redirect('/')
  }

  const supabase = await createClient()

  // Fetch unassigned deliveries
  // Fetch unassigned deliveries
  const { data: unassigned, error: err1 } = await supabase
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
    .eq('status', 'unassigned')

  if (err1) {
    console.error('Error fetching unassigned deliveries:', err1)
  }

  // Fetch assigned deliveries (active, excluding confirmed ones)
  const { data: assigned, error: err2 } = await supabase
    .from('deliveries')
    .select(`
      id,
      status,
      proof_image_url,
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
    .eq('volunteer_id', profile.id)
    .neq('status', 'confirmed')

  if (err2) {
    console.error('Error fetching assigned deliveries:', err2)
  }

  return (
    <div className="min-h-screen bg-transparent px-4 py-8">
      <DeliveriesListClient 
        initialUnassigned={unassigned || []} 
        initialAssigned={assigned || []} 
        volunteerId={profile.id}
      />
    </div>
  )
}
