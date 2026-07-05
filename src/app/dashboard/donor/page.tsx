import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/auth-helpers'
import { createClient } from '@/lib/supabase/server'
import DonorDashboardClient from './DonorDashboardClient'

export default async function DonorDashboard() {
  const result = await getUserProfile()

  if (!result || !result.user) {
    redirect('/login')
  }

  const { profile } = result

  if (!profile || (profile.role !== 'donor' && profile.role !== 'admin')) {
    redirect('/')
  }

  const supabase = await createClient()

  // Fetch stats from donor_stats view
  const { data: stats } = await supabase
    .from('donor_stats')
    .select('*')
    .eq('donor_id', profile.id)
    .single()

  // Fetch all donations by this donor
  const { data: donations, error } = await supabase
    .from('donations')
    .select(`
      *,
      claims (
        id,
        status,
        ngo:profiles (
          organization_name,
          full_name,
          phone,
          address,
          latitude,
          longitude
        ),
        deliveries (
          id,
          status,
          volunteer:profiles (
            full_name,
            phone
          )
        )
      )
    `)
    .eq('donor_id', profile.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching donor donations:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    })
  }

  return (
    <div className="min-h-screen bg-transparent px-4 py-8">
      <DonorDashboardClient 
        profile={profile} 
        stats={stats || { total_donations: 0, meals_donated: 0, waste_prevented_kg: 0 }} 
        initialDonations={donations || []} 
      />
    </div>
  )
}
