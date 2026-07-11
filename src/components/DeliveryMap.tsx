'use client'

import React, { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navigation, Loader2, WifiOff, ExternalLink } from 'lucide-react'

interface DeliveryMapProps {
  deliveryId: string
  pickupLat?: number
  pickupLng?: number
  pickupLabel?: string
  destLat?: number
  destLng?: number
  destLabel?: string
  volunteerName?: string
  deliveryStatus?: string
}

export default function DeliveryMap({
  deliveryId,
  pickupLat,
  pickupLng,
  pickupLabel = 'Pickup Point',
  destLat,
  destLng,
  destLabel = 'Destination',
  volunteerName = 'Volunteer',
  deliveryStatus,
}: DeliveryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const volunteerMarkerRef = useRef<any>(null)
  const pickupMarkerRef = useRef<any>(null)
  const destMarkerRef = useRef<any>(null)
  const roadPolylineRef = useRef<any>(null)
  const volunteerPolylineRef = useRef<any>(null)

  const [status, setStatus] = useState<'loading' | 'live' | 'offline'>('loading')
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const [volunteerPos, setVolunteerPos] = useState<{ lat: number; lng: number } | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const [roadRoute, setRoadRoute] = useState<[number, number][] | null>(null)
  const [volunteerRoute, setVolunteerRoute] = useState<[number, number][] | null>(null)
  const [routeInfo, setRouteInfo] = useState<{ distanceKm: number; durationMin: number } | null>(null)
  const lastRouteFetchPosRef = useRef<{ lat: number, lng: number } | null>(null)

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

  const googleMapsUrl = getGoogleMapsUrl()

  const animFrameRef = useRef<number | null>(null)
  const currentCoordsRef = useRef<{ lat: number; lng: number } | null>(null)

  // Smooth animation between coordinates
  const animateMarker = (fromLat: number, fromLng: number, toLat: number, toLng: number) => {
    const duration = 1500
    const startTime = performance.now()

    const step = (now: number) => {
      const elapsed = now - startTime
      const t = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)

      const lat = fromLat + (toLat - fromLat) * eased
      const lng = fromLng + (toLng - fromLng) * eased

      setVolunteerPos({ lat, lng })
      if (volunteerMarkerRef.current) {
        volunteerMarkerRef.current.setLatLng([lat, lng])
      }
      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(step)
      }
    }

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    animFrameRef.current = requestAnimationFrame(step)
  }

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current) return

    // Prevent double-init (React StrictMode runs effects twice)
    let destroyed = false

    import('leaflet').then((L) => {
      // Abort if cleanup already ran before the async import resolved
      if (destroyed || !mapRef.current) return

      // If Leaflet already stamped this DOM node (e.g. from a previous StrictMode run)
      // remove that stamp so L.map() can safely re-initialize.
      const container = mapRef.current as any
      if (container._leaflet_id) {
        // Try a clean remove first
        if (mapInstanceRef.current) {
          try { mapInstanceRef.current.remove() } catch (_) {/* ignore */}
          mapInstanceRef.current = null
        }
        // Belt-and-suspenders: clear the ID directly
        delete container._leaflet_id
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const centerLat = pickupLat ?? 20.5937
      const centerLng = pickupLng ?? 78.9629

      const map = L.map(mapRef.current!, {
        center: [centerLat, centerLng],
        zoom: 13,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)

      // Pickup marker (green)
      if (pickupLat && pickupLng) {
        const pickupIcon = L.divIcon({
          className: '',
          html: `<div style="background:#22c55e;width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        })
        const pickupMarker = L.marker([pickupLat, pickupLng], { icon: pickupIcon })
          .addTo(map)
          .bindPopup(`<strong>Pickup:</strong> ${pickupLabel}`)
        pickupMarkerRef.current = pickupMarker
      }

      // Destination marker (indigo)
      if (destLat && destLng) {
        const destIcon = L.divIcon({
          className: '',
          html: `<div style="background:#6366f1;width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        })
        const destMarker = L.marker([destLat, destLng], { icon: destIcon })
          .addTo(map)
          .bindPopup(`<strong>Destination:</strong> ${destLabel}`)
        destMarkerRef.current = destMarker
      }

      // Volunteer marker (purple)
      const volunteerIcon = L.divIcon({
        className: '',
        html: `<div style="background:#a855f7;width:16px;height:16px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 6px rgba(168,85,247,0.6)"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      })
      const vStartLat = pickupLat ?? centerLat
      const vStartLng = pickupLng ?? centerLng
      const volunteerMarker = L.marker([vStartLat, vStartLng], { icon: volunteerIcon })
        .addTo(map)
        .bindPopup(`<strong>Volunteer:</strong> ${volunteerName}`)
      volunteerMarkerRef.current = volunteerMarker

      // Fit bounds to show all points
      const bounds = L.latLngBounds([])
      if (pickupLat && pickupLng) bounds.extend([pickupLat, pickupLng])
      if (destLat && destLng) bounds.extend([destLat, destLng])
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40] })
      }

      mapInstanceRef.current = map
      if (!destroyed) setMapReady(true)
    })

    return () => {
      // Signal the still-pending async import to abort
      destroyed = true

      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.remove() } catch (_) {/* ignore */}
        mapInstanceRef.current = null
        volunteerMarkerRef.current = null
        pickupMarkerRef.current = null
        destMarkerRef.current = null
        roadPolylineRef.current = null
        volunteerPolylineRef.current = null
      }
      // Clear Leaflet's DOM stamp so a re-mount can safely re-initialize
      if (mapRef.current) {
        delete (mapRef.current as any)._leaflet_id
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch actual road route via OSRM
  useEffect(() => {
    if (pickupLat && pickupLng && destLat && destLng) {
      const url = `https://router.project-osrm.org/route/v1/driving/${pickupLng},${pickupLat};${destLng},${destLat}?overview=full&geometries=geojson`;
      fetch(url)
        .then(r => r.json())
        .then(data => {
          if (data.routes && data.routes.length > 0) {
            setRoadRoute(data.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]));
          }
        })
        .catch(err => console.error('Error fetching route:', err));
    }
  }, [pickupLat, pickupLng, destLat, destLng])

  // Initial draw / roadRoute changes
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    import('leaflet').then((L) => {
      if (!roadPolylineRef.current) {
        roadPolylineRef.current = L.polyline([], {
           color: '#8b5cf6',
           weight: 4,
           opacity: 0.8,
        }).addTo(mapInstanceRef.current)
      }
      
      if (roadRoute && roadRoute.length > 0) {
         roadPolylineRef.current.setLatLngs(roadRoute);
         roadPolylineRef.current.setStyle({ dashArray: undefined });
      } else if (pickupLat && pickupLng && destLat && destLng) {
         roadPolylineRef.current.setLatLngs([[pickupLat, pickupLng], [destLat, destLng]]);
         roadPolylineRef.current.setStyle({ dashArray: '6 4' });
      }
    });
  }, [mapReady, roadRoute, pickupLat, pickupLng, destLat, destLng])

  // Update volunteer line during animation
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    import('leaflet').then((L) => {
      if (!volunteerPolylineRef.current) {
         volunteerPolylineRef.current = L.polyline([], {
             color: '#a855f7',
             weight: 3,
             opacity: 0.7,
             dashArray: '4 4'
         }).addTo(mapInstanceRef.current);
      }

      if (volunteerPos) {
        if (volunteerRoute && volunteerRoute.length > 0) {
          volunteerPolylineRef.current.setLatLngs([[volunteerPos.lat, volunteerPos.lng], ...volunteerRoute.slice(1)]);
        } else {
          const isHeadingToDest = deliveryStatus === 'pickup_completed' || deliveryStatus === 'in_transit' || deliveryStatus === 'delivered';
          const targetLat = isHeadingToDest ? destLat : pickupLat;
          const targetLng = isHeadingToDest ? destLng : pickupLng;

          if (targetLat && targetLng) {
             volunteerPolylineRef.current.setLatLngs([[volunteerPos.lat, volunteerPos.lng], [targetLat, targetLng]]);
          }
        }
      }
    });
  }, [volunteerPos, mapReady, volunteerRoute, pickupLat, pickupLng, destLat, destLng, deliveryStatus])

  // Supabase realtime subscription
  useEffect(() => {
    let isMounted = true
    const supabase = createClient()
    
    const isHeadingToDest = deliveryStatus === 'pickup_completed' || deliveryStatus === 'in_transit' || deliveryStatus === 'delivered';
    const targetLat = isHeadingToDest ? destLat : pickupLat;
    const targetLng = isHeadingToDest ? destLng : pickupLng;

    const fetchVolunteerRoute = async (fromLat: number, fromLng: number) => {
      if (!targetLat || !targetLng) return;
      const lastPos = lastRouteFetchPosRef.current;
      if (lastPos && Math.abs(lastPos.lat - fromLat) < 0.0001 && Math.abs(lastPos.lng - fromLng) < 0.0001) return;
      lastRouteFetchPosRef.current = { lat: fromLat, lng: fromLng };
      
      const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${targetLng},${targetLat}?overview=full&geometries=geojson`;
      try {
        const r = await fetch(url);
        const data = await r.json();
        if (data.routes && data.routes.length > 0 && isMounted) {
          const route = data.routes[0];
          setVolunteerRoute(route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]));
          setRouteInfo({
            distanceKm: route.distance / 1000,
            durationMin: Math.ceil(route.duration / 60)
          });
        }
      } catch (err) {
        console.error('Error fetching volunteer route:', err);
      }
    };

    const fetchInitialAndSubscribe = async () => {
      const { data: initialLoc, error: queryError } = await supabase
        .from('delivery_locations')
        .select('latitude, longitude, recorded_at')
        .eq('delivery_id', deliveryId)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (queryError) console.error('Error querying volunteer location:', queryError)

      if (initialLoc && isMounted) {
        const lat = Number(initialLoc.latitude)
        const lng = Number(initialLoc.longitude)
        setVolunteerPos({ lat, lng })
        currentCoordsRef.current = { lat, lng }
        if (volunteerMarkerRef.current) {
          volunteerMarkerRef.current.setLatLng([lat, lng])
        }
        setLastUpdate(new Date(initialLoc.recorded_at).toLocaleTimeString())
        setStatus('live')
        fetchVolunteerRoute(lat, lng)
      } else {
        if (pickupLat && pickupLng) {
          currentCoordsRef.current = { lat: pickupLat, lng: pickupLng }
        }
        setStatus('offline')
      }

      const channel = supabase
        .channel(`delivery_tracking:${deliveryId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'delivery_locations',
            filter: `delivery_id=eq.${deliveryId}`,
          },
          (payload: any) => {
            if (!isMounted) return
            const toLat = Number(payload.new.latitude)
            const toLng = Number(payload.new.longitude)
            const recordedAt = payload.new.recorded_at

            const from = currentCoordsRef.current || { lat: toLat, lng: toLng }
            animateMarker(from.lat, from.lng, toLat, toLng)
            currentCoordsRef.current = { lat: toLat, lng: toLng }
            setLastUpdate(new Date(recordedAt).toLocaleTimeString())
            setStatus('live')
            fetchVolunteerRoute(toLat, toLng)
          }
        )
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }

    const cleanupPromise = fetchInitialAndSubscribe()

    return () => {
      isMounted = false
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      cleanupPromise.then((unsubscribe) => unsubscribe?.())
    }
  }, [deliveryId, pickupLat, pickupLng, destLat, destLng, deliveryStatus])

  return (
    <div className="rounded-2xl overflow-hidden border border-border shadow-md">
      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-card border-b border-border">
        <div className="flex items-center gap-2">
          <Navigation className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Live Delivery Tracking</span>
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
              {(deliveryStatus === 'pickup_completed' || deliveryStatus === 'in_transit') 
                ? 'Picked up, heading to drop-off' 
                : 'Volunteer is on the way'}
              {routeInfo && (
                <span className="text-emerald-700/80 font-bold tracking-tight bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  {routeInfo.distanceKm.toFixed(1)} km (~{routeInfo.durationMin} min)
                </span>
              )}
              <span className="text-emerald-700/50">· {lastUpdate}</span>
            </span>
          )}
          {status === 'offline' && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <WifiOff className="h-3 w-3" /> Not yet broadcasting
            </span>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-2 bg-muted/40 text-[11px] text-muted-foreground border-b border-border">
        <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" /> Pickup</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-indigo-500" /> Drop-off</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-purple-500" /> Courier ({volunteerName})</span>
      </div>

      {/* Map Container */}
      <div ref={mapRef} style={{ width: '100%', height: '350px' }} />

      {/* Offline notice */}
      {status === 'offline' && (
        <div className="px-4 py-3 bg-amber-50 border-t border-amber-200 text-xs text-amber-700 flex items-center gap-2">
          <Navigation className="h-3.5 w-3.5 shrink-0" />
          Waiting for volunteer to start sharing location. The map will update automatically.
        </div>
      )}
    </div>
  )
}
