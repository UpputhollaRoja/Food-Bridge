import React from 'react'
import { BadgeCheck } from 'lucide-react'

interface VerifiedBadgeProps {
  status: string
  className?: string
}

export default function VerifiedBadge({ status, className = '' }: VerifiedBadgeProps) {
  if (status !== 'verified') return null

  return (
    <span 
      className={`inline-flex items-center justify-center p-0.5 rounded-full ${className}`}
      style={{ background: 'var(--success-bg)', color: 'var(--success-text)' }}
      title="Verified Organization"
    >
      <BadgeCheck className="h-4 w-4" />
    </span>
  )
}
