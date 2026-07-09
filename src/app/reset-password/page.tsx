'use client'

import React, { useActionState } from 'react'
import { updatePassword } from '@/app/auth/actions'
import { Heart, ShieldAlert, Lock, Save } from 'lucide-react'

const initialState = {
  error: '',
}

export default function ResetPasswordPage() {
  const [state, formAction, isPending] = useActionState(updatePassword, initialState)

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl shadow-lg animate-float"
            style={{ background: 'var(--brand-green)', boxShadow: '0 8px 20px -4px rgba(31, 93, 61, 0.35)' }}
          >
            <Heart className="h-6 w-6 stroke-[2.5]" style={{ color: '#fff' }} />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Choose New Password
          </h2>
          <p className="mt-2 text-sm font-medium" style={{ color: 'var(--brand-green)' }}>
            Please enter your new password below to secure your account
          </p>
        </div>

        <div className="relative rounded-2xl glass-card p-8 shadow-2xl">
          <form action={formAction} className="space-y-6">
            {state?.error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>{state.error}</span>
              </div>
            )}

            {/* New Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-350">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500 dark:text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="block w-full rounded-xl glass-input pl-10 pr-3 py-2.5 text-sm placeholder-slate-400 dark:placeholder-slate-550 shadow-sm transition-colors"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700 dark:text-slate-350">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500 dark:text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="block w-full rounded-xl glass-input pl-10 pr-3 py-2.5 text-sm placeholder-slate-400 dark:placeholder-slate-550 shadow-sm transition-colors"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-white focus:outline-none transition-all duration-300 disabled:opacity-50 shadow-lg"
              style={{ background: 'var(--brand-green)', boxShadow: '0 4px 14px -2px rgba(31,93,61,0.4)' }}
              onMouseOver={e => !isPending && (e.currentTarget.style.background = 'var(--brand-green-hover)')}
              onMouseOut={e => (e.currentTarget.style.background = 'var(--brand-green)')}
            >
              {isPending ? (
                'Saving password...'
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
