import Link from 'next/link'
import { FileQuestion, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
        <FileQuestion className="h-10 w-10" />
      </div>
      <h1 className="font-heading text-4xl font-black text-foreground mb-4">404 - Page Not Found</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        We couldn&apos;t find the page you were looking for. It might have been moved, deleted, or you may have mistyped the address.
      </p>
      <Link 
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/90 transition-all shadow-md hover:-translate-y-0.5"
      >
        <Home className="h-4 w-4" />
        Return Home
      </Link>
    </div>
  )
}
