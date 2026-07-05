'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navigation, Loader2 } from 'lucide-react'

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
  const [broadcasting, setBroadcasting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!isActive) {
      setBroadcasting(false)
      return
    }

    let watchId: number | null = null

    const startBroadcasting = () => {
      if (!navigator.geolocation) {
        setError('Geolocation not supported by browser.')
        return
      }

      setBroadcasting(true)
      setError(null)

      // Watch position to send live updates whenever volunteer moves
      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          try {
            await supabase.from('volunteer_locations').upsert(
              {
                volunteer_id: volunteerId,
                delivery_id: deliveryId,
                latitude,
                longitude,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'volunteer_id,delivery_id' }
            )
          } catch (err) {
            console.error('Error broadcasting location:', err)
          }
        },
        (err) => {
          console.error('Geolocation error:', err)
          setError('Failed to get location. Enable location permissions.')
          setBroadcasting(false)
        },
        {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 10000,
        }
      )
    }

    startBroadcasting()

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [deliveryId, volunteerId, isActive])

  if (!isActive) return null

  return (
    <div className="flex items-center gap-2 rounded-xl bg-purple-500/10 border border-purple-500/20 px-3 py-2 text-xs font-semibold text-purple-700 dark:text-purple-400">
      {broadcasting ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-600 dark:text-[#ff5a00]" />
          <span>Broadcasting your live delivery coordinates…</span>
        </>
      ) : (
        <>
          <Navigation className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{error || 'Location broadcasting off'}</span>
        </>
      )}
    </div>
  )
}
