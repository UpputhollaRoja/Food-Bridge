'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { verifyUserAction, approveDonationAction, rejectDonationAction } from './actions'
import { createClient } from '@/lib/supabase/client'
import { signout } from '@/app/auth/actions'
import NotificationBell from '@/components/NotificationBell'
import { 
  Users, 
  Percent, 
  Activity, 
  Check, 
  X, 
  FileText, 
  ShieldAlert, 
  Sparkles, 
  Globe,
  Building,
  Inbox,
  LogOut
} from 'lucide-react'
import EmptyState from '@/components/EmptyState'

interface AdminDashboardClientProps {
  profile: any
  stats: any
  pendingUsers: any[]
  donations: any[]
}

export default function AdminDashboardClient({ profile, stats, pendingUsers: initialPending, donations: initialDonations }: AdminDashboardClientProps) {
  const [pendingUsers, setPendingUsers] = React.useState(initialPending)
  const [donations, setDonations] = React.useState(initialDonations)
  const [report, setReport] = React.useState({ headline: 'Analyzing Platform Impact...', summary: 'Generating platform environmental statistics...' })
  const [loadingId, setLoadingId] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const pendingDonations = donations.filter(d => d.status === 'pending_approval')
  const activeDonations = donations.filter(d => d.status !== 'pending_approval')

  const supabase = createClient()

  // Fetch AI Platform Impact
  React.useEffect(() => {
    const fetchImpact = async () => {
      try {
        const res = await fetch('/api/ai/impact-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            totalMeals: donations.filter(d => d.status === 'completed').reduce((acc, curr) => acc + (curr.estimated_meals || 0), 0) || 120,
            totalKg: donations.filter(d => d.status === 'completed').reduce((acc, curr) => acc + (parseFloat(curr.quantity) || 0), 0) || 50,
            activeUsers: stats.active_users,
            role: 'admin',
          }),
        })
        const data = await res.json()
        if (data.summary) {
          setReport({ headline: data.headline, summary: data.summary })
        }
      } catch (err) {
        console.error(err)
      }
    }

    fetchImpact()
  }, [donations, stats])

  const handleVerify = async (userId: string, status: 'verified' | 'rejected') => {
    setLoadingId(userId)
    setError(null)
    try {
      const res = await verifyUserAction(userId, status)
      if (res?.error) {
        setError(res.error)
      } else {
        setPendingUsers(pendingUsers.filter(u => u.id !== userId))
      }
    } catch {
      setError('An error occurred during verification action')
    } finally {
      setLoadingId(null)
    }
  }

  const handleDonationAction = async (donationId: string, action: 'approve' | 'reject') => {
    setLoadingId(donationId)
    setError(null)
    try {
      const res = action === 'approve' 
        ? await approveDonationAction(donationId)
        : await rejectDonationAction(donationId)
        
      if (res?.error) {
        setError(res.error)
      } else {
        const newStatus = action === 'approve' ? 'available' : 'cancelled'
        setDonations(donations.map(d => d.id === donationId ? { ...d, status: newStatus } : d))
      }
    } catch {
      setError(`An error occurred during donation ${action}`)
    } finally {
      setLoadingId(null)
    }
  }

  const getPublicUrl = (path: string) => {
    const { data } = supabase.storage.from('verification-documents').getPublicUrl(path)
    return data.publicUrl
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-blue-700 bg-blue-50 border-blue-200'
      case 'reserved': return 'text-amber-700 bg-amber-50 border-amber-205'
      case 'pickup_scheduled': return 'text-purple-750 bg-purple-55 border-purple-200'
      case 'completed': return 'text-emerald-700 bg-emerald-50 border-emerald-250/50'
      case 'cancelled': return 'text-red-755 bg-red-50 border-red-200'
      default: return 'text-slate-700 bg-slate-50 border-slate-200'
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Navbar Header */}
      <header className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-primary uppercase">Administration System</span>
          <h1 className="text-3xl font-heading font-black text-foreground tracking-tight mt-1">Platform Control Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBell userId={profile.id} />
          <button
            onClick={() => signout()}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10 transition-all shadow-sm"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-250 bg-red-50 p-4 text-sm text-red-800 shadow-sm">
          <ShieldAlert className="h-5 w-5 shrink-0 stroke-[2.5]" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl glass-card p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-muted-foreground block font-medium">Active Platform Users</span>
            <span className="font-heading text-2xl font-black text-foreground mt-1.5 block">{stats.active_users || 0}</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <Users className="h-5 w-5" />
          </div>
        </div>
        <div className="rounded-2xl glass-card p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-muted-foreground block font-medium">Food Recovery Rate</span>
            <span className="font-heading text-2xl font-black text-foreground mt-1.5 block">{Math.round(stats.recovery_rate || 0)}%</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <Percent className="h-5 w-5" />
          </div>
        </div>
        <div className="rounded-2xl glass-card p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-muted-foreground block font-medium">Delivery Completion</span>
            <span className="font-heading text-2xl font-black text-foreground mt-1.5 block">{Math.round(stats.completion_rate || 0)}%</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <Activity className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* AI impact card */}
      <div className="relative rounded-2xl glass-card-accent p-6">
        <div className="absolute top-4 right-4 text-primary flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI Platform Analysis</span>
        </div>
        <h3 className="font-heading font-bold text-foreground text-md flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          {report.headline}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed mt-2.5 max-w-2xl">{report.summary}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Verification Queue */}
        <div className="lg:col-span-6 space-y-4">
          <h2 className="font-heading text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            <span>Verification Queue</span>
          </h2>

          {pendingUsers.length === 0 ? (
            <EmptyState 
              icon={Inbox} 
              title="Queue Empty" 
              description="No pending registrations at the moment." 
            />
          ) : (
            <div className="space-y-4">
              {pendingUsers.map((user) => (
                <div 
                  key={user.id}
                  className="rounded-2xl glass-card p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <div>
                      <h4 className="font-heading font-bold text-foreground text-sm">{user.full_name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{user.organization_name || 'Individual Profile'}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-black uppercase shadow-sm">
                      {user.role}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <p>Phone: <span className="text-foreground font-medium">{user.phone}</span></p>
                    <p>Address: <span className="text-foreground font-medium">{user.address}</span></p>
                  </div>

                  {user.verification_documents && user.verification_documents[0] && (
                    <div className="pt-1.5">
                      <a
                        href={getPublicUrl(user.verification_documents[0])}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-sm"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>View Verification Docs</span>
                      </a>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
                    <button
                      onClick={() => handleVerify(user.id, 'rejected')}
                      disabled={loadingId === user.id}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-destructive/20 bg-destructive/10 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-colors shadow-sm"
                    >
                      <X className="h-3.5 w-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleVerify(user.id, 'verified')}
                      disabled={loadingId === user.id}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-transparent bg-primary text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-md"
                    >
                      <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                      <span>Verify</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Donation Listings monitor */}
        <div className="lg:col-span-6 space-y-8">
          {/* Pending Approvals */}
          <div className="space-y-4">
            <h2 className="font-heading text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <Activity className="h-5 w-5 text-amber-500" />
              <span>Pending Approvals</span>
            </h2>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
              {pendingDonations.length === 0 ? (
                <EmptyState 
                  icon={Check} 
                  title="All Caught Up" 
                  description="No donations are waiting for approval." 
                />
              ) : (
                pendingDonations.map((d) => (
                  <div 
                    key={d.id}
                    className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="font-heading font-bold text-foreground text-sm">{d.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          Donor: {d.profiles?.organization_name || d.profiles?.full_name} • Yield: {d.quantity} {d.quantity_unit} (~{d.estimated_meals} meals)
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-black border uppercase shrink-0 text-amber-700 bg-amber-100 border-amber-300">
                        {d.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-amber-200/50">
                      <button
                        onClick={() => handleDonationAction(d.id, 'reject')}
                        disabled={loadingId === d.id}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-destructive/20 bg-destructive/10 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-colors shadow-sm"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={() => handleDonationAction(d.id, 'approve')}
                        disabled={loadingId === d.id}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-transparent bg-primary text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-md"
                      >
                        <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                        <span>Approve</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Listings */}
          <div className="space-y-4">
            <h2 className="font-heading text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <span>Active Platform Listings</span>
            </h2>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
              {activeDonations.length === 0 ? (
                <EmptyState 
                  icon={Inbox} 
                  title="No Active Listings" 
                  description="No approved food listings available." 
                />
              ) : (
                activeDonations.map((d) => (
                  <div 
                    key={d.id}
                    className="rounded-2xl border border-border bg-card p-4 space-y-2 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="space-y-1">
                      <h4 className="font-heading font-bold text-foreground text-xs">{d.title}</h4>
                      <p className="text-[10px] text-muted-foreground">
                        Donor: {d.profiles?.organization_name || d.profiles?.full_name} • Yield: {d.quantity} {d.quantity_unit} (~{d.estimated_meals} meals)
                      </p>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[9px] font-black border uppercase shrink-0 ${getStatusColor(d.status)}`}>
                      {d.status.replace('_', ' ')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
