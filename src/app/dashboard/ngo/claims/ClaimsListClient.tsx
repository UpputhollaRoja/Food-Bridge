'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { cancelClaimAction, confirmReceiptAction } from './actions'
import { createClient } from '@/lib/supabase/client'
import { 
  Heart, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  User, 
  Phone, 
  ArrowLeft, 
  Eye, 
  Loader2 
} from 'lucide-react'
import Link from 'next/link'
import LiveTrackingMap from '@/components/LiveTrackingMap'

interface ClaimsListClientProps {
  initialClaims: any[]
  ngoLat?: number
  ngoLng?: number
  ngoAddress?: string
}

export default function ClaimsListClient({ initialClaims, ngoLat, ngoLng, ngoAddress }: ClaimsListClientProps) {
  const [claims, setClaims] = React.useState(initialClaims)
  const [loadingId, setLoadingId] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedProofUrl, setSelectedProofUrl] = React.useState<string | null>(null)

  const supabase = createClient()

  const handleCancelClaim = async (claimId: string, donationId: string) => {
    if (!confirm('Are you sure you want to cancel this claim?')) return
    setLoadingId(claimId)
    setError(null)

    try {
      const res = await cancelClaimAction(claimId, donationId)
      if (res?.error) {
        setError(res.error)
      } else {
        setClaims(claims.filter((c) => c.id !== claimId))
      }
    } catch (err: any) {
      console.error(err)
      setError('An error occurred while cancelling your claim')
    } finally {
      setLoadingId(null)
    }
  }

  const handleConfirmReceipt = async (claimId: string, donationId: string, deliveryId: string) => {
    setLoadingId(claimId)
    setError(null)

    try {
      const res = await confirmReceiptAction(claimId, donationId, deliveryId)
      if (res?.error) {
        setError(res.error)
      } else {
        // Update local state status to completed
        setClaims(
          claims.map((c) => {
            if (c.id === claimId) {
              return { 
                ...c, 
                status: 'completed', 
                deliveries: c.deliveries?.map((d: any) => d.id === deliveryId ? { ...d, status: 'confirmed' } : d) 
              }
            }
            return c
          })
        )
      }
    } catch (err: any) {
      console.error(err)
      setError('An error occurred while confirming receipt')
    } finally {
      setLoadingId(null)
    }
  }

  const getPublicUrl = (path: string) => {
    const { data } = supabase.storage.from('delivery-proof').getPublicUrl(path)
    return data.publicUrl
  }

  const getDeliveryBadge = (status: string) => {
    switch (status) {
      case 'unassigned':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 shadow-sm">Awaiting Volunteer</span>
      case 'assigned':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">Volunteer Assigned</span>
      case 'pickup_completed':
      case 'in_transit':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200 animate-pulse shadow-sm">Food In Transit</span>
      case 'delivered':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 shadow-sm">Delivered (Verify)</span>
      case 'confirmed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 shadow-sm">Receipt Confirmed</span>
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 shadow-sm">{status}</span>
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/ngo"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white/50 text-slate-600 hover:text-slate-900 hover:bg-white/80 transition-colors shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Your Claims Registry</h1>
          <p className="text-xs text-slate-550">Track claim statuses and coordinate delivery handovers</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-sm">
          <AlertTriangle className="h-5 w-5 shrink-0 stroke-[2.5]" />
          <span>{error}</span>
        </div>
      )}

      {/* Claims List */}
      {claims.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-slate-200 bg-white/30">
          <Heart className="h-10 w-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">No Claims Placed Yet</h3>
          <p className="text-xs text-slate-550 mt-1 max-w-xs mx-auto">
            Explore available listings on the map/browser to secure food donations.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/ngo/browse"
              className="inline-flex items-center justify-center py-2.5 px-5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/10"
            >
              Browse Food
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {claims.map((claim) => {
            const donation = claim.donations
            const delivery = claim.deliveries?.[0]
            const volunteer = delivery?.volunteer
            const hasProof = delivery && delivery.proof_image_url

            if (!donation) return null

            return (
              <div
                key={claim.id}
                className="relative rounded-2xl glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md hover:border-purple-500/40 transition-all duration-300"
              >
                {/* Details */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-lg">{donation.title}</h3>
                    <span className="px-2 py-0.5 rounded bg-white/40 border border-slate-200 text-[10px] font-bold text-slate-500 capitalize shadow-sm">
                      {donation.category.replace('_', ' ')}
                    </span>
                    {getDeliveryBadge(delivery?.status || 'unassigned')}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-650">
                    <div className="flex items-center gap-1.5">
                      <Scale className="h-3.5 w-3.5 text-purple-600" />
                      <span>Quantity: <strong className="text-slate-800">{donation.quantity} {donation.quantity_unit}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-purple-600" />
                      <span className="truncate">Pickup: {donation.pickup_location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-purple-600" />
                      <span>Claimed: {new Date(claim.claimed_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Volunteer Coordination Details */}
                  {volunteer && (
                    <div className="rounded-xl border border-slate-200 bg-white/50 p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-purple-600" />
                        <span className="text-slate-600">Courier: <strong className="text-slate-800">{volunteer.full_name}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-purple-600" />
                        <span className="text-slate-600">Contact: <a href={`tel:${volunteer.phone}`} className="text-purple-700 font-semibold hover:underline">{volunteer.phone}</a></span>
                      </div>
                    </div>
                  )}

                  {/* Live Tracking Map */}
                  {delivery && (delivery.status === 'assigned' || delivery.status === 'pickup_completed' || delivery.status === 'in_transit') && (
                    <div className="mt-3">
                      <LiveTrackingMap 
                        deliveryId={delivery.id}
                        pickupLat={donation.pickup_latitude ? Number(donation.pickup_latitude) : undefined}
                        pickupLng={donation.pickup_longitude ? Number(donation.pickup_longitude) : undefined}
                        pickupLabel={donation.pickup_location}
                        destLat={ngoLat ? Number(ngoLat) : undefined}
                        destLng={ngoLng ? Number(ngoLng) : undefined}
                        destLabel={ngoAddress}
                        volunteerName={volunteer?.full_name}
                      />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-row md:flex-col items-center justify-end gap-3 shrink-0">
                  {/* Proof of delivery preview */}
                  {hasProof && (
                    <button
                      onClick={() => setSelectedProofUrl(getPublicUrl(delivery.proof_image_url))}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white/50 text-slate-600 hover:text-slate-900 hover:bg-white/80 transition-colors shadow-sm"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>View Delivery Proof</span>
                    </button>
                  )}

                  {/* Cancel Claim button */}
                  {claim.status === 'pending' && (!delivery || delivery.status === 'unassigned') && (
                    <button
                      onClick={() => handleCancelClaim(claim.id, donation.id)}
                      disabled={loadingId !== null}
                      className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors shadow-sm"
                    >
                      {loadingId === claim.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                      <span>Cancel Claim</span>
                    </button>
                  )}

                  {/* Confirm Receipt button */}
                  {delivery && delivery.status === 'delivered' && (
                    <button
                      onClick={() => handleConfirmReceipt(claim.id, donation.id, delivery.id)}
                      disabled={loadingId !== null}
                      className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-all duration-300 shadow-sm"
                    >
                      {loadingId === claim.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                      <span>Confirm Receipt</span>
                    </button>
                  )}

                  {claim.status === 'completed' && (
                    <div className="flex items-center gap-1 text-purple-700 text-xs font-bold bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-xl shadow-sm">
                      <CheckCircle2 className="h-4 w-4 stroke-[2.5]" />
                      <span>Claim Completed</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Proof Image Dialog */}
      {selectedProofUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative max-w-lg w-full bg-white border border-slate-200 rounded-2xl overflow-hidden p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Delivery Proof Image</h3>
              <button
                onClick={() => setSelectedProofUrl(null)}
                className="text-slate-500 hover:text-slate-800"
              >
                Close
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedProofUrl}
              alt="Delivery Proof"
              className="w-full aspect-video object-cover rounded-xl border border-slate-200"
            />
          </div>
        </div>
      )}
    </div>
  )
}

function Scale(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="M7 21h10" />
      <path d="M12 3v18" />
      <path d="M3 7h18" />
    </svg>
  )
}
