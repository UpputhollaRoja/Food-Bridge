'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import Link from 'next/link'
import NotificationBell from '@/components/NotificationBell'
import { signout } from '@/app/auth/actions'
import { 
  Plus, 
  Scale, 
  ShieldAlert, 
  Activity, 
  Globe, 
  Sparkles, 
  LogOut, 
  Loader2,
  Building,
  Box,
  Navigation,
  MapPin
} from 'lucide-react'
import DeliveryMap from '@/components/DeliveryMap'
import ExpiryBadge from '@/components/ExpiryBadge'
import EmptyState from '@/components/EmptyState'
import VerifiedBadge from '@/components/VerifiedBadge'
import ReportModal from '@/components/ReportModal'

interface DonorDashboardClientProps {
  profile: any
  stats: any
  initialDonations: any[]
}

export default function DonorDashboardClient({ profile, stats, initialDonations }: DonorDashboardClientProps) {
  const [donations] = React.useState(initialDonations)
  const [report, setReport] = React.useState({ headline: 'Analyzing Impact...', summary: 'Generating environmental summary...' })
  const [matchingDonationId, setMatchingDonationId] = React.useState<string | null>(null)
  const [matches, setMatches] = React.useState<any[]>([])
  const [loadingMatches, setLoadingMatches] = React.useState(false)
  const [reportModalOpen, setReportModalOpen] = React.useState(false)
  const [reportedUser, setReportedUser] = React.useState<{ id: string, name: string } | null>(null)
  const [expandedDonationId, setExpandedDonationId] = React.useState<string | null>(null)

  // Fetch AI Impact Narrative
  React.useEffect(() => {
    const fetchImpact = async () => {
      try {
        const res = await fetch('/api/ai/impact-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            totalMeals: stats.meals_donated,
            totalKg: stats.waste_prevented_kg,
            activeUsers: 34,
            role: 'donor',
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
  }, [stats])

  // Fetch matching recommendations for a donation
  const handleFindMatch = async (donationId: string) => {
    setMatchingDonationId(donationId)
    setLoadingMatches(true)
    setMatches([])
    try {
      const res = await fetch('/api/ai/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donationId }),
      })
      const data = await res.json()
      setMatches(data.matches || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingMatches(false)
    }
  }

  const getStatusBadgeStyle = (status: string): React.CSSProperties => {
    switch (status) {
      case 'available':
        return { background: 'var(--success-bg)', color: 'var(--success-text)', border: '1px solid var(--success-text)' }
      case 'reserved':
      case 'pickup_scheduled':
        return { background: 'var(--pending-bg)', color: 'var(--pending-text)', border: '1px solid var(--pending-text)' }
      case 'collected':
      case 'completed':
        return { background: 'var(--success-bg)', color: 'var(--success-text)', border: '1px solid var(--success-text)' }
      case 'cancelled':
        return { background: 'var(--urgent-bg)', color: 'var(--urgent-text)', border: '1px solid var(--urgent-text)' }
      case 'pending_approval':
        return { background: 'var(--pending-bg)', color: 'var(--pending-text)', border: '1px solid var(--pending-text)' }
      default:
        return { background: 'var(--bg-page)', color: 'var(--text-secondary)', border: '1px solid var(--border-hairline)' }
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Navbar Header */}
      <header className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-primary uppercase">Donor Portal</span>
          <h1 className="text-3xl font-heading font-black text-foreground mt-1 flex items-center gap-2">
            {profile.organization_name || profile.full_name}
            <VerifiedBadge status={profile.verification_status} />
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBell userId={profile.id} />
          <button
            onClick={() => signout()}
            className="flex h-10 w-10 items-center justify-center rounded-xl border transition-all shadow-sm"
            style={{
              borderColor: 'var(--border-hairline)',
              background: 'var(--bg-card)',
              color: 'var(--text-secondary)',
            }}
            onMouseOver={e => {
              e.currentTarget.style.color = 'var(--urgent-text)'
              e.currentTarget.style.borderColor = 'var(--urgent-bg)'
              e.currentTarget.style.background = 'var(--urgent-bg)'
            }}
            onMouseOut={e => {
              e.currentTarget.style.color = 'var(--text-secondary)'
              e.currentTarget.style.borderColor = 'var(--border-hairline)'
              e.currentTarget.style.background = 'var(--bg-card)'
            }}
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Verification Warning */}
      {profile.verification_status !== 'verified' && (
        <div
          className="flex items-start gap-3 rounded-2xl border p-5 text-sm shadow-sm"
          style={{
            borderColor: 'var(--pending-text)',
            background: 'var(--pending-bg)',
            color: 'var(--pending-text)',
          }}
        >
          <ShieldAlert className="h-5 w-5 shrink-0 stroke-[2.5] mt-0.5" />
          <div>
            <h4 className="font-bold">Awaiting Verification</h4>
            <p className="text-xs mt-1" style={{ color: 'var(--pending-text)', opacity: 0.85 }}>
              Your account is currently undergoing admin verification. You can prepare listings but they will not be visible to NGOs until verified.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Stats and Listing Trigger */}
        <div className="lg:col-span-8 space-y-8">
          {/* Stat Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="stat-card-button p-5">
              <span className="text-xs font-semibold text-muted-foreground block">Total Listings</span>
              <span className="font-heading text-2xl font-black text-foreground mt-1.5 block">{stats.total_donations || 0}</span>
            </div>
            <div className="stat-card-button p-5">
              <span className="text-xs font-semibold text-muted-foreground block">Meals Provided</span>
              <span className="font-heading text-2xl font-black text-foreground mt-1.5 block">~{stats.meals_donated || 0}</span>
            </div>
            <div className="stat-card-button p-5">
              <span className="text-xs font-semibold text-muted-foreground block">Waste Saved</span>
              <span className="font-heading text-2xl font-black text-foreground mt-1.5 block">{stats.waste_prevented_kg || 0} kg</span>
            </div>
          </div>

          {/* AI Impact narrative card */}
          <div className="relative rounded-2xl glass-card-accent p-6">
            <div className="absolute top-4 right-4 text-primary flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Impact Insight</span>
            </div>
            <h3 className="font-heading font-bold text-foreground text-md flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              {report.headline}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed mt-2.5 max-w-2xl">{report.summary}</p>
          </div>

          {/* Donations List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <span>Your Food Donations</span>
              </h2>
              <Link
                href="/dashboard/donor/donations/new"
                className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 transition-all shadow-sm hover:-translate-y-0.5"
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
                <span>List Food Donation</span>
              </Link>
            </div>

            {donations.length === 0 ? (
              <EmptyState 
                icon={Box} 
                title="No Donations Yet" 
                description="You haven't listed any surplus food items yet. When you have surplus food, list it here to get matched with an NGO."
              />
            ) : (
              <div className="space-y-4">
                {donations.map((donation) => {
                  const claim = donation.claims?.[0]
                  const delivery = claim?.deliveries?.[0]

                  return (
                    <div 
                      key={donation.id}
                      className="rounded-2xl glass-card p-5 flex flex-col gap-4 hover:border-primary/40 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-heading font-bold text-foreground text-md">{donation.title}</h4>
                            <span
                              className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize status-badge"
                              style={getStatusBadgeStyle(donation.status)}
                            >
                              {donation.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground items-center">
                            <span className="flex items-center gap-1"><Scale className="h-3.5 w-3.5" />{donation.quantity} {donation.quantity_unit}</span>
                            <ExpiryBadge expiryAt={donation.expiry_at} />
                          </div>
                        </div>

                        {/* Matching or coordination detail */}
                        <div className="shrink-0 flex items-center justify-end">
                          {donation.status === 'available' ? (
                            <button
                              onClick={() => handleFindMatch(donation.id)}
                              className="flex items-center gap-1.5 px-4.5 py-2 rounded-xl text-xs font-semibold border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors shadow-sm"
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                              <span>Suggest Recipients</span>
                            </button>
                          ) : claim ? (
                            <div className="rounded-xl border border-border bg-card p-2.5 text-[11px] space-y-1">
                              <p className="text-muted-foreground">Claimed by: <strong className="text-foreground">{claim.ngo?.organization_name || claim.ngo?.full_name}</strong></p>
                              {delivery?.volunteer && (
                                <p className="text-muted-foreground">Courier: <span className="text-primary font-semibold">{delivery.volunteer.full_name}</span></p>
                              )}
                              {delivery && (delivery.status === 'assigned' || delivery.status === 'pickup_completed' || delivery.status === 'in_transit') && (
                                <button
                                  onClick={() => setExpandedDonationId(expandedDonationId === donation.id ? null : donation.id)}
                                  className="mt-2 w-full flex items-center justify-center gap-1 py-1.5 rounded-xl text-[10px] font-bold border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors shadow-sm cursor-pointer"
                                >
                                  <Navigation className="h-3 w-3 rotate-45" />
                                  <span>{expandedDonationId === donation.id ? 'Hide Tracking Map' : 'Track Delivery Location'}</span>
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setReportedUser({ id: claim.ngo.id, name: claim.ngo.organization_name || claim.ngo.full_name })
                                  setReportModalOpen(true)
                                }}
                                className="text-red-600 hover:text-red-800 font-semibold hover:underline mt-1 block"
                              >
                                Report this organization
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      {/* Live Tracking Map */}
                      {expandedDonationId === donation.id && delivery && (delivery.status === 'assigned' || delivery.status === 'pickup_completed' || delivery.status === 'in_transit') && (
                        <div className="w-full mt-2">
                          <DeliveryMap 
                            deliveryId={delivery.id}
                            pickupLat={donation.pickup_latitude ? Number(donation.pickup_latitude) : undefined}
                            pickupLng={donation.pickup_longitude ? Number(donation.pickup_longitude) : undefined}
                            pickupLabel={donation.pickup_location}
                            destLat={claim.ngo?.latitude ? Number(claim.ngo.latitude) : undefined}
                            destLng={claim.ngo?.longitude ? Number(claim.ngo.longitude) : undefined}
                            destLabel={claim.ngo?.address}
                            volunteerName={delivery.volunteer?.full_name}
                            deliveryStatus={delivery.status}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Recommendation Drawer/Panel */}
        <div className="lg:col-span-4">
          <div className="rounded-2xl glass-card p-6 space-y-4 sticky top-6">
            <h3 className="font-heading font-bold text-foreground text-md flex items-center gap-2 border-b border-border pb-3">
              <Sparkles className="h-4.5 w-4.5 text-primary" />
              <span>Recipient Recommendations</span>
            </h3>

            {matchingDonationId ? (
              <div className="space-y-4">
                {loadingMatches ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="text-xs">AI is matching candidate NGOs...</span>
                  </div>
                ) : matches.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No matching NGOs found in range.</p>
                ) : (
                  <div className="space-y-3">
                    {matches.slice(0, 3).map((match) => (
                      <div key={match.ngo_id} className="rounded-xl border border-border bg-card/60 p-3.5 space-y-2 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                          <span className="font-heading font-bold text-xs text-foreground flex items-center gap-1">
                            <Building className="h-3.5 w-3.5 text-primary" />
                            {match.organization_name}
                          </span>
                          <span className="text-[10px] font-black text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                            {Math.round(match.fit_score)}% Fit
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">{match.match_reason}</p>
                        <span className="text-[9px] text-muted-foreground/80 block">Distance: {match.distance_km.toFixed(1)} km</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground leading-relaxed text-center py-8">
                Select &quot;Suggest Recipients&quot; on any available donation listing to analyze matching NGO distribution channels.
              </p>
            )}
          </div>
        </div>
      </div>

      {reportedUser && (
        <ReportModal
          isOpen={reportModalOpen}
          onClose={() => {
            setReportModalOpen(false)
            setReportedUser(null)
          }}
          reportedUserId={reportedUser.id}
          reportedUserName={reportedUser.name}
        />
      )}
    </div>
  )
}
