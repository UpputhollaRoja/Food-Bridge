'use client'

import React, { useActionState } from 'react'
import { updatePassword } from '@/app/auth/actions'
import { Heart, ShieldAlert, Lock, Save, Eye, EyeOff } from 'lucide-react'

const initialState = {
  error: '',
}

export default function ResetPasswordPage() {
  const [state, formAction, isPending] = useActionState(updatePassword, initialState)
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-on-primary shadow-lg shadow-primary/20">
            <Heart className="h-6 w-6 stroke-[2.5]" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-on-background sm:text-4xl">
            Choose New Password
          </h2>
          <p className="mt-2 text-sm text-primary font-medium">
            Please enter your new password below to secure your account
          </p>
        </div>

        <div className="relative rounded-3xl bg-surface-container-lowest p-8 shadow-2xl border-2 border-outline-variant/30">
          <form action={formAction} className="space-y-6">
            {state?.error && (
              <div className="flex items-center gap-2 rounded-lg border border-error/20 bg-error/10 p-3 text-sm text-error">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>{state.error}</span>
              </div>
            )}

            {/* New Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-semibold text-on-surface">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-on-surface-variant">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="block w-full rounded-xl bg-surface border border-outline-variant pl-10 pr-10 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-semibold text-on-surface">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-on-surface-variant">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="block w-full rounded-xl bg-surface border border-outline-variant pl-10 pr-10 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-on-primary bg-primary hover:bg-surface-tint focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 disabled:opacity-50 shadow-lg shadow-primary/20"
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
