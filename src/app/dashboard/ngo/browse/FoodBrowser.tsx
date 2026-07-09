'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { claimDonationAction } from './actions'
import { createClient } from '@/lib/supabase/client'
import {
  Search,
  MapPin,
  Clock,
  Scale,
  ShieldAlert,
  ArrowLeft,
  Sparkles,
  AlertOctagon,
  Flame,
  ArrowUpDown,
  ImageOff,
} from 'lucide-react'
import Link from 'next/link'
import ImageLightbox from '@/components/ImageLightbox'
import { formatHydrationDate, formatHydrationTime } from '@/lib/utils'

interface FoodBrowserProps {
  initialDonations: any[]
  verificationStatus: string
}

export default function FoodBrowser({ initialDonations, verificationStatus }: FoodBrowserProps) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const [search, setSearch] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState('all')
  const [sortBy, setSortBy] = React.useState('priority') // priority, distance, expiry
  const [claimingId, setClaimingId] = React.useState<string | null>(null)
  const [claimError, setClaimError] = React.useState<string | null>(null)
  const [lightboxSrc, setLightboxSrc] = React.useState<string | null>(null)
  const [lightboxAlt, setLightboxAlt] = React.useState('')

  const supabase = createClient()

  // Categories list
  const categories = [
    { value: 'all', label: 'All Food' },
    { value: 'cooked_meals', label: 'Cooked Meals' },
    { value: 'bakery', label: 'Bakery' },
    { value: 'produce', label: 'Produce' },
    { value: 'packaged', label: 'Packaged' },
    { value: 'dairy', label: 'Dairy' },
    { value: 'beverages', label: 'Beverages' },
    { value: 'other', label: 'Other' },
  ]

  // Filter & Sort
  const filteredDonations = React.useMemo(() => {
    return initialDonations
      .filter((d) => {
        const matchesSearch =
          d.title.toLowerCase().includes(search.toLowerCase()) ||
          d.donor_org?.toLowerCase().includes(search.toLowerCase())
        const matchesCategory = selectedCategory === 'all' || d.category === selectedCategory
        return matchesSearch && matchesCategory
      })
      .sort((a, b) => {
        if (sortBy === 'priority') {
          return (b.priority_score || 0) - (a.priority_score || 0)
        } else if (sortBy === 'distance') {
          return (a.distance_km || 0) - (b.distance_km || 0)
        } else if (sortBy === 'expiry') {
          return new Date(a.expiry_at).getTime() - new Date(b.expiry_at).getTime()
        }
        return 0
      })
  }, [initialDonations, search, selectedCategory, sortBy])

  const handleClaim = async (donationId: string) => {
    if (verificationStatus !== 'verified') {
      setClaimError('Your account must be verified by an admin before you can claim donations.')
      return
    }

    setClaimingId(donationId)
    setClaimError(null)

    try {
      const res = await claimDonationAction(donationId)
      if (res && 'error' in res) {
        setClaimError(res.error)
      }
    } catch (err: any) {
      console.error(err)
      setClaimError('Failed to claim donation. It may have already been claimed.')
    } finally {
      setClaimingId(null)
    }
  }

  const openLightbox = (url: string, alt: string) => {
    setLightboxSrc(url)
    setLightboxAlt(alt)
  }

  // Helper for rendering urgency badges — using CSS variables instead of hardcoded colors
  const getPriorityBadge = (score: number) => {
    if (score >= 80) {
      return (
        <span
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm"
          style={{
            background: 'var(--urgent-bg)',
            color: 'var(--urgent-text)',
            border: '1px solid var(--urgent-text)',
          }}
        >
          <Flame className="h-3.5 w-3.5 shrink-0" />
          <span>Critical Urgency ({Math.round(score)})</span>
        </span>
      )
    }
    if (score >= 50) {
      return (
        <span
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm"
          style={{
            background: 'var(--pending-bg)',
            color: 'var(--pending-text)',
            border: '1px solid var(--pending-text)',
          }}
        >
          <Flame className="h-3.5 w-3.5 shrink-0" />
          <span>High Priority ({Math.round(score)})</span>
        </span>
      )
    }
    return (
      <span
        className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium shadow-sm status-badge"
        style={{
          background: 'var(--success-bg)',
          color: 'var(--success-text)',
          border: '1px solid var(--success-text)',
        }}
      >
        <Sparkles className="h-3.5 w-3.5" />
        <span>Standard ({Math.round(score)})</span>
      </span>
    )
  }

  const getPublicUrl = (path: string) => {
    if (!path) return ''
    const { data } = supabase.storage.from('donation-images').getPublicUrl(path)
    return data.publicUrl
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-4">
      {/* Lightbox */}
      <ImageLightbox src={lightboxSrc} alt={lightboxAlt} onClose={() => setLightboxSrc(null)} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/ngo"
            className="flex h-9 w-9 items-center justify-center rounded-lg border transition-colors shadow-sm"
            style={{
              borderColor: 'var(--border-hairline)',
              background: 'var(--bg-card)',
              color: 'var(--text-secondary)',
            }}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Available Surplus Food
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Discover and claim active surplus food listings in your area
            </p>
          </div>
        </div>

        {/* Verification Alert */}
        {verificationStatus !== 'verified' && (
          <div
            className="flex items-center gap-2 rounded-xl border p-3 text-xs max-w-md shadow-sm"
            style={{
              borderColor: 'var(--pending-text)',
              background: 'var(--pending-bg)',
              color: 'var(--pending-text)',
            }}
          >
            <AlertOctagon className="h-4 w-4 shrink-0 stroke-[2.5]" />
            <span>NGO is pending admin approval. You can browse food listings but cannot claim them.</span>
          </div>
        )}
      </div>

      {/* Global error banner */}
      {claimError && (
        <div
          className="flex items-center gap-2 rounded-xl border p-4 text-sm shadow-sm"
          style={{
            borderColor: 'var(--urgent-text)',
            background: 'var(--urgent-bg)',
            color: 'var(--urgent-text)',
          }}
        >
          <ShieldAlert className="h-5 w-5 shrink-0 stroke-[2.5]" />
          <span>{claimError}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Search */}
        <div className="lg:col-span-4 relative">
          <div
            className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search food items or donors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full rounded-xl glass-input pl-10 pr-3 py-2.5 text-sm transition-colors"
          />
        </div>

        {/* Categories Carousel */}
        <div className="lg:col-span-5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap shadow-sm"
              style={
                selectedCategory === cat.value
                  ? { background: 'var(--brand-green)', borderColor: 'var(--brand-green)', color: '#fff' }
                  : {
                      background: 'var(--bg-card)',
                      borderColor: 'var(--border-hairline)',
                      color: 'var(--text-secondary)',
                    }
              }
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="lg:col-span-3 flex items-center justify-end gap-2">
          <span
            className="text-xs font-medium flex items-center gap-1"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            Sort By:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl glass-input px-3 py-1.5 text-xs transition-colors"
          >
            <option value="priority">Priority (AI Score)</option>
            <option value="distance">Proximity (Distance)</option>
            <option value="expiry">Expiry (Soonest First)</option>
          </select>
        </div>
      </div>

      {/* Grid of Listings */}
      {filteredDonations.length === 0 ? (
        <div
          className="text-center py-20 rounded-2xl border"
          style={{ borderColor: 'var(--border-hairline)', background: 'var(--bg-card)' }}
        >
          <Scale className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--text-secondary)' }} />
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            No Food Items Found
          </h3>
          <p className="text-xs mt-1 max-w-xs mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Try adjusting your search criteria or checking back later for fresh listings.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDonations.map((donation) => {
            const hasImages = donation.images && donation.images.length > 0
            const previewUrl = hasImages ? getPublicUrl(donation.images[0]) : null

            return (
              <div
                key={donation.id}
                className="group relative rounded-2xl glass-card overflow-hidden flex flex-col justify-between shadow-lg hover-lift"
              >
                <div>
                  {/* Preview Image / Placeholder */}
                  <div
                    className="relative aspect-video w-full overflow-hidden border-b"
                    style={{ background: 'var(--bg-page)', borderColor: 'var(--border-hairline)' }}
                  >
                    {previewUrl ? (
                      <button
                        type="button"
                        className="block h-full w-full cursor-zoom-in focus:outline-none"
                        title="Click to view full size"
                        onClick={() => openLightbox(previewUrl, donation.title)}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={previewUrl}
                          alt={donation.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </button>
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center flex-col gap-1"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <ImageOff className="h-8 w-8" />
                        <span className="text-[10px] font-semibold">No image provided</span>
                      </div>
                    )}

                    {/* Proximity / Distance Badge */}
                    <div
                      className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-white/80 backdrop-blur-md text-[10px] font-bold flex items-center gap-1 border shadow-sm"
                      style={{ borderColor: 'var(--border-hairline)', color: 'var(--brand-green)' }}
                    >
                      <MapPin className="h-3 w-3" style={{ color: 'var(--brand-green)' }} />
                      <span>
                        {donation.distance_km ? `${donation.distance_km.toFixed(1)} km away` : 'Nearby'}
                      </span>
                    </div>

                    {/* Category Label */}
                    <div
                      className="absolute bottom-3 right-3 px-2 py-0.5 rounded backdrop-blur-md text-[10px] font-bold border shadow-sm capitalize"
                      style={{
                        background: 'rgba(255,255,255,0.85)',
                        borderColor: 'var(--border-hairline)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {donation.category.replace('_', ' ')}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold transition-colors line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                          {donation.title}
                        </h3>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                          Listed by {donation.donor_org || donation.donor_name}
                        </p>
                      </div>
                    </div>

                    {/* AI Priority Badge */}
                    <div>{getPriorityBadge(donation.priority_score || 0)}</div>

                    {/* Metadata Specs */}
                    <div
                      className="grid grid-cols-2 gap-3 text-xs border-y py-3"
                      style={{ borderColor: 'var(--border-hairline)' }}
                    >
                      <div className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                        <Scale className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--brand-green)' }} />
                        <span className="font-semibold">
                          {donation.quantity} {donation.quantity_unit}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                        <Scale className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--brand-green)' }} />
                        <span>~{donation.estimated_meals} meals</span>
                      </div>
                      <div
                        className="flex items-center gap-1.5 col-span-2"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <Clock className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--brand-green)' }} />
                        <span className="truncate">
                          Expires:{' '}
                          {mounted ? `${formatHydrationDate(donation.expiry_at)} at ${formatHydrationTime(donation.expiry_at)}` : '—'}
                        </span>
                      </div>
                    </div>

                    {/* Info rows */}
                    <div className="space-y-1.5 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                      <div className="flex items-start gap-1">
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                          Pickup Location:
                        </span>
                        <span className="line-clamp-1">{donation.pickup_location}</span>
                      </div>
                      {donation.allergen_info && (
                        <div className="flex items-start gap-1" style={{ color: 'var(--pending-text)' }}>
                          <span className="font-semibold">Allergens:</span>
                          <span>{donation.allergen_info}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Claim Button Action */}
                <div
                  className="p-5 pt-0 border-t mt-4"
                  style={{ borderColor: 'var(--border-hairline)' }}
                >
                  <div>
                    {verificationStatus === 'verified' ? (
                      <button
                        onClick={() => handleClaim(donation.id)}
                        disabled={claimingId !== null}
                        className="w-full py-2.5 px-4 border border-transparent rounded-xl text-xs font-bold text-white focus:outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        style={{
                          background: 'var(--brand-green)',
                          boxShadow: '0 4px 14px -2px rgba(31,93,61,0.3)',
                        }}
                        onMouseOver={(e) =>
                          claimingId === null &&
                          (e.currentTarget.style.background = 'var(--brand-green-hover)')
                        }
                        onMouseOut={(e) => (e.currentTarget.style.background = 'var(--brand-green)')}
                      >
                        {claimingId === donation.id ? 'Claiming Item...' : 'Claim Surplus Food'}
                      </button>
                    ) : (
                      <div
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-center border"
                        style={{
                          background: 'var(--pending-bg)',
                          borderColor: 'var(--pending-text)',
                          color: 'var(--pending-text)',
                        }}
                      >
                        Pending admin verification
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
