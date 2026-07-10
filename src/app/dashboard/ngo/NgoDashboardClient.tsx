'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import Link from 'next/link'
import NotificationBell from '@/components/NotificationBell'
import { signout } from '@/app/auth/actions'
import { confirmReceiptAction } from '@/app/dashboard/ngo/claims/actions'
import { 
  Search, 
  MapPin, 
  CheckCircle, 
  User, 
  Phone, 
  Globe,
  Sparkles, 
  LogOut, 
  ShieldAlert, 
  ChevronRight,
  TrendingUp,
  Inbox,
  Navigation
} from 'lucide-react'
import EmptyState from '@/components/EmptyState'
import VerifiedBadge from '@/components/VerifiedBadge'
import ExpiryBadge from '@/components/ExpiryBadge'
import DeliveryMap from '@/components/DeliveryMap'

interface NgoDashboardClientProps {
  profile: any
  stats: any
  initialClaims: any[]
}

export default function NgoDashboardClient({ profile, stats, initialClaims }: NgoDashboardClientProps) {
  const [claims, setClaims] = React.useState(initialClaims)
  const [report, setReport] = React.useState({ headline: 'Analyzing NGO Impact...', summary: 'Generating environmental summary...' })
  const [confirmingId, setConfirmingId] = React.useState<string | null>(null)
  const [expandedClaimId, setExpandedClaimId] = React.useState<string | null>(null)

  // Fetch AI Impact Narrative
  React.useEffect(() => {
    const fetchImpact = async () => {
      try {
        const res = await fetch('/api/ai/impact-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            totalMeals: stats.beneficiaries_served_est,
            totalKg: stats.completed_claims * 12,
            activeUsers: 34,
            role: 'ngo',
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

  const handleConfirmReceipt = async (claimId: string, donationId: string, deliveryId: string) => {
    setConfirmingId(claimId)
    try {
      const res = await confirmReceiptAction(claimId, donationId, deliveryId)
      if (!res?.error) {
        setClaims(claims.filter(c => c.id !== claimId))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setConfirmingId(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Navbar Header */}
      <header className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-primary uppercase">NGO Dashboard</span>
          <h1 className="text-3xl font-heading font-black text-foreground mt-1 flex items-center gap-2">
            {profile.organization_name || profile.full_name}
            <VerifiedBadge status={profile.verification_status} />
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBell userId={profile.id} />
          <button
            onClick={() => signout()}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10 transition-all"
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
            <h4 className="font-bold">Account Verification Pending</h4>
            <p className="text-xs mt-1" style={{ color: 'var(--pending-text)', opacity: 0.85 }}>
              Your NGO account is currently pending verification. You can browse listings but will not be able to claim them until an admin verifies your status.
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card-button p-5">
          <span className="text-xs font-semibold text-muted-foreground block">Claims Received</span>
          <span className="font-heading text-2xl font-black text-foreground mt-1.5 block">{stats.completed_claims || 0}</span>
        </div>
        <div className="stat-card-button p-5">
          <span className="text-xs font-semibold text-muted-foreground block">Beneficiaries Fed</span>
          <span className="font-heading text-2xl font-black text-foreground mt-1.5 block">~{stats.beneficiaries_served_est || 0}</span>
        </div>
        <div className="stat-card-button p-5">
          <span className="text-xs font-semibold text-muted-foreground block">Rescued Shipments</span>
          <span className="font-heading text-2xl font-black text-foreground mt-1.5 block">{stats.donations_received || 0}</span>
        </div>
      </div>

      {/* AI Impact narrative card */}
      <div className="relative rounded-2xl glass-card-accent p-6">
        <div className="absolute top-4 right-4 text-primary flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI Environmental Impact</span>
        </div>
        <h3 className="font-heading font-bold text-foreground text-md flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          {report.headline}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed mt-2.5 max-w-2xl">{report.summary}</p>
      </div>

      {/* Active claims dashboard panel */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="font-heading text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Active Food Claims</span>
          </h2>
          <div className="flex gap-3">
            <Link
              href="/dashboard/ngo/claims"
              className="flex items-center gap-1 py-2 px-4 rounded-xl text-xs font-semibold border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <span>View Claims History</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/dashboard/ngo/browse"
              className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 transition-all shadow-sm hover:-translate-y-0.5"
            >
              <Search className="h-4 w-4" />
              <span>Browse Available Food</span>
            </Link>
          </div>
        </div>

        {claims.length === 0 ? (
          <EmptyState 
            icon={Inbox} 
            title="No Active Claims" 
            description="You don't have any active food claims right now. Click 'Browse Available Food' to secure donations." 
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {claims.map((claim) => {
              const donation = claim.donations
              const delivery = claim.deliveries?.[0]
              const volunteer = delivery?.volunteer

              if (!donation) return null

              return (
                <div 
                  key={claim.id}
                  className="stat-card-button p-5 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-heading font-bold text-foreground text-md">{donation.title}</h4>
                      <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase">
                        {delivery?.status || 'unassigned'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground items-center">
                      <p className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-primary shrink-0" /> Pickup: {donation.pickup_location}</p>
                      <ExpiryBadge expiryAt={donation.expiry_at} />
                    </div>

                    {/* Volunteer info if assigned */}
                    {volunteer && (
                      <div className="rounded-xl border border-border bg-card p-3 text-[11px] flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-primary" />
                          <span className="text-muted-foreground">Courier: <strong className="text-foreground">{volunteer.full_name}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-primary" />
                          <span className="text-muted-foreground">Phone: <a href={`tel:${volunteer.phone}`} className="text-primary font-semibold hover:underline">{volunteer.phone}</a></span>
                        </div>
                        {delivery && (delivery.status === 'assigned' || delivery.status === 'pickup_completed' || delivery.status === 'in_transit') && (
                          <button
                            onClick={() => setExpandedClaimId(expandedClaimId === claim.id ? null : claim.id)}
                            className="mt-2 w-full flex items-center justify-center gap-1 py-1.5 rounded-xl text-[10px] font-bold border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors shadow-sm cursor-pointer"
                          >
                            <Navigation className="h-3 w-3 rotate-45" />
                            <span>{expandedClaimId === claim.id ? 'Hide Tracking Map' : 'Track Delivery Location'}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Live Tracking Map */}
                  {expandedClaimId === claim.id && delivery && (delivery.status === 'assigned' || delivery.status === 'pickup_completed' || delivery.status === 'in_transit') && (
                    <div className="mt-3 w-full">
                      <DeliveryMap 
                        deliveryId={delivery.id}
                        pickupLat={donation.pickup_latitude ? Number(donation.pickup_latitude) : undefined}
                        pickupLng={donation.pickup_longitude ? Number(donation.pickup_longitude) : undefined}
                        pickupLabel={donation.pickup_location}
                        destLat={profile?.latitude ? Number(profile.latitude) : undefined}
                        destLng={profile?.longitude ? Number(profile.longitude) : undefined}
                        destLabel={profile?.address}
                        volunteerName={volunteer?.full_name}
                        deliveryStatus={delivery.status}
                      />
                    </div>
                  )}

                  {/* Actions */}
                  {delivery && delivery.status === 'delivered' && (
                    <div className="pt-2 border-t border-border flex items-center justify-end">
                      <button
                        onClick={() => handleConfirmReceipt(claim.id, donation.id, delivery.id)}
                        disabled={confirmingId !== null}
                        className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 transition-all shadow-sm hover:-translate-y-0.5 disabled:opacity-50"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Confirm Receipt</span>
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
