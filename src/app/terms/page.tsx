import { getContent } from '@/lib/content'
import Link from 'next/link'
import { Heart, ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — Food Bridge',
  description: 'The terms and conditions governing use of the Food Bridge platform.',
}

export default async function TermsPage() {
  const { data, contentHtml } = await getContent('terms')

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <nav className="max-w-4xl w-full mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl shadow-md" style={{ background: 'var(--brand-green)', boxShadow: '0 4px 12px -2px rgba(31,93,61,0.35)' }}>
            <Heart className="h-5 w-5 text-white stroke-[2.5]" />
          </div>
          <span className="font-black text-slate-900 dark:text-white text-lg tracking-tight">Food Bridge</span>
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Home
        </Link>
      </nav>

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12">
        <div className="space-y-3 mb-10">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {data.title}
          </h1>
          {data.description && (
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl">{data.description}</p>
          )}
        </div>

        <div
          className="
            prose prose-slate dark:prose-invert max-w-none
            prose-headings:font-bold prose-headings:tracking-tight
            prose-h2:text-2xl prose-h2:text-slate-900 dark:prose-h2:text-white prose-h2:mt-10 prose-h2:mb-3
            prose-h3:text-lg prose-h3:text-slate-800 dark:prose-h3:text-slate-100
            prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-p:leading-relaxed
            prose-strong:text-slate-900 dark:prose-strong:text-white
            prose-li:text-slate-600 dark:prose-li:text-slate-300
            prose-a:no-underline hover:prose-a:underline
          "
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </main>

      <footer className="border-t border-slate-200/50 dark:border-slate-800/50 py-8 text-center text-slate-500 dark:text-slate-400 text-xs max-w-4xl w-full mx-auto px-6">
        <p>© {new Date().getFullYear()} Food Bridge. Dedicated to Zero Waste.</p>
      </footer>
    </div>
  )
}
