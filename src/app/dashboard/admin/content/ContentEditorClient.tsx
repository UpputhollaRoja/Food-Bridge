'use client'

import React, { useActionState } from 'react'
import Link from 'next/link'
import { saveContentAction } from './actions'
import { CheckCircle, AlertCircle, ArrowLeft, FileText, Save, Globe } from 'lucide-react'

interface ContentRow {
  page: string
  key: string
  value: string
  label: string
  type: string
  sort_order: number
}

interface ContentEditorClientProps {
  pages: Record<string, ContentRow[]>
}

const PAGE_LABELS: Record<string, string> = {
  home: 'Home / Landing Page',
  about: 'About Page',
  faq: 'FAQ Page',
}

export default function ContentEditorClient({ pages }: ContentEditorClientProps) {
  const [activePage, setActivePage] = React.useState(Object.keys(pages)[0] ?? 'home')
  const [state, formAction, isPending] = useActionState(saveContentAction, null)

  const pageKeys = Object.keys(pages)

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200/20 dark:border-slate-700/30 pb-6">
        <div>
          <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--brand-green)' }}>Admin</span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2">
            <Globe className="h-7 w-7" style={{ color: 'var(--brand-green)' }} />
            Content Editor
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Edit page text and descriptions. Changes go live immediately when saved.
          </p>
        </div>
        <Link
          href="/dashboard/admin"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>
      </header>

      {/* Status messages */}
      {state?.success && (
        <div className="flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-700 dark:text-green-400">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span className="font-semibold">Content saved! Pages updated live.</span>
        </div>
      )}
      {state?.error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
        {/* Page Sidebar */}
        <aside className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1 mb-3">Pages</p>
          {pageKeys.map((page) => (
            <button
              key={page}
              onClick={() => setActivePage(page)}
              className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-left text-xs font-semibold transition-all duration-200"
              style={activePage === page
                ? { background: 'var(--brand-green)', color: '#fff', boxShadow: '0 2px 8px rgba(31,93,61,0.25)' }
                : {}}
            >
              <FileText className="h-3.5 w-3.5 shrink-0" />
              {PAGE_LABELS[page] ?? page}
            </button>
          ))}
        </aside>

        {/* Editor Form */}
        <form action={formAction}>
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/30 dark:border-slate-700/30">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {PAGE_LABELS[activePage] ?? activePage}
              </h2>
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-50 shadow-md"
                style={{ background: 'var(--brand-green)' }}
                onMouseOver={e => !isPending && (e.currentTarget.style.background = 'var(--brand-green-hover)')}
                onMouseOut={e => (e.currentTarget.style.background = 'var(--brand-green)')}
              >
                <Save className="h-3.5 w-3.5" />
                {isPending ? 'Saving…' : 'Save Changes'}
              </button>
            </div>

            {(pages[activePage] ?? []).map((row) => (
              <div key={row.key} className="space-y-1.5">
                <label
                  htmlFor={`field-${row.key}`}
                  className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-between"
                >
                  <span>{row.label}</span>
                  <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{row.key}</span>
                </label>

                {row.type === 'textarea' ? (
                  <textarea
                    id={`field-${row.key}`}
                    name={`${activePage}__${row.key}`}
                    defaultValue={row.value}
                    rows={4}
                    className="block w-full rounded-xl glass-input px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-y transition-colors"
                  />
                ) : (
                  <input
                    id={`field-${row.key}`}
                    name={`${activePage}__${row.key}`}
                    type="text"
                    defaultValue={row.value}
                    className="block w-full rounded-xl glass-input px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
                  />
                )}
              </div>
            ))}

            {/* Hidden: identify which page's fields are being saved */}
            <input type="hidden" name="_page" value={activePage} />

            <div className="pt-4 border-t border-slate-200/30 dark:border-slate-700/30 flex items-center justify-end">
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 shadow-lg"
                style={{ background: 'var(--brand-green)' }}
                onMouseOver={e => !isPending && (e.currentTarget.style.background = 'var(--brand-green-hover)')}
                onMouseOut={e => (e.currentTarget.style.background = 'var(--brand-green)')}
              >
                <Save className="h-4 w-4" />
                {isPending ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
