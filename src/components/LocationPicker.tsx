'use client'

/**
 * DonorLocationPicker
 * ─────────────────────────────────────────────────────────────────
 * Lets a donor set the pickup location for a specific donation.
 *
 * Flow:
 *  1. "Use My Current Location" → navigator.geolocation → save to Supabase
 *  2. If geo fails / denied → fallback map (Leaflet, click-to-pin)
 *  3. Manual address search (Nominatim / OpenStreetMap, free — no API key needed)
 *
 * Props:
 *  donationId  – UUID of the donation to update in `donations.pickup_location`
 *  onSaved?    – optional callback after a successful save
 *
 * Supabase schema assumed:
 *  donations.pickup_location  TEXT   (stored as JSON string: {"lat":..., "lng":..., "address":...})
 * ─────────────────────────────────────────────────────────────────
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  MapPin,
  Navigation,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Search,
  X,
} from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────
interface LatLng {
  lat: number
  lng: number
}

interface SavedLocation extends LatLng {
  address: string
}

interface NominatimResult {
  display_name: string
  lat: string
  lon: string
}

interface LocationPickerProps {
  /** Callback fired when location is selected/saved */
  onChange: (location: SavedLocation) => void
  /** Default label */
  label?: string
}

// ─── Status union ────────────────────────────────────────────────
type Status = 'idle' | 'locating' | 'saved' | 'error' | 'saving'

// ─── Helper: reverse geocode via Nominatim (free, no key) ────────
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    )
    const data = await res.json()
    return (data as NominatimResult).display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
  }
}

// ─── Helper: forward geocode search ─────────────────────────────
async function searchAddress(query: string): Promise<NominatimResult[]> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
    { headers: { 'Accept-Language': 'en' } }
  )
  return res.json()
}

