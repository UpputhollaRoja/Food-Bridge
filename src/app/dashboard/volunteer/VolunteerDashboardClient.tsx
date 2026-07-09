'use client'

import React from 'react'
import Link from 'next/link'
import NotificationBell from '@/components/NotificationBell'
import { signout } from '@/app/auth/actions'
import { 
  Bike, 
  MapPin, 
  Clock, 
  Globe, 
  Sparkles, 
  LogOut, 
  ChevronRight, 
  Truck, 
  CheckCircle,
  Inbox,
  Navigation
} from 'lucide-react'
import EmptyState from '@/components/EmptyState'
import VerifiedBadge from '@/components/VerifiedBadge'

interface VolunteerDashboardClientProps {
  profile: any
  stats: any
  activeDeliveries: any[]
}

export default function VolunteerDashboardClient({ profile, stats, activeDeliveries }: VolunteerDashboardClientProps) {
  const [report, setReport] = React.useState({ headline: 'Analyzing Logistics Impact...', summary: 'Generating environmental summary...' })

  // Fetch AI Impact Narrative
  React.useEffect(() => {
    const fetchImpact = async () => {
      try {
        const res = await fetch('/api/ai/impact-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            totalMeals: stats.deliveries_completed * 24, // estimate 24 meals per delivery run
            totalKg: stats.deliveries_completed * 12, // estimate 12kg per delivery run
            activeUsers: 34,
            role: 'volunteer',
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

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Navbar Header */}
      <header className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-primary uppercase">Volunteer Courier</span>
          <h1 className="text-3xl font-heading font-black text-foreground mt-1 flex items-center gap-2">
            {profile.full_name}
            <VerifiedBadge status={profile.verification_status} />
          </h1>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl glass-card p-5">
          <span className="text-xs font-semibold text-muted-foreground block font-medium">Deliveries Completed</span>
          <span className="font-heading text-2xl font-black text-foreground mt-1.5 block">{stats.deliveries_completed || 0} runs</span>
        </div>
        <div className="rounded-2xl glass-card p-5">
          <span className="text-xs font-semibold text-muted-foreground block font-medium">Average Transit Time</span>
          <span className="font-heading text-2xl font-black text-foreground mt-1.5 block">
            {stats.avg_delivery_time_hours ? `${stats.avg_delivery_time_hours.toFixed(1)} hrs` : '0.0 hrs'}
          </span>
        </div>
      </div>

      {/* AI Impact narrative card */}
      <div className="relative rounded-2xl glass-card-accent p-6">
        <div className="absolute top-4 right-4 text-primary flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI Courier Insight</span>
        </div>
        <h3 className="font-heading font-bold text-foreground text-md flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          {report.headline}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed mt-2.5 max-w-2xl">{report.summary}</p>
      </div>

      {/* Active deliveries panel */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="font-heading text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            <span>Active Transport Routes</span>
          </h2>
          <div className="flex gap-3">
            <Link
              href="/dashboard/volunteer/deliveries"
              className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 transition-all shadow-sm hover:-translate-y-0.5"
            >
              <Bike className="h-4 w-4" />
              <span>Browse Job Listings</span>
            </Link>
          </div>
        </div>

        {activeDeliveries.length === 0 ? (
          <EmptyState 
            icon={Inbox} 
            title="No Active Deliveries" 
            description="You don't have any active deliveries. Click 'Browse Job Listings' to pick up a shipment." 
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeDeliveries.map((del) => {
              const claim = del.claims
              const donation = claim?.donations
              const ngo = claim?.profiles

              if (!donation || !ngo) return null

              return (
                <div 
                  key={del.id}
                  className="rounded-2xl glass-card p-5 flex flex-col justify-between hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-heading font-bold text-foreground text-md">{donation.title}</h4>
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize status-badge"
                        style={
                          del.status === 'delivered'
                            ? { background: 'var(--success-bg)', color: 'var(--success-text)', border: '1px solid var(--success-text)' }
                            : { background: 'var(--pending-bg)', color: 'var(--pending-text)', border: '1px solid var(--pending-text)' }
                        }
                      >
                        {del.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <p className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-primary shrink-0" /> Pickup: {donation.pickup_location}</p>
                      <p className="flex items-center gap-1"><Navigation className="h-3.5 w-3.5 text-primary shrink-0" /> Drop-off: {ngo.address}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border mt-4 flex items-center justify-end">
                    <Link
                      href="/dashboard/volunteer/deliveries"
                      className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                    >
                      <span>Open Stepper Tracker</span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
