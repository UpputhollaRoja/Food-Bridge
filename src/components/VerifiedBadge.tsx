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
      className={`inline-flex items-center justify-center text-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-full ${className}`}
      title="Verified Organization"
    >
      <BadgeCheck className="h-4 w-4" />
    </span>
  )
}