// ════════════════════════════════════════════════════════════════
export default function LocationPicker({
  onChange,
  label = "Pickup location"
}: LocationPickerProps) {

  // ─── State ──────────────────────────────────────────────────
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [location, setLocation] = useState<SavedLocation | null>(null)
  const [showMap, setShowMap] = useState(false)

  // Search bar
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([])
  const [searching, setSearching] = useState(false)
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Leaflet refs
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)

  // ─── Handle Location Selection ──────────────────────────────
  const handleSelectLocation = useCallback(
    (loc: SavedLocation) => {
      setStatus('saved')
      setLocation(loc)
      onChange(loc)
    },
    [onChange]
  )

  // ─── GPS: Get Current Location ────────────────────────────────
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setStatus('error')
      setErrorMsg('Geolocation is not supported by your browser.')
      setShowMap(true)
      return
    }

    setStatus('locating')
    setErrorMsg('')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        const address = await reverseGeocode(lat, lng)
        const loc: SavedLocation = { lat, lng, address }
        handleSelectLocation(loc)
        setShowMap(true) // show the map to confirm position
      },
      (err) => {
        // Permission denied or other geolocation error → show fallback map
        setStatus('error')
        setErrorMsg(
          err.code === 1
            ? 'Location permission denied. Please click on the map to set your pickup location.'
            : `Location error: ${err.message}`
        )
        setShowMap(true)
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 0 }
    )
  }

  // ─── Leaflet Map init / update ───────────────────────────────
  useEffect(() => {
    if (!showMap || !mapRef.current) return

    let destroyed = false

    import('leaflet').then((L) => {
      if (destroyed || !mapRef.current) return

      // Prevent duplicate Leaflet init (React StrictMode)
      const container = mapRef.current as any
      if (container._leaflet_id) {
        try { mapInstanceRef.current?.remove() } catch (_) { /* noop */ }
        mapInstanceRef.current = null
        delete container._leaflet_id
      }

      // Fix webpack icon path issue
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      // Center: use known location or default to Hyderabad, India
      const center: [number, number] = location
        ? [location.lat, location.lng]
        : [17.385, 78.4867]

      const map = L.map(mapRef.current).setView(center, location ? 15 : 12)
      mapInstanceRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map)

      // Drop marker at known location if available
      if (location) {
        markerRef.current = L.marker([location.lat, location.lng])
          .addTo(map)
          .bindPopup('📍 Pickup location')
          .openPopup()
      }

      // Click to manually select location
      map.on('click', async (e: any) => {
        const { lat, lng } = e.latlng

        // Move or create marker
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng])
        } else {
          markerRef.current = L.marker([lat, lng]).addTo(map)
        }
        markerRef.current.bindPopup('📍 Pickup location').openPopup()

        const address = await reverseGeocode(lat, lng)
        setQuery(address)
        const loc: SavedLocation = { lat, lng, address }
        handleSelectLocation(loc)
      })
    })

    return () => {
      destroyed = true
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.remove() } catch (_) { /* noop */ }
        mapInstanceRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMap]) // Only init once when map becomes visible

  // ─── When location updates, re-centre map & move marker ──────
  useEffect(() => {
    if (!mapInstanceRef.current || !location) return
    import('leaflet').then((L) => {
      mapInstanceRef.current.setView([location.lat, location.lng], 15)
      if (markerRef.current) {
        markerRef.current.setLatLng([location.lat, location.lng])
      } else {
        markerRef.current = L.marker([location.lat, location.lng])
          .addTo(mapInstanceRef.current)
          .bindPopup('📍 Pickup location')
          .openPopup()
      }
    })
  }, [location])

  // ─── Address search (debounced) ──────────────────────────────
  const handleSearchInput = (value: string) => {
    setQuery(value)
    setSearchResults([])
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    if (value.length < 3) return

    searchTimeout.current = setTimeout(async () => {
      setSearching(true)
      try {
        const results = await searchAddress(value)
        setSearchResults(results)
      } finally {
        setSearching(false)
      }
    }, 500)
  }

  const handleSelectSearchResult = async (result: NominatimResult) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    const loc: SavedLocation = { lat, lng, address: result.display_name }
    setQuery(result.display_name)
    setSearchResults([])
    handleSelectLocation(loc)
    setShowMap(true)
  }

  // ─── Render ──────────────────────────────────────────────────
  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div
          className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'var(--success-bg)' }}
        >
          <MapPin className="h-5 w-5" style={{ color: 'var(--brand-teal)' }} />
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            Pickup Location
          </p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Set where volunteers will collect this donation
          </p>
        </div>
      </div>

      {/* GPS Button */}
      {status !== 'saved' && (
        <button
          type="button"
          onClick={handleGetLocation}
          disabled={status === 'locating' || status === 'saving'}
          className="btn-primary w-full py-3.5 px-6 flex items-center justify-center gap-2"
        >
          {status === 'locating' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
          <span>
            {status === 'locating'
              ? 'Detecting your location…'
              : status === 'saving'
              ? 'Saving…'
              : 'Use My Current Location'}
          </span>
        </button>
      )}

      {/* Saved confirmation banner */}
      {status === 'saved' && location && (
        <div
          className="flex items-start gap-3 rounded-2xl p-4 border"
          style={{
            background: 'var(--success-bg)',
            borderColor: 'var(--success-border)',
          }}
        >
          <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" style={{ color: 'var(--success-text)' }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold" style={{ color: 'var(--success-text)' }}>
              Pickup location saved!
            </p>
            <p className="text-xs mt-0.5 break-words" style={{ color: 'var(--text-secondary)' }}>
              {location.address}
            </p>
            <p className="text-[11px] mt-1 font-mono" style={{ color: 'var(--text-muted)' }}>
              {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setStatus('idle')
              setLocation(null)
              setShowMap(false)
              setQuery('')
            }}
            className="shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors"
            title="Change location"
          >
            <X className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>
      )}

      {/* Error banner */}
      {status === 'error' && errorMsg && (
        <div
          className="flex items-start gap-3 rounded-2xl p-4 border"
          style={{
            background: 'var(--urgent-bg)',
            borderColor: 'var(--urgent-border)',
          }}
        >
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" style={{ color: 'var(--urgent-text)' }} />
          <p className="text-sm" style={{ color: 'var(--urgent-text)' }}>
            {errorMsg}
          </p>
        </div>
      )}

      {/* Manual address search (shown when map is visible) */}
      {showMap && (
        <div className="relative">
          <div className="relative">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
              style={{ color: 'var(--text-muted)' }}
            />
            {searching && (
              <Loader2
                className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin"
                style={{ color: 'var(--brand-teal)' }}
              />
            )}
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearchInput(e.target.value)}
              placeholder="Search for an address…"
              className="glass-input w-full rounded-xl pl-10 pr-10 py-3 text-sm"
            />
          </div>

          {/* Search results dropdown */}
          {searchResults.length > 0 && (
            <ul
              className="absolute z-50 mt-1.5 w-full rounded-xl border overflow-hidden shadow-lg"
              style={{
                background: 'var(--bg-card)',
                borderColor: 'var(--border-hairline)',
              }}
            >
              {searchResults.map((r, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => handleSelectSearchResult(r)}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-black/5 transition-colors flex items-start gap-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <MapPin
                      className="h-4 w-4 shrink-0 mt-0.5"
                      style={{ color: 'var(--brand-teal)' }}
                    />
                    <span className="leading-snug">{r.display_name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Leaflet Map */}
      {showMap && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            {status === 'saved'
              ? 'Confirmed pickup location'
              : 'Click anywhere on the map to set pickup location'}
          </p>
          <div
            ref={mapRef}
            className="w-full rounded-2xl overflow-hidden border"
            style={{
              height: 280,
              borderColor: 'var(--border-hairline)',
              zIndex: 0,
            }}
          />
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            Map data © OpenStreetMap contributors
          </p>
        </div>
      )}

      {/* Divider + fallback CTA when map not yet shown */}
      {!showMap && status === 'idle' && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: 'var(--border-hairline)' }} />
          <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
            or
          </span>
          <div className="flex-1 h-px" style={{ background: 'var(--border-hairline)' }} />
        </div>
      )}

      {!showMap && status === 'idle' && (
        <button
          type="button"
          onClick={() => setShowMap(true)}
          className="btn-secondary w-full py-3 px-6 flex items-center justify-center gap-2"
        >
          <MapPin className="h-4 w-4" />
          <span>Choose on Map Instead</span>
        </button>
      )}
    </div>
  )
}
