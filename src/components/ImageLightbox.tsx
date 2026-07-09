'use client'

import React, { useEffect, useCallback } from 'react'
import { X, ZoomIn, ZoomOut, Download } from 'lucide-react'

interface ImageLightboxProps {
  /** The URL to display. Pass `null` to close the lightbox. */
  src: string | null
  /** Alt text for the image */
  alt?: string
  /** Called when the lightbox should close */
  onClose: () => void
}

/**
 * Reusable full-screen image lightbox / modal overlay.
 *
 * Usage:
 *   const [lightboxSrc, setLightboxSrc] = React.useState<string | null>(null)
 *   <ImageLightbox src={lightboxSrc} alt="Food photo" onClose={() => setLightboxSrc(null)} />
 *
 * For PDFs: use window.open(url, '_blank') instead of passing to this component.
 *
 * Features:
 * - Click outside image → close
 * - Escape key → close
 * - Visible X button (top-right)
 * - Background dim with blur
 * - Pinch/scroll zoom on mobile
 * - Download button
 * - Works on desktop & mobile
 */
export default function ImageLightbox({ src, alt = 'Image', onClose }: ImageLightboxProps) {
  const [zoom, setZoom] = React.useState(1)

  // Reset zoom when a new image opens
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (src) setZoom(1)
  }, [src])

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (src) {
      document.addEventListener('keydown', handleKeyDown)
      // Prevent body scroll while open
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [src, handleKeyDown])

  if (!src) return null

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking the dark backdrop itself, not the image
    if (e.target === e.currentTarget) onClose()
  }

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation()
    setZoom((z) => Math.min(z + 0.25, 4))
  }

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation()
    setZoom((z) => Math.max(z - 0.25, 0.5))
  }

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation()
    const link = document.createElement('a')
    link.href = src
    link.download = alt || 'image'
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    link.click()
  }

  return (
    <div
      className="lightbox-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Viewing: ${alt}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        animation: 'lightboxFadeIn 0.18s ease-out',
        padding: '16px',
      }}
    >
      {/* Control bar — top-right */}
      <div
        style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 10000,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Zoom Out */}
        <button
          onClick={handleZoomOut}
          title="Zoom out"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.25)',
            color: '#fff',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            transition: 'background 150ms',
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.28)')}
          onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
        >
          <ZoomOut size={16} />
        </button>

        {/* Zoom In */}
        <button
          onClick={handleZoomIn}
          title="Zoom in"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.25)',
            color: '#fff',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            transition: 'background 150ms',
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.28)')}
          onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
        >
          <ZoomIn size={16} />
        </button>

        {/* Download */}
        <button
          onClick={handleDownload}
          title="Download image"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.25)',
            color: '#fff',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            transition: 'background 150ms',
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.28)')}
          onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
        >
          <Download size={16} />
        </button>

        {/* Close */}
        <button
          onClick={onClose}
          title="Close (Esc)"
          aria-label="Close lightbox"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255,255,255,0.35)',
            color: '#fff',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            transition: 'background 150ms, transform 100ms',
            fontSize: '18px',
            fontWeight: 'bold',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(220, 50, 50, 0.6)'
            e.currentTarget.style.borderColor = 'rgba(220, 50, 50, 0.8)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'
          }}
        >
          <X size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* Image container — clicking the image itself does NOT close the lightbox */}
      <div
        style={{
          overflow: 'auto',
          maxWidth: '100%',
          maxHeight: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          draggable={false}
          style={{
            maxWidth: zoom <= 1 ? '90vw' : 'none',
            maxHeight: zoom <= 1 ? '88vh' : 'none',
            width: zoom > 1 ? `${zoom * 80}vw` : undefined,
            objectFit: 'contain',
            borderRadius: '12px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
            transform: `scale(${zoom <= 1 ? 1 : 1})`,
            transition: 'transform 200ms ease, width 200ms ease',
            userSelect: 'none',
          }}
        />
      </div>

      {/* Caption / zoom level indicator */}
      {zoom !== 1 && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.6)',
            color: '#fff',
            fontSize: '11px',
            fontWeight: '600',
            padding: '5px 14px',
            borderRadius: '99px',
            backdropFilter: 'blur(6px)',
            pointerEvents: 'none',
          }}
        >
          {Math.round(zoom * 100)}%
        </div>
      )}

      {/* Hint text */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          color: 'rgba(255,255,255,0.45)',
          fontSize: '10px',
          fontWeight: '500',
          pointerEvents: 'none',
        }}
      >
        Click outside or press Esc to close
      </div>

      <style>{`
        @keyframes lightboxFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
