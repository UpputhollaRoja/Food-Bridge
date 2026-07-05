'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertOctagon, RotateCcw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-6">
        <AlertOctagon className="h-10 w-10" />
      </div>
      <h1 className="font-heading text-4xl font-black text-foreground mb-4">Something went wrong!</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        An unexpected error has occurred. We've been notified and are looking into it.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/90 transition-all shadow-md hover:-translate-y-0.5"
        >
          <RotateCcw className="h-4 w-4" />
          Try again
        </button>
        <Link 
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-input bg-card text-sm font-semibold text-foreground hover:bg-muted transition-all duration-300"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
}
