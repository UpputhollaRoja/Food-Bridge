'use client'

import React, { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navigation, Loader2, AlertTriangle } from 'lucide-react'

interface VolunteerLocationBroadcasterProps {
  deliveryId: string
  volunteerId: string
  isActive: boolean
}

export default function VolunteerLocationBroadcaster({
  deliveryId,
  volunteerId,
  isActive,
}: VolunteerLocationBroadcasterProps) {
  const [hasConsent, setHasConsent] = useState(false)
  const [broadcasting, setBroadcasting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const lastInsertRef = useRef<number>(0)
  const watchIdRef = useRef<number | null>(null)
  const supabase = createClient()

  function cleanupWatch() {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
  }

  function startTracking() {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your device.')
      setBroadcasting(false)
      return
    }

    setError(null)
    setBroadcasting(true)

    cleanupWatch()

    // 1. Get initial position immediately to prevent waiting for watchPosition to trigger
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        try {
          const { error: insertError } = await supabase.from('delivery_locations').insert({
            delivery_id: deliveryId,
            latitude,
            longitude,
            recorded_at: new Date().toISOString(),
          })
          if (!insertError) {
            lastInsertRef.current = Date.now()
          }
        } catch (err) {
          console.error('Initial location insert error:', err)
        }
      },
      (err) => {
        console.warn('Initial getCurrentPosition failed/timed out, starting watch anyway:', err)
      },
      {
        enableHighAccuracy: false, // fast lookup
        timeout: 6000,
      }
    )

    // 2. Start watching for updates with a faster, snappier 5-second throttle
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        const now = Date.now()

        // Throttling: only insert every 5 seconds to prevent excessive database writes
        if (now - lastInsertRef.current >= 5000) {
          try {
            const { error: insertError } = await supabase.from('delivery_locations').insert({
              delivery_id: deliveryId,
              latitude,
              longitude,
              recorded_at: new Date().toISOString(),
            })

            if (insertError) {
              console.error('Error inserting location:', insertError)
            } else {
              lastInsertRef.current = now
            }
          } catch (err) {
            console.error('Database connection error while inserting location:', err)
          }
        }
      },
      (err) => {
        const codeMap: Record<number, string> = {
          1: 'PERMISSION_DENIED',
          2: 'POSITION_UNAVAILABLE',
          3: 'TIMEOUT',
        }
        console.warn(`Geolocation error [${codeMap[err.code] ?? err.code}]: ${err.message}`)
        if (err.code === err.PERMISSION_DENIED) {
          setError('Location access denied. Please enable location permissions in your browser settings to track.')
        } else {
          setError('Failed to retrieve location. Please check your GPS signal.')
        }
        setBroadcasting(false)
        setHasConsent(false) // Reset consent so they can try enabling again
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 15000,
      }
    )
  }

  useEffect(() => {
    // If delivery is no longer active, stop tracking immediately
    if (!isActive) {
      cleanupWatch()
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBroadcasting(false)
      return
    }

    // If we have consent and are active, start watching
    if (hasConsent && isActive) {
      startTracking()
    }

    return () => {
      cleanupWatch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryId, volunteerId, isActive, hasConsent])

  const handleGrantConsent = () => {
    setHasConsent(true)
  }

  if (!isActive) return null

  return (
    <div className="rounded-2xl border p-4 space-y-3 transition-all duration-300" style={{ borderColor: 'var(--border-hairline)', background: 'var(--bg-card)' }}>
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--success-bg)', color: 'var(--brand-green)' }}>
          <Navigation className={`h-4 w-4 ${broadcasting ? 'animate-pulse' : ''}`} />
        </div>
        <div className="flex-1 space-y-1">
          <h4 className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Live Transit Broadcast</h4>
          <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
            Status: {broadcasting ? (
              <span className="font-semibold text-emerald-600">Active Broadcaster</span>
            ) : (
              <span className="font-semibold text-amber-600">Inactive</span>
            )}
          </p>
        </div>
      </div>

      {!hasConsent && !broadcasting && (
        <div className="rounded-xl border p-3.5 space-y-3" style={{ borderColor: 'var(--pending-text)', background: 'var(--pending-bg)' }}>
          <div className="flex items-start gap-2 text-xs" style={{ color: 'var(--pending-text)' }}>
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Location Permission Required:</strong> We need your location to share live tracking with the donor and NGO during this delivery.
            </p>
          </div>
          <button
            type="button"
            onClick={handleGrantConsent}
            className="w-full py-2 px-4 rounded-lg text-xs font-bold text-white transition-all shadow-sm"
            style={{ background: 'var(--brand-green)' }}
            onMouseOver={e => (e.currentTarget.style.background = 'var(--brand-green-hover)')}
            onMouseOut={e => (e.currentTarget.style.background = 'var(--brand-green)')}
          >
            Enable Live Tracking
          </button>
        </div>
      )}

      {broadcasting && (
        <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold" style={{ background: 'var(--success-bg)', border: '1px solid var(--brand-green)', color: 'var(--success-text)' }}>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>Broadcasting your live delivery coordinates…</span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-xl px-3 py-2.5 text-[11px] font-semibold border" style={{ background: 'var(--urgent-bg)', borderColor: 'var(--urgent-text)', color: 'var(--urgent-text)' }}>
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
