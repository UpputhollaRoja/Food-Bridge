'use client'

import React from 'react'
import Link from 'next/link'
import { MailOpen, ArrowRight } from 'lucide-react'

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent px-4 py-12">
      <div className="w-full max-w-md text-center space-y-8">
        <div className="relative inline-flex h-20 w-20 items-center justify-center rounded-2xl shadow-2xl" style={{ border: '1px solid var(--brand-green)', background: 'var(--success-bg)', color: 'var(--brand-green)' }}>
          <MailOpen className="h-10 w-10 animate-bounce" />
          <div className="absolute inset-0 rounded-2xl blur-md -z-10" style={{ background: 'rgba(31,93,61,0.1)' }} />
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Verify Your Email
          </h2>
          <p className="text-sm max-w-sm mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            We&apos;ve sent a verification link to your email address. Please click the link in the email to activate your account.
          </p>
        </div>

        <div className="pt-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border text-sm font-semibold transition-all duration-300 shadow-sm"
            style={{
              borderColor: 'var(--border-hairline)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = 'var(--success-bg)'
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = 'var(--bg-card)'
            }}
          >
            <span>Proceed to Login</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
