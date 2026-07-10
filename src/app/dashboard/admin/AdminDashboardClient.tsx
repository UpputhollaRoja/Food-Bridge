'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { verifyUserAction, approveDonationAction, rejectDonationAction, generateSignedUrl, suspendUserAction } from './actions'
import { createClient } from '@/lib/supabase/client'
import { signout } from '@/app/auth/actions'
import NotificationBell from '@/components/NotificationBell'
import ImageLightbox from '@/components/ImageLightbox'
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
  LogOut,
  ExternalLink,
  ImageOff,
  Clock,
  MapPin,
  Tag,
  AlertTriangle,
  Info,
  Loader2,
  Scale,
  UserMinus,
  AlertOctagon,
  FileSpreadsheet
} from 'lucide-react'
import EmptyState from '@/components/EmptyState'

interface AdminDashboardClientProps {
  profile: any
  stats: any
  pendingUsers: any[]
  donations: any[]
  allUsers: any[]
  reports: any[]
}

export default function AdminDashboardClient({ 
  profile, 
  stats, 
  pendingUsers: initialPending, 
  donations: initialDonations,
  allUsers: initialAllUsers,
  reports: initialReports
}: AdminDashboardClientProps) {
  const [pendingUsers, setPendingUsers] = React.useState(initialPending)
  const [donations, setDonations] = React.useState(initialDonations)
  const [allUsers, setAllUsers] = React.useState(initialAllUsers)
  const [reports, setReports] = React.useState(initialReports)
  const [activeTab, setActiveTab] = React.useState<'overview' | 'users' | 'reports'>('overview')
  const [report, setReport] = React.useState({ headline: 'Analyzing Platform Impact...', summary: 'Generating platform environmental statistics...' })
  const [loadingId, setLoadingId] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [docLoadingId, setDocLoadingId] = React.useState<string | null>(null)
  const [lightboxSrc, setLightboxSrc] = React.useState<string | null>(null)
  const [lightboxAlt, setLightboxAlt] = React.useState('')
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

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
        setAllUsers(allUsers.map(u => u.id === userId ? { ...u, verification_status: status } : u))
      }
    } catch {
      setError('An error occurred during verification action')
    } finally {
      setLoadingId(null)
    }
  }

  const handleSuspend = async (userId: string) => {
    setLoadingId(userId)
    setError(null)
    try {
      const res = await suspendUserAction(userId)
      if (res?.error) {
        setError(res.error)
      } else {
        setAllUsers(allUsers.map(u => u.id === userId ? { ...u, verification_status: 'suspended' } : u))
        setReports(reports.map(r => r.reported.id === userId ? { ...r, reported: { ...r.reported, verification_status: 'suspended' } } : r))
      }
    } catch {
      setError('An error occurred during account suspension')
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

  /**
   * Open verification document via a freshly-minted signed URL.
   * - Images (jpg/png/webp/gif) → open in the in-page lightbox
   * - PDFs / other → open in a new browser tab
   */
  const handleViewDocument = async (docPath: string, userId: string) => {
    setDocLoadingId(userId)
    try {
      const result = await generateSignedUrl('verification-documents', docPath, 600)
      const url = result.signedUrl || (() => {
        const { data } = supabase.storage.from('verification-documents').getPublicUrl(docPath)
        return data.publicUrl
      })()

      const isImage = /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(docPath)
      if (isImage) {
        setLightboxAlt('Verification Document')
        setLightboxSrc(url)
      } else {
        window.open(url, '_blank', 'noopener,noreferrer')
      }
    } catch {
      const { data } = supabase.storage.from('verification-documents').getPublicUrl(docPath)
      window.open(data.publicUrl, '_blank', 'noopener,noreferrer')
    } finally {
      setDocLoadingId(null)
    }
  }

  /**
   * Get the public (or signed) URL for a donation image.
   * For donation-images bucket which is typically public.
   */
  const getDonationImageUrl = (path: string) => {
    const { data } = supabase.storage.from('donation-images').getPublicUrl(path)
    return data.publicUrl
  }

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'available':
        return { background: 'var(--success-bg)', color: 'var(--success-text)', border: '1px solid var(--success-text)' }
      case 'reserved':
      case 'pickup_scheduled':
        return { background: 'var(--pending-bg)', color: 'var(--pending-text)', border: '1px solid var(--pending-text)' }
      case 'completed':
        return { background: 'var(--success-bg)', color: 'var(--success-text)', border: '1px solid var(--success-text)' }
      case 'cancelled':
        return { background: 'var(--urgent-bg)', color: 'var(--urgent-text)', border: '1px solid var(--urgent-text)' }
      default:
        return { background: 'var(--bg-page)', color: 'var(--text-secondary)', border: '1px solid var(--border-hairline)' }
    }
  }

  const formatDateTime = (iso: string | null) => {
    if (!iso) return '—'
    if (!mounted) return '—'
    return new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Lightbox for images and verification docs */}
      <ImageLightbox src={lightboxSrc} alt={lightboxAlt} onClose={() => setLightboxSrc(null)} />
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

      {/* Tab Selector */}
      <div className="flex border-b pb-px gap-6" style={{ borderColor: 'var(--border-hairline)' }}>
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-px ${
            activeTab === 'overview'
              ? 'text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          style={{ borderBottomColor: activeTab === 'overview' ? 'var(--brand-green)' : 'transparent', color: activeTab === 'overview' ? 'var(--brand-green)' : undefined }}
        >
          Overview & Approvals
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-px ${
            activeTab === 'users'
              ? 'text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          style={{ borderBottomColor: activeTab === 'users' ? 'var(--brand-green)' : 'transparent', color: activeTab === 'users' ? 'var(--brand-green)' : undefined }}
        >
          User Directory & NGO Stats
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-px flex items-center gap-1.5 ${
            activeTab === 'reports'
              ? 'text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          style={{ borderBottomColor: activeTab === 'reports' ? 'var(--brand-green)' : 'transparent', color: activeTab === 'reports' ? 'var(--brand-green)' : undefined }}
        >
          <span>Reports Queue</span>
          {reports.length > 0 && (
            <span className="h-5 min-w-[20px] px-1.5 flex items-center justify-center text-[10px] font-black text-white bg-red-600 rounded-full">
              {reports.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          {error && (
            <div
              className="flex items-center gap-2 rounded-xl border p-4 text-sm shadow-sm"
              style={{ borderColor: 'var(--urgent-bg)', background: 'var(--urgent-bg)', color: 'var(--urgent-text)' }}
            >
              <ShieldAlert className="h-5 w-5 shrink-0 stroke-[2.5]" />
              <span>{error}</span>
            </div>
          )}
          {/* Stats row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="stat-card-button p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-muted-foreground block font-medium">Active Platform Users</span>
                <span className="font-heading text-2xl font-black text-foreground mt-1.5 block">{stats.active_users || 0}</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="stat-card-button p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-muted-foreground block font-medium">Food Recovery Rate</span>
                <span className="font-heading text-2xl font-black text-foreground mt-1.5 block">{Math.round(stats.recovery_rate || 0)}%</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <Percent className="h-5 w-5" />
              </div>
            </div>
            <div className="stat-card-button p-5 flex items-center justify-between">
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
          <div className="relative rounded-2xl glass-card-accent p-6 shadow-sm">
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
              <h2 className="font-heading text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
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
                      className="stat-card-button p-5 space-y-4"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between border-b border-border pb-2">
                        <div>
                          <h4 className="font-heading font-bold text-foreground text-sm">{user.full_name}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">{user.organization_name || 'Individual Profile'}</p>
                        </div>
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-black uppercase shadow-sm"
                          style={{ background: 'var(--pending-bg)', color: 'var(--pending-text)', border: '1px solid var(--pending-text)' }}
                        >
                          {user.role}
                        </span>
                      </div>

                      {/* Contact details */}
                      <div className="space-y-1.5 text-xs text-muted-foreground">
                        <p>
                          Phone:{' '}
                          <span className="text-foreground font-medium">
                            {user.phone || <em className="opacity-50">Not provided</em>}
                          </span>
                        </p>
                        <p>
                          Address:{' '}
                          <span className="text-foreground font-medium">
                            {user.address || <em className="opacity-50">Not provided</em>}
                          </span>
                        </p>
                      </div>

                      {/* Verification document */}
                      {user.verification_documents && user.verification_documents[0] ? (
                        <div className="pt-1.5">
                          <button
                            type="button"
                            onClick={() => handleViewDocument(user.verification_documents[0], user.id)}
                            disabled={docLoadingId === user.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors shadow-sm disabled:opacity-60"
                            style={{ borderColor: 'var(--border-hairline)', background: 'var(--bg-card)', color: 'var(--text-secondary)' }}
                          >
                            {docLoadingId === user.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <FileText className="h-3.5 w-3.5" />
                            )}
                            <span>{docLoadingId === user.id ? 'Generating link…' : 'View Document'}</span>
                            <ExternalLink className="h-3 w-3 opacity-60" />
                          </button>
                        </div>
                      ) : (
                        <p className="text-[11px] italic" style={{ color: 'var(--text-secondary)' }}>No verification document uploaded.</p>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
                        <button
                          onClick={() => handleVerify(user.id, 'rejected')}
                          disabled={loadingId === user.id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors shadow-sm"
                          style={{ borderColor: 'var(--urgent-bg)', background: 'var(--urgent-bg)', color: 'var(--urgent-text)' }}
                        >
                          <X className="h-3.5 w-3.5" />
                          <span>Reject</span>
                        </button>
                        <button
                          onClick={() => handleVerify(user.id, 'verified')}
                          disabled={loadingId === user.id}
                          className="btn-primary flex items-center gap-1.5 px-4 py-2"
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
                <h2 className="font-heading text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
                  <Activity className="h-5 w-5" style={{ color: 'var(--pending-text)' }} />
                  <span>Pending Approvals</span>
                </h2>

                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
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
                        className="stat-card-button p-4 space-y-3"
                      >
                        {/* Top row: image + title + status badge */}
                        <div className="flex items-start gap-3">
                          {/* Image thumbnail — click to open full-size lightbox */}
                          <div
                            className="h-16 w-16 shrink-0 rounded-xl overflow-hidden border flex items-center justify-center"
                            style={{ borderColor: 'var(--border-hairline)', background: 'var(--bg-card)' }}
                          >
                            {d.images && d.images[0] ? (
                              <button
                                type="button"
                                className="h-full w-full cursor-zoom-in focus:outline-none"
                                title="View full size"
                                onClick={() => {
                                  setLightboxAlt(d.title)
                                  setLightboxSrc(getDonationImageUrl(d.images[0]))
                                }}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={getDonationImageUrl(d.images[0])}
                                  alt={d.title}
                                  className="h-full w-full object-cover hover:opacity-90 transition-opacity"
                                />
                              </button>
                            ) : (
                              <div className="flex flex-col items-center justify-center gap-1 p-1 text-center" style={{ color: 'var(--text-secondary)' }}>
                                <ImageOff className="h-5 w-5" />
                                <span className="text-[8px] font-semibold text-center leading-tight">No image provided</span>
                              </div>
                            )}
                          </div>

                          {/* Title + donor + status */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-heading font-bold text-foreground text-sm leading-tight">{d.title}</h4>
                              <span
                                className="px-2 py-0.5 rounded text-[9px] font-black uppercase shrink-0 status-badge"
                                style={{ background: 'var(--pending-bg)', color: 'var(--pending-text)', border: '1px solid var(--pending-text)' }}
                              >
                                {d.status.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <p className="text-[11px]" style={{ color: 'var(--pending-text)' }}>
                              Donor: <strong>{d.profiles?.organization_name || d.profiles?.full_name}</strong>
                              {' '}• Yield: {d.quantity} {d.quantity_unit} (~{d.estimated_meals} meals)
                            </p>
                          </div>
                        </div>

                        {/* Detail rows */}
                        <div className="grid grid-cols-1 gap-1.5 text-[11px]" style={{ color: 'var(--pending-text)' }}>
                          {/* Category */}
                          {d.category && (
                            <div className="flex items-center gap-1.5">
                              <Tag className="h-3 w-3 shrink-0" />
                              <span>Category: <strong className="capitalize">{d.category.replace(/_/g, ' ')}</strong></span>
                            </div>
                          )}
                          {/* Expiry */}
                          {d.expiry_at && (
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3 w-3 shrink-0" />
                              <span>Expires: <strong>{formatDateTime(d.expiry_at)}</strong></span>
                            </div>
                          )}
                          {/* Pickup location */}
                          {d.pickup_location && (
                            <div className="flex items-start gap-1.5">
                              <MapPin className="h-3 w-3 shrink-0 mt-0.5" />
                              <span>Pickup: <strong>{d.pickup_location}</strong></span>
                            </div>
                          )}
                          {/* Pickup window */}
                          {(d.pickup_window_start || d.pickup_window_end) && (
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3 w-3 shrink-0" />
                              <span>
                                Window: <strong>{formatDateTime(d.pickup_window_start)}</strong>
                                {d.pickup_window_end ? <> — <strong>{formatDateTime(d.pickup_window_end)}</strong></> : null}
                              </span>
                            </div>
                          )}
                          {/* Allergens */}
                          {d.allergen_info && (
                            <div className="flex items-start gap-1.5">
                              <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
                              <span>Allergens: <strong>{d.allergen_info}</strong></span>
                            </div>
                          )}
                          {/* Storage */}
                          {d.storage_instructions && (
                            <div className="flex items-start gap-1.5">
                              <Info className="h-3 w-3 shrink-0 mt-0.5" />
                              <span>Storage: <strong>{d.storage_instructions}</strong></span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div
                          className="flex items-center justify-end gap-3 pt-2 border-t"
                          style={{ borderColor: 'rgba(99,56,6,0.2)' }}
                        >
                          <button
                            onClick={() => handleDonationAction(d.id, 'reject')}
                            disabled={loadingId === d.id}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors shadow-sm"
                            style={{ borderColor: 'var(--urgent-bg)', background: 'var(--urgent-bg)', color: 'var(--urgent-text)' }}
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Reject</span>
                          </button>
                          <button
                            onClick={() => handleDonationAction(d.id, 'approve')}
                            disabled={loadingId === d.id}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-transparent text-xs font-bold text-white transition-colors shadow-md"
                            style={{ background: 'var(--brand-green)' }}
                            onMouseOver={e => (e.currentTarget.style.background = 'var(--brand-green-hover)')}
                            onMouseOut={e => (e.currentTarget.style.background = 'var(--brand-green)')}
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
                <h2 className="font-heading text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
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

                        <span
                          className="px-2 py-0.5 rounded text-[9px] font-black uppercase shrink-0 status-badge"
                          style={getStatusBadgeStyle(d.status)}
                        >
                          {d.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          <h2 className="font-heading text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <span>Platform User Directory & NGO Statistics</span>
          </h2>

          <div className="rounded-2xl glass-card overflow-hidden border shadow-sm" style={{ borderColor: 'var(--border-hairline)' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b font-bold" style={{ borderColor: 'var(--border-hairline)', background: 'var(--bg-page)', color: 'var(--text-secondary)' }}>
                    <th className="p-4">Organization / User</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">NGO Performance (Claimed vs Confirmed)</th>
                    <th className="p-4">Contact Info</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderTopColor: 'var(--border-hairline)', borderColor: 'var(--border-hairline)' }}>
                  {allUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">No users registered on the platform yet.</td>
                    </tr>
                  ) : (
                    allUsers.map((user) => {
                      // NGO specific stats
                      let totalClaimed = 0
                      let totalConfirmed = 0
                      let isSuspicious = false

                      if (user.role === 'ngo' && user.claims) {
                        totalClaimed = user.claims.length
                        totalConfirmed = user.claims.filter((c: any) => c.status === 'completed').length
                        
                        // Red flag: High claims and less than 50% confirmed
                        isSuspicious = totalClaimed >= 3 && (totalConfirmed / totalClaimed < 0.5)
                      }

                      return (
                        <tr key={user.id} className="transition-colors hover:opacity-80">
                          <td className="p-4 font-semibold" style={{ color: 'var(--text-primary)' }}>
                            <div>{user.organization_name || user.full_name}</div>
                            {user.organization_name && <div className="text-[10px] text-muted-foreground font-normal">Contact: {user.full_name}</div>}
                          </td>
                          <td className="p-4 capitalize">{user.role}</td>
                          <td className="p-4">
                            <span 
                              className="px-2 py-0.5 rounded text-[9px] font-bold uppercase"
                              style={
                                user.verification_status === 'verified'
                                  ? { background: 'var(--success-bg)', color: 'var(--success-text)', border: '1px solid var(--success-text)' }
                                  : user.verification_status === 'suspended'
                                    ? { background: 'var(--urgent-bg)', color: 'var(--urgent-text)', border: '1px solid var(--urgent-text)' }
                                    : user.verification_status === 'rejected'
                                      ? { background: 'var(--urgent-bg)', color: 'var(--urgent-text)', border: '1px solid var(--urgent-text)' }
                                      : { background: 'var(--pending-bg)', color: 'var(--pending-text)', border: '1px solid var(--pending-text)' }
                              }
                            >
                              {user.verification_status}
                            </span>
                          </td>
                          <td className="p-4">
                            {user.role === 'ngo' ? (
                              <div className="space-y-1">
                                <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                  Claimed: {totalClaimed} • Confirmed: {totalConfirmed}
                                </div>
                                {isSuspicious && (
                                  <div className="inline-flex items-center gap-1 text-[9px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                                    <AlertOctagon className="h-3 w-3" />
                                    <span>High Unconfirmed Claims Rate</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span style={{ color: 'var(--text-secondary)' }}>—</span>
                            )}
                          </td>
                          <td className="p-4 space-y-0.5 text-muted-foreground">
                            {user.phone && <div>Tel: <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{user.phone}</span></div>}
                            {user.address && <div className="text-[10px] truncate max-w-xs">{user.address}</div>}
                          </td>
                          <td className="p-4 text-right">
                            {user.verification_status === 'suspended' ? (
                              <span className="text-[11px] font-semibold text-red-600 block">Account Suspended</span>
                            ) : user.verification_status === 'pending' ? (
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleVerify(user.id, 'verified')}
                                  disabled={loadingId === user.id}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-green-200 text-green-700 hover:bg-green-50 text-[11px] font-semibold transition-colors disabled:opacity-50"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={() => handleVerify(user.id, 'rejected')}
                                  disabled={loadingId === user.id}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-[11px] font-semibold transition-colors disabled:opacity-50"
                                >
                                  <X className="h-3.5 w-3.5" />
                                  <span>Reject</span>
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleSuspend(user.id)}
                                disabled={loadingId === user.id}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-[11px] font-semibold transition-colors disabled:opacity-50"
                              >
                                <UserMinus className="h-3.5 w-3.5" />
                                <span>Suspend</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          <h2 className="font-heading text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
            <AlertOctagon className="h-5 w-5 text-red-600" />
            <span>Fraud & Policy Violations Reports Queue</span>
          </h2>

          {reports.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="Reports Queue Empty"
              description="No user reports have been submitted for review."
            />
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div 
                  key={report.id}
                  className="stat-card-button p-5 space-y-4"
                  style={{ borderColor: 'var(--border-hairline)' }}
                >
                  <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--border-hairline)' }}>
                    <div className="text-xs text-muted-foreground">
                      Reported: <strong className="font-bold" style={{ color: 'var(--text-primary)' }}>{report.reported.organization_name || report.reported.full_name}</strong>
                      <span className="capitalize ml-1 px-1.5 py-0.5 rounded text-[9px] font-semibold" style={{ background: 'var(--bg-page)' }}>{report.reported.role}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Submitted: {formatDateTime(report.created_at)}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Violation Details:</h4>
                    <p className="text-xs p-3 rounded-xl border whitespace-pre-wrap leading-relaxed" style={{ background: 'var(--bg-page)', color: 'var(--text-secondary)', borderColor: 'var(--border-hairline)' }}>
                      {report.reason}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t text-[11px] text-muted-foreground" style={{ borderColor: 'var(--border-hairline)' }}>
                    <div>
                      Reporter: <strong className="font-semibold" style={{ color: 'var(--text-primary)' }}>{report.reporter.organization_name || report.reporter.full_name}</strong>
                      <span className="capitalize ml-1 px-1.5 py-0.5 rounded text-[9px] font-semibold" style={{ background: 'var(--bg-page)' }}>{report.reporter.role}</span>
                    </div>

                    <div>
                      {report.reported.verification_status === 'suspended' ? (
                        <span className="font-semibold text-red-600">Action Taken: Suspended</span>
                      ) : (
                        <button
                          onClick={() => handleSuspend(report.reported.id)}
                          disabled={loadingId === report.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition-colors shadow-sm disabled:opacity-50"
                        >
                          <UserMinus className="h-3.5 w-3.5" />
                          <span>Suspend Organization</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
