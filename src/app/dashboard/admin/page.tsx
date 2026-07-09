import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/auth-helpers'
import { createClient } from '@/lib/supabase/server'
import AdminDashboardClient from './AdminDashboardClient'

export default async function AdminDashboard() {
  const result = await getUserProfile()

  if (!result || !result.user) {
    redirect('/login')
  }

  const { profile } = result

  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  const supabase = await createClient()

  // Fetch admin stats from view
  const { data: stats } = await supabase
    .from('admin_stats')
    .select('*')
    .single()

  // Fetch pending registrations
  const { data: pendingUsers } = await supabase
    .from('profiles')
    .select('id, role, full_name, organization_name, phone, address, verification_status, verification_documents, created_at, updated_at')
    .eq('verification_status', 'pending')
    .in('role', ['donor', 'ngo'])
    .order('created_at', { ascending: true })

  // Fetch active donations list
  const { data: donations } = await supabase
    .from('donations')
    .select(`
      id,
      donor_id,
      title,
      category,
      quantity,
      quantity_unit,
      estimated_meals,
      expiry_at,
      pickup_location,
      pickup_latitude,
      pickup_longitude,
      pickup_window_start,
      pickup_window_end,
      storage_instructions,
      allergen_info,
      images,
      status,
      priority_score,
      created_at,
      updated_at,
      profiles (
        organization_name,
        full_name
      )
    `)
    .order('created_at', { ascending: false })

  // Fetch all users with nested claims for directory and NGO stats
  const { data: allUsers } = await supabase
    .from('profiles')
    .select(`
      id,
      role,
      full_name,
      organization_name,
      phone,
      address,
      verification_status,
      created_at,
      claims (
        id,
        status
      )
    `)
    .in('role', ['donor', 'ngo'])
    .order('created_at', { ascending: false })

  // Fetch reports queue
  const { data: reports } = await supabase
    .from('reports')
    .select(`
      id,
      reason,
      created_at,
      reporter:profiles!reports_reporter_id_fkey (
        id,
        full_name,
        organization_name,
        role
      ),
      reported:profiles!reports_reported_user_id_fkey (
        id,
        full_name,
        organization_name,
        role,
        verification_status
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-transparent px-4 py-8">
      <AdminDashboardClient 
        profile={profile} 
        stats={stats || { active_users: 0, recovery_rate: 0, completion_rate: 0 }} 
        pendingUsers={pendingUsers || []} 
        donations={donations || []} 
        allUsers={allUsers || []}
        reports={reports || []}
      />
    </div>
  )
}
