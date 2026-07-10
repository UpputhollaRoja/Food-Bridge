'use client'

import React, { useActionState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { login, requestPasswordReset } from '@/app/auth/actions'
import { createClient } from '@/lib/supabase/client'
import { Heart, ShieldAlert, Mail, Lock, ArrowLeft, Send, Sparkles, Eye, EyeOff } from 'lucide-react'

const initialLoginState = {
  error: '',
}

const initialForgotState = {
  error: '',
  success: false,
}

function LoginFormContent() {
  const [isForgotMode, setIsForgotMode] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [loginState, loginAction, isLoginPending] = useActionState(login, initialLoginState)
  const [forgotState, forgotAction, isForgotPending] = useActionState(requestPasswordReset, initialForgotState)
  const searchParams = useSearchParams()
  const urlMessage = searchParams.get('message')
  const urlError = searchParams.get('error')

  const handleGoogleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg bg-blue-600">
            <Heart className="h-6 w-6 stroke-[2.5]" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-on-background sm:text-4xl">
            {isForgotMode ? 'Recover Password' : 'Welcome Back'}
          </h2>
          <p className="mt-2 text-sm text-primary font-medium">
            {isForgotMode 
              ? 'Request a recovery link to choose a new password' 
              : 'Log in to continue redistributing surplus food'}
          </p>
        </div>

        <div className="relative rounded-3xl bg-surface-container-lowest p-8 shadow-2xl border-2 border-outline-variant/30">
          {urlMessage && (
            <div className="mb-6 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 p-3 text-sm text-primary">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>{urlMessage}</span>
            </div>
          )}
          {urlError && (
            <div className="mb-6 flex items-center gap-2 rounded-lg border border-error/20 bg-error/10 p-3 text-sm text-error">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{urlError}</span>
            </div>
          )}

          {!isForgotMode ? (
            /* Login Form */
            <form action={loginAction} className="space-y-6">
              {loginState?.error && (
                <div className="flex items-center gap-2 rounded-lg border border-error/20 bg-error/10 p-3 text-sm text-error">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>{loginState.error}</span>
                </div>
              )}

              {/* Email Address */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-semibold text-on-surface">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-on-surface-variant">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="name@organization.com"
                    className="block w-full rounded-full bg-surface border border-outline-variant pl-10 pr-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-semibold text-on-surface">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotMode(true)}
                    className="text-xs font-semibold text-primary hover:text-surface-tint transition-colors focus:outline-none"
                  >
                    Forgot Password?
                  </button>
                </div>
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
                    className="block w-full rounded-full bg-surface border border-outline-variant pl-10 pr-10 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
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
                disabled={isLoginPending}
                className="w-full flex justify-center py-3.5 px-4 rounded-full text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:scale-100 shadow-[0_8px_16px_rgba(37,99,235,0.2)] focus:outline-none"
              >
                {isLoginPending ? 'Logging in...' : 'Log In'}
              </button>

              {/* Google Login Option */}
              <div className="relative my-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-outline-variant" />
                </div>
                <div className="relative bg-surface-container-lowest px-3 text-[10px] uppercase font-bold tracking-widest text-on-surface-variant rounded-full">
                  Or continue with
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-outline-variant rounded-full text-sm font-semibold text-on-surface bg-surface hover:bg-surface-container-low transition-all duration-300 focus:outline-none"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google</span>
              </button>
            </form>
          ) : (
            /* Forgot Password Form */
            <form action={forgotAction} className="space-y-6">
              {forgotState?.error && (
                <div className="flex items-center gap-2 rounded-lg border border-error/20 bg-error/10 p-3 text-sm text-error">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>{forgotState.error}</span>
                </div>
              )}

              {forgotState?.success && (
                <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 p-3 text-sm text-primary">
                  <Sparkles className="h-4 w-4 shrink-0" />
                  <span>Recovery link sent! Check your inbox for instructions.</span>
                </div>
              )}

              {/* Email Address */}
              <div className="space-y-1.5">
                <label htmlFor="forgot-email" className="text-sm font-semibold text-on-surface">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-on-surface-variant">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="forgot-email"
                    name="email"
                    type="email"
                    required
                    placeholder="name@organization.com"
                    className="block w-full rounded-full bg-surface border border-outline-variant pl-10 pr-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isForgotPending}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-full text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:scale-100 shadow-[0_8px_16px_rgba(37,99,235,0.2)] focus:outline-none"
              >
                {isForgotPending ? (
                  'Sending...'
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Send Recovery Link</span>
                  </>
                )}
              </button>

              {/* Back to Login */}
              <button
                type="button"
                onClick={() => setIsForgotMode(false)}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors py-2 focus:outline-none"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Log In</span>
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-xs border-t border-outline-variant pt-4">
            <span className="text-on-surface-variant">Don&apos;t have an account? </span>
            <Link
              href="/signup"
              className="font-bold text-primary hover:text-surface-tint transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background text-on-background">Loading...</div>}>
      <LoginFormContent />
    </React.Suspense>
  )
}
