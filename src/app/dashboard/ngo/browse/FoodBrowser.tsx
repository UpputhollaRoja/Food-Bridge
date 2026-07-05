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
  ArrowUpDown 
} from 'lucide-react'
import Link from 'next/link'

interface FoodBrowserProps {
  initialDonations: any[]
  verificationStatus: string
}

export default function FoodBrowser({ initialDonations, verificationStatus }: FoodBrowserProps) {
  const [search, setSearch] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState('all')
  const [sortBy, setSortBy] = React.useState('priority') // priority, distance, expiry
  const [claimingId, setClaimingId] = React.useState<string | null>(null)
  const [claimError, setClaimError] = React.useState<string | null>(null)

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
        const matchesSearch = d.title.toLowerCase().includes(search.toLowerCase()) ||
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
      setClaimError('Your NGO account must be verified by an admin before claiming donations.')
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

  // Helper for rendering urgency badges
  const getPriorityBadge = (score: number) => {
    if (score >= 80) {
      return (
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-bold shadow-sm">
          <Flame className="h-3.5 w-3.5 fill-red-650 text-red-650" />
          <span>Critical Urgency ({Math.round(score)})</span>
        </span>
      )
    }
    if (score >= 50) {
      return (
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold shadow-sm">
          <Flame className="h-3.5 w-3.5 text-amber-600" />
          <span>High Priority ({Math.round(score)})</span>
        </span>
      )
    }
    return (
      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-medium shadow-sm">
        <Sparkles className="h-3.5 w-3.5 text-purple-600" />
        <span>Standard ({Math.round(score)})</span>
      </span>
    )
  }

  const getPublicUrl = (path: string) => {
    if (!path) return '/placeholder.png'
    const { data } = supabase.storage.from('donation-images').getPublicUrl(path)
    return data.publicUrl
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/ngo"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white/50 text-slate-600 hover:text-slate-900 hover:bg-white/80 transition-colors shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Available Surplus Food</h1>
            <p className="text-xs text-slate-500">Discover and claim active surplus food listings in your area</p>
          </div>
        </div>

        {/* Verification Alert */}
        {verificationStatus !== 'verified' && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-855 max-w-md shadow-sm">
            <AlertOctagon className="h-4 w-4 shrink-0 stroke-[2.5]" />
            <span>NGO is pending admin approval. You can browse food listings but cannot claim them.</span>
          </div>
        )}
      </div>

      {/* Global error banner */}
      {claimError && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-sm">
          <ShieldAlert className="h-5 w-5 shrink-0 stroke-[2.5]" />
          <span>{claimError}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Search */}
        <div className="lg:col-span-4 relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search food items or donors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full rounded-xl glass-input pl-10 pr-3 py-2.5 text-sm placeholder-slate-400 focus:ring-1 focus:ring-purple-550 transition-colors"
          />
        </div>

        {/* Categories Carousel */}
        <div className="lg:col-span-5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap shadow-sm ${
                selectedCategory === cat.value
                  ? 'bg-purple-650 border-purple-650 text-white'
                  : 'bg-white/40 border-slate-200 text-slate-650 hover:bg-white/70 hover:border-slate-350'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="lg:col-span-3 flex items-center justify-end gap-2">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <ArrowUpDown className="h-3.5 w-3.5" />
            Sort By:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl glass-input px-3 py-1.5 text-xs focus:ring-1 focus:ring-purple-550 transition-colors"
          >
            <option value="priority">Priority (AI Score)</option>
            <option value="distance">Proximity (Distance)</option>
            <option value="expiry">Expiry (Soonest First)</option>
          </select>
        </div>
      </div>

      {/* Grid of Listings */}
      {filteredDonations.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-slate-200 bg-white/30">
          <Scale className="h-10 w-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">No Food Items Found</h3>
          <p className="text-xs text-slate-550 mt-1 max-w-xs mx-auto">
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
                className="group relative rounded-2xl glass-card hover:border-purple-500/40 overflow-hidden flex flex-col justify-between shadow-lg hover:shadow-purple-500/5 transition-all duration-300"
              >
                <div>
                  {/* Preview Image / Placeholder */}
                  <div className="relative aspect-video w-full bg-slate-100 border-b border-slate-250/50 overflow-hidden">
                    {previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={previewUrl}
                        alt={donation.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-400 bg-gradient-to-br from-slate-50 to-slate-100">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                    )}

                    {/* Proximity / Distance Badge */}
                    <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-white/80 backdrop-blur-md text-[10px] font-bold text-purple-800 flex items-center gap-1 border border-slate-200/80 shadow-sm">
                      <MapPin className="h-3 w-3 text-purple-650" />
                      <span>{donation.distance_km ? `${donation.distance_km.toFixed(1)} km away` : 'Nearby'}</span>
                    </div>

                    {/* Category Label */}
                    <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-white/85 backdrop-blur-md text-[10px] font-bold text-slate-700 border border-slate-200/80 shadow-sm capitalize">
                      {donation.category.replace('_', ' ')}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-slate-900 group-hover:text-purple-700 transition-colors line-clamp-1">
                          {donation.title}
                        </h3>
                        <p className="text-xs text-slate-555 mt-0.5">Listed by {donation.donor_org || donation.donor_name}</p>
                      </div>
                    </div>

                    {/* AI Priority Badge */}
                    <div>{getPriorityBadge(donation.priority_score || 0)}</div>

                    {/* Metadata Specs */}
                    <div className="grid grid-cols-2 gap-3 text-xs border-y border-slate-200/50 py-3">
                      <div className="flex items-center gap-1.5 text-slate-655">
                        <Scale className="h-3.5 w-3.5 text-purple-650" />
                        <span className="font-semibold">{donation.quantity} {donation.quantity_unit}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-655">
                        <Scale className="h-3.5 w-3.5 text-purple-650" />
                        <span>~{donation.estimated_meals} meals</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-655 col-span-2">
                        <Clock className="h-3.5 w-3.5 text-purple-650" />
                        <span className="truncate">
                          Expires: {new Date(donation.expiry_at).toLocaleDateString()} at {new Date(donation.expiry_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* Info rows */}
                    <div className="space-y-1.5 text-[11px] text-slate-550">
                      <div className="flex items-start gap-1">
                        <span className="font-semibold text-slate-700">Pickup Location:</span>
                        <span className="line-clamp-1">{donation.pickup_location}</span>
                      </div>
                      {donation.allergen_info && (
                        <div className="flex items-start gap-1 text-amber-700">
                          <span className="font-semibold">Allergens:</span>
                          <span>{donation.allergen_info}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Claim Button Action */}
                <div className="p-5 pt-0 border-t border-slate-200/50 mt-4">
                  <button
                    onClick={() => handleClaim(donation.id)}
                    disabled={claimingId !== null || verificationStatus !== 'verified'}
                    className="w-full py-2.5 px-4 border border-transparent rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                  >
                    {claimingId === donation.id ? 'Claiming Item...' : 'Claim Surplus Food'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Icon placeholder
function ImageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  )
}
