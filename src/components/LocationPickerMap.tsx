'use client'

import React, { useEffect, useRef, useState } from 'react'
import { MapPin, Search, Loader2 } from 'lucide-react'

interface LocationResult {
  display_name: string
  lat: string
  lon: string
}

interface LocationPickerMapProps {
  defaultAddress?: string
  onSelect: (address: string, lat: number, lng: number) => void
}

export default function LocationPickerMap({ defaultAddress = '', onSelect }: LocationPickerMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)

  const [query, setQuery] = useState(defaultAddress)
  const [results, setResults] = useState<LocationResult[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState(defaultAddress)
  const [selectedLat, setSelectedLat] = useState<number | null>(null)
  const [selectedLng, setSelectedLng] = useState<number | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Lazy-load Leaflet only in browser
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    import('leaflet').then((L) => {
      // Fix default icon paths broken by webpack
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const defaultLat = 17.385
      const defaultLng = 78.4867

      const map = L.map(mapRef.current!, {
        center: [defaultLat, defaultLng],
        zoom: 13,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map)

      const marker = L.marker([defaultLat, defaultLng], { draggable: true }).addTo(map)

      marker.on('dragend', () => {
        const pos = marker.getLatLng()
        reverseGeocode(pos.lat, pos.lng)
      })

      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng
        marker.setLatLng([lat, lng])
        reverseGeocode(lat, lng)
      })

      mapInstanceRef.current = map
      markerRef.current = marker
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markerRef.current = null
      }
    }
  }, [])

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const data = await res.json()
      const address = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`
      setQuery(address)
      setSelectedAddress(address)
      setSelectedLat(lat)
      setSelectedLng(lng)
      onSelect(address, lat, lng)
    } catch {
      const fallback = `${lat.toFixed(5)}, ${lng.toFixed(5)}`
      setQuery(fallback)
      setSelectedAddress(fallback)
      setSelectedLat(lat)
      setSelectedLng(lng)
      onSelect(fallback, lat, lng)
    }
  }

  const search = async (q: string) => {
    if (q.trim().length < 3) { setResults([]); return }
    setSearching(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const data: LocationResult[] = await res.json()
      setResults(data)
      setShowDropdown(true)
    } catch {
      setResults([])
    } finally {
      setSearching(false)
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => search(val), 500)
  }

  const handleSelect = (r: LocationResult) => {
    const lat = parseFloat(r.lat)
    const lng = parseFloat(r.lon)
    setQuery(r.display_name)
    setSelectedAddress(r.display_name)
    setSelectedLat(lat)
    setSelectedLng(lng)
    setShowDropdown(false)
    setResults([])
    onSelect(r.display_name, lat, lng)

    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([lat, lng], 16)
      markerRef.current.setLatLng([lat, lng])
    }
  }

  return (
    <div className="space-y-2">
      {/* Search Box */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
          {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </div>
        <input
          type="text"
          value={query}
          onChange={handleInput}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          placeholder="Search for pickup address…"
          className="block w-full rounded-xl glass-input pl-10 pr-3 py-2.5 text-sm placeholder-slate-400 focus:ring-1 focus:ring-purple-500 transition-colors"
        />
        {showDropdown && results.length > 0 && (
          <ul className="absolute z-50 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden max-h-52 overflow-y-auto">
            {results.map((r, i) => (
              <li
                key={i}
                onMouseDown={() => handleSelect(r)}
                className="flex items-start gap-2 px-3 py-2.5 text-xs text-slate-700 hover:bg-purple-50 cursor-pointer border-b border-slate-100 last:border-0"
              >
                <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-purple-500" />
                <span className="line-clamp-2">{r.display_name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Map */}
      <div
        ref={mapRef}
        className="w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm"
        style={{ height: '260px' }}
      />

      {selectedAddress && (
        <p className="text-[11px] text-slate-500 flex items-center gap-1">
          <MapPin className="h-3 w-3 text-purple-500 shrink-0" />
          <span className="truncate">{selectedAddress}</span>
          {selectedLat && selectedLng && (
            <span className="text-slate-400 shrink-0">({selectedLat.toFixed(4)}, {selectedLng.toFixed(4)})</span>
          )}
        </p>
      )}
    </div>
  )
}
