import React from 'react'
import Link from 'next/link'
import { MailOpen, ArrowRight } from 'lucide-react'

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent px-4 py-12">
      <div className="w-full max-w-md text-center space-y-8">
        <div className="relative inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 shadow-2xl">
          <MailOpen className="h-10 w-10 animate-bounce" />
          <div className="absolute inset-0 rounded-2xl bg-purple-500/10 blur-md -z-10" />
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Verify Your Email
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
            We&apos;ve sent a verification link to your email address. Please click the link in the email to activate your account.
          </p>
        </div>

        <div className="pt-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-white/5 text-sm font-semibold text-slate-700 dark:text-slate-250 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300 shadow-sm"
          >
            <span>Proceed to Login</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
