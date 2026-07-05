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
    .select('*')
    .eq('verification_status', 'pending')
    .in('role', ['donor', 'ngo'])
    .order('created_at', { ascending: true })

  // Fetch active donations list
  const { data: donations } = await supabase
    .from('donations')
    .select(`
      *,
      profiles (
        organization_name,
        full_name
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
      />
    </div>
  )
}
