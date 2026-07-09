'use client'

import React, { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MapPin, Navigation, Loader2, WifiOff, ExternalLink } from 'lucide-react'

interface LiveTrackingMapProps {
  deliveryId: string
  pickupLat?: number
  pickupLng?: number
  pickupLabel?: string
  destLat?: number
  destLng?: number
  destLabel?: string
  volunteerName?: string
}

export default function LiveTrackingMap({
  deliveryId,
  pickupLat,
  pickupLng,
  pickupLabel = 'Pickup Point',
  destLat,
  destLng,
  destLabel = 'Destination',
  volunteerName = 'Volunteer',
}: LiveTrackingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const volunteerMarkerRef = useRef<any>(null)
  const animFrameRef = useRef<number | null>(null)
  const currentCoordsRef = useRef<{ lat: number; lng: number } | null>(null)

  const [status, setStatus] = useState<'loading' | 'live' | 'offline'>('loading')
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const [volunteerPos, setVolunteerPos] = useState<{ lat: number; lng: number } | null>(null)

  // Generate Google Maps Link based on volunteer current location
  const getGoogleMapsUrl = () => {
    const startLat = volunteerPos?.lat
    const startLng = volunteerPos?.lng

    if (startLat && startLng) {
      if (pickupLat && pickupLng && destLat && destLng) {
        return `https://www.google.com/maps/dir/?api=1&origin=${startLat},${startLng}&destination=${destLat},${destLng}&waypoints=${pickupLat},${pickupLng}&travelmode=driving`
      } else if (destLat && destLng) {
        return `https://www.google.com/maps/dir/?api=1&origin=${startLat},${startLng}&destination=${destLat},${destLng}&travelmode=driving`
      } else if (pickupLat && pickupLng) {
        return `https://www.google.com/maps/dir/?api=1&origin=${startLat},${startLng}&destination=${pickupLat},${pickupLng}&travelmode=driving`
      }
    }

    if (pickupLat && pickupLng && destLat && destLng) {
      return `https://www.google.com/maps/dir/?api=1&origin=${pickupLat},${pickupLng}&destination=${destLat},${destLng}&travelmode=driving`
    } else if (destLat && destLng) {
      return `https://www.google.com/maps/search/?api=1&query=${destLat},${destLng}`
    } else if (pickupLat && pickupLng) {
      return `https://www.google.com/maps/search/?api=1&query=${pickupLat},${pickupLng}`
    }
    return null
  }

  const googleMapsUrl = getGoogleMapsUrl();

  // Smooth animation between two coordinate pairs
  const animateMarker = (fromLat: number, fromLng: number, toLat: number, toLng: number) => {
    if (!volunteerMarkerRef.current) return
    const duration = 1500 // ms
    const startTime = performance.now()

    const step = (now: number) => {
      const elapsed = now - startTime
      const t = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3)

      const lat = fromLat + (toLat - fromLat) * eased
      const lng = fromLng + (toLng - fromLng) * eased
      volunteerMarkerRef.current?.setLatLng([lat, lng])

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(step)
      }
    }
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    animFrameRef.current = requestAnimationFrame(step)
  }

  useEffect(() => {
    let isMounted = true
    let destroyed = false

    const initMap = async () => {
      if (!mapRef.current) return

      // Dynamically import Leaflet (SSR-safe)
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')

      if (destroyed || !mapRef.current) return

      // Clear any stale Leaflet DOM stamp from a previous StrictMode run
      const container = mapRef.current as any
      if (container._leaflet_id) {
        if (mapInstanceRef.current) {
          try { mapInstanceRef.current.remove() } catch (_) {/* ignore */}
          mapInstanceRef.current = null
        }
        delete container._leaflet_id
      }

      // Default center: use pickup or fallback to India
      const centerLat = pickupLat ?? 20.5937
      const centerLng = pickupLng ?? 78.9629

      const map = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView([centerLat, centerLng], 14)

      mapInstanceRef.current = map

      // OpenStreetMap tiles — completely free
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      // Pickup marker (green)
      if (pickupLat && pickupLng) {
        const pickupIcon = L.divIcon({
          className: '',
          html: `<div style="
            background:#10b981;color:white;border-radius:50% 50% 50% 0;
            width:32px;height:32px;display:flex;align-items:center;justify-content:center;
            transform:rotate(-45deg);border:2px solid white;
            box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:14px;
          "><span style="transform:rotate(45deg)">📦</span></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        })
        L.marker([pickupLat, pickupLng], { icon: pickupIcon })
          .addTo(map)
          .bindPopup(`<b>Pickup:</b> ${pickupLabel}`)
      }

      // Destination marker (blue)
      if (destLat && destLng) {
        const destIcon = L.divIcon({
          className: '',
          html: `<div style="
            background:#6366f1;color:white;border-radius:50% 50% 50% 0;
            width:32px;height:32px;display:flex;align-items:center;justify-content:center;
            transform:rotate(-45deg);border:2px solid white;
            box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:14px;
          "><span style="transform:rotate(45deg)">🏠</span></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        })
        L.marker([destLat, destLng], { icon: destIcon })
          .addTo(map)
          .bindPopup(`<b>Drop-off:</b> ${destLabel}`)
      }

      // Volunteer (truck) marker — starts at pickup
      const truckIcon = L.divIcon({
        className: '',
        html: `<div style="
          background:#a855f7;color:white;border-radius:50%;
          width:40px;height:40px;display:flex;align-items:center;justify-content:center;
          border:3px solid white;box-shadow:0 4px 12px rgba(168,85,247,0.5);
          font-size:20px;animation:pulse 2s infinite;
        ">🚚</div>
        <style>@keyframes pulse{0%,100%{box-shadow:0 4px 12px rgba(168,85,247,0.5)}50%{box-shadow:0 4px 20px rgba(168,85,247,0.9)}}</style>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      })

      const startLat = pickupLat ?? centerLat
      const startLng = pickupLng ?? centerLng

      volunteerMarkerRef.current = L.marker([startLat, startLng], { icon: truckIcon })
        .addTo(map)
        .bindPopup(`<b>${volunteerName}</b> is on the way`)

      currentCoordsRef.current = { lat: startLat, lng: startLng }

      // Fit bounds to show all markers
      const points: [number, number][] = [[startLat, startLng]]
      if (pickupLat && pickupLng) points.push([pickupLat, pickupLng])
      if (destLat && destLng) points.push([destLat, destLng])
      if (points.length > 1) {
        const bounds = L.latLngBounds(points)
        map.fitBounds(bounds, { padding: [40, 40] })
      }

      // Fetch initial location from DB
      const supabase = createClient()
      const { data: initialLoc } = await supabase
        .from('volunteer_locations')
        .select('latitude, longitude, updated_at')
        .eq('delivery_id', deliveryId)
        .single()

      if (initialLoc && isMounted && !destroyed) {
        const { latitude: lat, longitude: lng, updated_at } = initialLoc
        volunteerMarkerRef.current?.setLatLng([lat, lng])
        currentCoordsRef.current = { lat, lng }
        setVolunteerPos({ lat, lng })
        map.panTo([lat, lng])
        setLastUpdate(new Date(updated_at).toLocaleTimeString())
        setStatus('live')
      } else {
        setStatus('offline')
      }

      // Subscribe to realtime coordinate updates
      const channel = supabase
        .channel(`tracking:${deliveryId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'volunteer_locations',
            filter: `delivery_id=eq.${deliveryId}`,
          },
          (payload: any) => {
            if (!isMounted || destroyed) return
            const { latitude: toLat, longitude: toLng, updated_at } = payload.new
            const from = currentCoordsRef.current ?? { lat: toLat, lng: toLng }
            animateMarker(from.lat, from.lng, toLat, toLng)
            currentCoordsRef.current = { lat: toLat, lng: toLng }
            setVolunteerPos({ lat: toLat, lng: toLng })
            setLastUpdate(new Date(updated_at).toLocaleTimeString())
            setStatus('live')
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }

    const cleanup = initMap()

    return () => {
      isMounted = false
      destroyed = true
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      cleanup.then((fn) => fn?.())
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.remove() } catch (_) {/* ignore */}
        mapInstanceRef.current = null
      }
      if (mapRef.current) {
        delete (mapRef.current as any)._leaflet_id
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryId])

  return (
    <div className="rounded-2xl overflow-hidden border border-border shadow-md">
      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-card border-b border-border">
        <div className="flex items-center gap-2">
          <Navigation className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Live Tracking</span>
        </div>
        <div className="flex items-center gap-2">
          {googleMapsUrl && (
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open route in Google Maps"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all hover:scale-105 active:scale-95"
              style={{ borderColor: 'var(--border-hairline)', background: 'var(--bg-card)', color: 'var(--text-secondary)' }}
              onMouseOver={e => { e.currentTarget.style.background = '#E8F5E9'; e.currentTarget.style.color = '#1a73e8' }}
              onMouseOut={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
            >
              <ExternalLink className="h-3 w-3" />
              Google Maps
            </a>
          )}
          {status === 'loading' && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> Connecting…
            </span>
          )}
          {status === 'live' && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live · {lastUpdate}
            </span>
          )}
          {status === 'offline' && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <WifiOff className="h-3 w-3" /> Volunteer not broadcasting
            </span>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-2 bg-muted/40 text-[11px] text-muted-foreground border-b border-border">
        <span className="flex items-center gap-1"><span>📦</span> Pickup</span>
        <span className="flex items-center gap-1"><span>🏠</span> Drop-off</span>
        <span className="flex items-center gap-1"><span>🚚</span> {volunteerName}</span>
      </div>

      {/* Map Container */}
      <div ref={mapRef} style={{ height: '350px', width: '100%' }} />

      {/* Location off notice */}
      {status === 'offline' && (
        <div className="px-4 py-3 bg-amber-50 border-t border-amber-200 text-xs text-amber-700 flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          Waiting for volunteer to start sharing location. The map will update automatically.
        </div>
      )}
    </div>
  )
}
