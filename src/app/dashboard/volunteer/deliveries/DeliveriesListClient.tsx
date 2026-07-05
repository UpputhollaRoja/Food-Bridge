'use client'

import React from 'react'
import { 
  acceptDeliveryAction, 
  confirmPickupAction, 
  startTransitAction, 
  completeDeliveryAction 
} from './actions'
import ImageUploader from '@/components/ImageUploader'
import { 
  Bike, 
  MapPin, 
  Clock, 
  Phone, 
  User, 
  ChevronRight, 
  Check, 
  ShieldAlert, 
  Sparkles, 
  ArrowLeft,
  Navigation,
  CheckCircle,
  Truck
} from 'lucide-react'
import Link from 'next/link'
import VolunteerLocationBroadcaster from '@/components/VolunteerLocationBroadcaster'

interface DeliveriesListClientProps {
  initialUnassigned: any[]
  initialAssigned: any[]
  volunteerId: string
}

export default function DeliveriesListClient({ initialUnassigned, initialAssigned, volunteerId }: DeliveriesListClientProps) {
  const [activeTab, setActiveTab] = React.useState<'active' | 'available'>('active')
  const [unassigned, setUnassigned] = React.useState(initialUnassigned)
  const [assigned, setAssigned] = React.useState(initialAssigned)
  const [submittingId, setSubmittingId] = React.useState<string | null>(null)
  const [proofPaths, setProofPaths] = React.useState<Record<string, string[]>>({})
  const [error, setError] = React.useState<string | null>(null)

  const handleAccept = async (deliveryId: string) => {
    setSubmittingId(deliveryId)
    setError(null)
    try {
      const res = await acceptDeliveryAction(deliveryId)
      if (res?.error) {
        setError(res.error)
      } else {
        // Move item from unassigned to assigned
        const item = unassigned.find(d => d.id === deliveryId)
        if (item) {
          setUnassigned(unassigned.filter(d => d.id !== deliveryId))
          setAssigned([...assigned, { ...item, status: 'assigned' }])
        }
      }
    } catch (err) {
      setError('Failed to accept delivery assignment')
    } finally {
      setSubmittingId(null)
    }
  }

  const handleConfirmPickup = async (deliveryId: string) => {
    setSubmittingId(deliveryId)
    setError(null)
    try {
      const res = await confirmPickupAction(deliveryId)
      if (res?.error) {
        setError(res.error)
      } else {
        setAssigned(assigned.map(d => d.id === deliveryId ? { ...d, status: 'pickup_completed' } : d))
      }
    } catch (err) {
      setError('Failed to update pickup confirmation')
    } finally {
      setSubmittingId(null)
    }
  }

  const handleStartTransit = async (deliveryId: string) => {
    setSubmittingId(deliveryId)
    setError(null)
    try {
      const res = await startTransitAction(deliveryId)
      if (res?.error) {
        setError(res.error)
      } else {
        setAssigned(assigned.map(d => d.id === deliveryId ? { ...d, status: 'in_transit' } : d))
      }
    } catch (err) {
      setError('Failed to start transit status')
    } finally {
      setSubmittingId(null)
    }
  }

  const handleCompleteDelivery = async (deliveryId: string) => {
    const paths = proofPaths[deliveryId] || []
    if (paths.length === 0) {
      setError('A proof of delivery photo is required to complete delivery')
      return
    }

    setSubmittingId(deliveryId)
    setError(null)
    try {
      const res = await completeDeliveryAction(deliveryId, paths[0])
      if (res?.error) {
        setError(res.error)
      } else {
        setAssigned(assigned.map(d => d.id === deliveryId ? { ...d, status: 'delivered', proof_image_url: paths[0] } : d))
      }
    } catch (err) {
      setError('Failed to submit delivery completion')
    } finally {
      setSubmittingId(null)
    }
  }

  const getStatusStepIndex = (status: string) => {
    switch (status) {
      case 'assigned': return 1
      case 'pickup_completed': return 2
      case 'in_transit': return 3
      case 'delivered': return 4
      case 'confirmed': return 5
      default: return 0
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/volunteer"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white/50 text-slate-600 hover:text-slate-900 hover:bg-white/80 transition-colors shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Logistics Portal</h1>
            <p className="text-xs text-slate-500">Accept and manage food rescue logistics routes</p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex rounded-xl bg-slate-200/50 p-1 border border-slate-350/30 backdrop-blur-md">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'active' 
                ? 'bg-purple-600 text-white shadow-sm' 
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Active Deliveries ({assigned.length})
          </button>
          <button
            onClick={() => setActiveTab('available')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'available' 
                ? 'bg-purple-650 text-white shadow-sm' 
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Available Jobs ({unassigned.length})
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-sm">
          <ShieldAlert className="h-5 w-5 shrink-0 stroke-[2.5]" />
          <span>{error}</span>
        </div>
      )}

      {/* Available Tab */}
      {activeTab === 'available' && (
        <div className="space-y-6">
          {unassigned.length === 0 ? (
            <div className="text-center py-20 rounded-2xl border border-slate-200 bg-white/30">
              <Truck className="h-10 w-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900">No Jobs Available</h3>
              <p className="text-xs text-slate-555 mt-1 max-w-xs mx-auto">
                No unclaimed food listings require a volunteer courier right now. Try again later.
              </p>
            </div>
          ) : (
            unassigned.map((del) => {
              const claim = del.claims
              const donation = claim?.donations
              const ngo = claim?.profiles
              const donor = donation?.profiles

              if (!donation || !ngo) return null

              return (
                <div 
                  key={del.id}
                  className="rounded-2xl glass-card p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-purple-500/40 transition-all duration-300 shadow-md"
                >
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-lg">{donation.title}</h3>
                      <span className="px-2 py-0.5 rounded bg-purple-50 border border-purple-100 text-purple-700 text-[10px] font-bold uppercase">
                        {donation.category.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Pickup Info */}
                      <div className="space-y-1.5 border-r border-slate-200/50 pr-4">
                        <span className="font-bold text-purple-700 flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> Pickup (Donor)
                        </span>
                        <p className="text-slate-800 font-semibold">{donor?.full_name || 'Donor organization'}</p>
                        <p className="text-slate-600">{donation.pickup_location}</p>
                        <p className="text-slate-50 flex items-center gap-1 mt-1">
                          <Clock className="h-3.5 w-3.5 text-purple-650" /> Window: {new Date(donation.pickup_window_start).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - {new Date(donation.pickup_window_end).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                        </p>
                      </div>

                      {/* Drop-off Info */}
                      <div className="space-y-1.5 pl-2">
                        <span className="font-bold text-purple-700 flex items-center gap-1">
                          <Navigation className="h-3.5 w-3.5" /> Drop-off (NGO)
                        </span>
                        <p className="text-slate-800 font-semibold">{ngo.organization_name || ngo.full_name}</p>
                        <p className="text-slate-600">{ngo.address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center justify-end">
                    <button
                      onClick={() => handleAccept(del.id)}
                      disabled={submittingId !== null}
                      className="w-full lg:w-auto py-2.5 px-6 border border-transparent rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/10"
                    >
                      {submittingId === del.id ? 'Accepting...' : 'Accept Job'}
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Active Tab */}
      {activeTab === 'active' && (
        <div className="space-y-8">
          {assigned.length === 0 ? (
            <div className="text-center py-20 rounded-2xl border border-slate-200 bg-white/30">
              <Bike className="h-10 w-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900">No Active Routes</h3>
              <p className="text-xs text-slate-550 mt-1 max-w-xs mx-auto">
                You don&apos;t have any active deliveries assigned to you. Go to the &quot;Available Jobs&quot; tab to start helping.
              </p>
            </div>
          ) : (
            assigned.map((del) => {
              const claim = del.claims
              const donation = claim?.donations
              const ngo = claim?.profiles
              const donor = donation?.profiles
              const currentStep = getStatusStepIndex(del.status)

              if (!donation || !ngo) return null

              return (
                <div 
                  key={del.id}
                  className="rounded-2xl glass-card p-6 space-y-6 shadow-md"
                >
                  {/* Title & Category */}
                  <div className="flex items-center justify-between border-b border-slate-200/50 pb-4">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{donation.title}</h3>
                      <p className="text-xs text-slate-555 mt-0.5">Quantity: {donation.quantity} {donation.quantity_unit}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-purple-50 border border-purple-100 text-purple-700 text-[10px] font-bold uppercase">
                      {donation.category.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Location Broadcaster */}
                  <div className="mt-2">
                    <VolunteerLocationBroadcaster 
                      deliveryId={del.id}
                      volunteerId={volunteerId}
                      isActive={del.status === 'assigned' || del.status === 'pickup_completed' || del.status === 'in_transit'}
                    />
                  </div>

                  {/* Stepper Pipeline */}
                  <div className="relative flex items-center justify-between max-w-lg mx-auto py-2">
                    {/* Stepper Bar Background */}
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200/80 -z-10" />
                    {/* Active Bar */}
                    <div 
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-purple-650 -z-10 transition-all duration-500" 
                      style={{ width: `${(Math.max(0, currentStep - 1) / 3) * 100}%` }}
                    />

                    {/* Step Nodes */}
                    {[
                      { idx: 1, label: 'Assigned' },
                      { idx: 2, label: 'Picked Up' },
                      { idx: 3, label: 'In Transit' },
                      { idx: 4, label: 'Delivered' }
                    ].map((step) => {
                      const isCompleted = currentStep > step.idx
                      const isActive = currentStep === step.idx

                      return (
                        <div key={step.idx} className="flex flex-col items-center gap-1.5 relative">
                          <div 
                            className={`h-7 w-7 rounded-full flex items-center justify-center border text-xs font-bold transition-all duration-300 ${
                              isCompleted 
                                ? 'bg-purple-650 border-purple-650 text-white shadow-[0_0_10px_rgba(168,85,247,0.2)]' 
                                : isActive
                                  ? 'bg-white border-purple-600 text-purple-750 shadow-[0_0_10px_rgba(168,85,247,0.1)]'
                                  : 'bg-slate-50 border-slate-200 text-slate-400'
                            }`}
                          >
                            {isCompleted ? <Check className="h-4 w-4 stroke-[2.5]" /> : step.idx}
                          </div>
                          <span className={`text-[10px] font-semibold ${isActive ? 'text-purple-755 font-bold' : 'text-slate-555'}`}>
                            {step.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Directions and Contacts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200/50">
                    {/* Pickup Address & Contact */}
                    <div className="space-y-3 rounded-xl border border-slate-200 bg-white/50 p-4 text-xs shadow-sm">
                      <h4 className="font-bold text-purple-750 flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        <span>Pickup (Donor Location)</span>
                      </h4>
                      <div className="space-y-1">
                        <p className="text-slate-800 font-semibold">{donor?.full_name || 'Donor'}</p>
                        <p className="text-slate-600">{donation.pickup_location}</p>
                        <p className="text-slate-500">Expires: {new Date(donation.expiry_at).toLocaleString()}</p>
                      </div>
                      {donor?.phone && (
                        <div className="flex items-center gap-1.5 text-slate-600 mt-2 border-t border-slate-200/50 pt-2">
                          <Phone className="h-3.5 w-3.5 text-purple-600" />
                          <span>Phone: <a href={`tel:${donor.phone}`} className="text-purple-700 font-semibold hover:underline">{donor.phone}</a></span>
                        </div>
                      )}
                    </div>

                    {/* Delivery Address & Contact */}
                    <div className="space-y-3 rounded-xl border border-slate-200 bg-white/50 p-4 text-xs shadow-sm">
                      <h4 className="font-bold text-purple-750 flex items-center gap-1.5">
                        <Navigation className="h-4 w-4" />
                        <span>Drop-off (NGO Destination)</span>
                      </h4>
                      <div className="space-y-1">
                        <p className="text-slate-800 font-semibold">{ngo.organization_name || ngo.full_name}</p>
                        <p className="text-slate-600">{ngo.address}</p>
                      </div>
                      {ngo.phone && (
                        <div className="flex items-center gap-1.5 text-slate-600 mt-2 border-t border-slate-200/50 pt-2">
                          <Phone className="h-3.5 w-3.5 text-purple-600" />
                          <span>Phone: <a href={`tel:${ngo.phone}`} className="text-purple-700 font-semibold hover:underline">{ngo.phone}</a></span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions for current step */}
                  <div className="flex justify-end pt-2">
                    {/* Confirm Pickup */}
                    {del.status === 'assigned' && (
                      <button
                        onClick={() => handleConfirmPickup(del.id)}
                        disabled={submittingId !== null}
                        className="py-2.5 px-6 border border-transparent rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-sm"
                      >
                        {submittingId === del.id ? 'Updating...' : 'Confirm Food Picked Up'}
                      </button>
                    )}

                    {/* Start Transit */}
                    {del.status === 'pickup_completed' && (
                      <button
                        onClick={() => handleStartTransit(del.id)}
                        disabled={submittingId !== null}
                        className="py-2.5 px-6 border border-transparent rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-sm"
                      >
                        {submittingId === del.id ? 'Updating...' : 'Start Transit (On My Way)'}
                      </button>
                    )}

                    {/* Complete Delivery (Requires Image Proof) */}
                    {del.status === 'in_transit' && (
                      <div className="w-full md:w-auto md:min-w-[320px] space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700">Upload Delivery Photo Proof</label>
                          <ImageUploader 
                            bucket="delivery-proof" 
                            value={proofPaths[del.id] || []} 
                            onChange={(urls) => setProofPaths({ ...proofPaths, [del.id]: urls })} 
                            maxImages={1} 
                          />
                        </div>
                        <button
                          onClick={() => handleCompleteDelivery(del.id)}
                          disabled={submittingId !== null || !(proofPaths[del.id]?.length > 0)}
                          className="w-full py-2.5 px-6 border border-transparent rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                        >
                          {submittingId === del.id ? 'Submitting...' : 'Complete Delivery'}
                        </button>
                      </div>
                    )}

                    {/* Delivered Awaiting Confirmation */}
                    {del.status === 'delivered' && (
                      <div className="flex items-center gap-2 text-xs font-bold text-purple-750 bg-purple-55 border border-purple-200 px-4 py-2.5 rounded-xl shadow-sm">
                        <CheckCircle className="h-4 w-4 stroke-[2.5]" />
                        <span>Food Delivered — Awaiting NGO Confirmation</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
