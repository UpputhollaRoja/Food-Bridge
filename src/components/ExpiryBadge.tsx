import React, { useState, useEffect } from 'react'

interface ExpiryBadgeProps {
  expiryAt: string
}

export default function ExpiryBadge({ expiryAt }: ExpiryBadgeProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const expiryDate = new Date(expiryAt)
  const now = mounted ? new Date() : expiryDate
  const diffMs = expiryDate.getTime() - now.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)

  let bgClass = 'bg-success-bg text-success-text border-success-text/10'
  let label = 'Expires later'
  let pulseClass = ''

  if (diffHours < 0) {
    bgClass = 'bg-border-hairline/25 text-text-secondary border-border-hairline'
    label = 'Expired'
  } else if (diffHours <= 1) {
    bgClass = 'bg-urgent-bg text-urgent-text border-urgent-text/10'
    label = 'Expires < 1h'
    pulseClass = 'animate-gentle-pulse'
  } else if (diffHours <= 6) {
    bgClass = 'bg-pending-bg text-pending-text border-pending-text/10'
    label = 'Expires soon'
  } else {
    label = `Expires in ${Math.round(diffHours)}h`
  }

  // Circular indicator variables
  const r = 5
  const circ = 2 * Math.PI * r // ~31.42
  const pct = Math.max(0, Math.min(1, diffHours / 24))
  const targetOffset = circ * (1 - pct)
  const durationMs = Math.max(300, Math.min(2400, pct * 2400))

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all duration-200 status-badge ${bgClass} ${pulseClass}`}>
      <svg className="h-3 w-3 transform -rotate-90 shrink-0" viewBox="0 0 12 12">
        <circle
          cx="6"
          cy="6"
          r={r}
          className="opacity-20"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="transparent"
        />
        <circle
          cx="6"
          cy="6"
          r={r}
          stroke="currentColor"
          strokeWidth="1.5"
          fill="transparent"
          strokeDasharray={circ}
          strokeDashoffset={circ}
          style={mounted ? {
            ['--target-offset' as any]: targetOffset,
            animation: `fillRing ${durationMs}ms ease-out forwards`,
          } : undefined}
        />
      </svg>
      <span>{label}</span>
    </span>
  )
}
