import React from 'react'

export function CardSkeleton() {
  return (
    <div className="rounded-2xl glass-card p-5 animate-pulse flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className="h-5 w-1/3 bg-muted rounded" />
        <div className="h-4 w-16 bg-muted rounded-full" />
      </div>
      <div className="flex gap-4">
        <div className="h-3 w-20 bg-muted rounded" />
        <div className="h-3 w-24 bg-muted rounded" />
      </div>
      <div className="h-10 w-full bg-muted rounded-xl mt-2" />
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <div className="h-3 w-24 bg-muted rounded mb-2" />
          <div className="h-8 w-48 bg-muted rounded" />
        </div>
        <div className="flex gap-4">
          <div className="h-10 w-10 bg-muted rounded-xl" />
          <div className="h-10 w-10 bg-muted rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-3 gap-4">
            <div className="h-24 bg-muted rounded-2xl" />
            <div className="h-24 bg-muted rounded-2xl" />
            <div className="h-24 bg-muted rounded-2xl" />
          </div>
          <div className="h-32 bg-muted rounded-2xl" />
          <div className="space-y-4">
            <div className="h-6 w-48 bg-muted rounded" />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
        <div className="lg:col-span-4">
          <div className="h-96 bg-muted rounded-2xl sticky top-6" />
        </div>
      </div>
    </div>
  )
}
