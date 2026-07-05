import React from 'react'
import { Check } from 'lucide-react'

export type DonationStatus = 'pending_approval' | 'available' | 'reserved' | 'pickup_scheduled' | 'collected' | 'completed' | 'cancelled'

interface StatusStepperProps {
  currentStatus: DonationStatus
}

const steps: { key: DonationStatus; label: string }[] = [
  { key: 'pending_approval', label: 'Pending' },
  { key: 'available', label: 'Available' },
  { key: 'reserved', label: 'Reserved' },
  { key: 'pickup_scheduled', label: 'Scheduled' },
  { key: 'collected', label: 'Picked Up' },
  { key: 'completed', label: 'Completed' },
]

export default function StatusStepper({ currentStatus }: StatusStepperProps) {
  if (currentStatus === 'cancelled') {
    return (
      <div className="rounded-xl border border-urgent-text/20 bg-urgent-bg p-3 text-urgent-text text-sm font-bold text-center status-badge">
        Donation Cancelled
      </div>
    )
  }

  const currentIndex = steps.findIndex(s => s.key === currentStatus)

  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Background track */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-border rounded-full -z-10" />
        
        {/* Progress track */}
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full -z-10 transition-all duration-500 ease-in-out"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const isCompleted = index < currentIndex
          const isCurrent = index === currentIndex

          return (
            <div key={step.key} className="flex flex-col items-center gap-2">
              <div 
                className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-colors duration-300 ${
                  isCompleted 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : isCurrent 
                      ? 'bg-background border-primary text-primary' 
                      : 'bg-background border-border text-muted-foreground'
                }`}
              >
                {isCompleted ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : index + 1}
              </div>
              <span className={`text-[10px] uppercase font-bold tracking-wider hidden sm:block ${
                isCurrent || isCompleted ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
