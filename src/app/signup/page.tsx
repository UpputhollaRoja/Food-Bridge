'use client'

import React, { useActionState } from 'react'
import Link from 'next/link'
import { signup } from '@/app/auth/actions'
import { createClient } from '@/lib/supabase/client'
import { Heart, Building2, ShieldAlert, Sparkles, User, Mail, Lock, Eye, EyeOff } from 'lucide-react'

function getErrorMessage(err: any): string {
  if (!err) return ''
  if (typeof err === 'string') {
    const trimmed = err.trim()
    if (trimmed === '{}' || trimmed === 'null' || trimmed === 'undefined') {
      return 'An unexpected error occurred. Please try again.'
    }
    return trimmed
  }
  if (typeof err === 'object') {
    const msg = err.message || err.error_description || err.msg || err.text || err.code || err.error
    if (msg) {
      return getErrorMessage(msg)
    }
    try {
      const s = JSON.stringify(err)
      if (s && s !== '{}') return s
    } catch {
      // ignore
    }
  }
  return String(err)
}

const initialState = {
  error: '',
}

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signup, initialState)
  const [selectedRole, setSelectedRole] = React.useState('donor')
  const [showPassword, setShowPassword] = React.useState(false)

  const handleGoogleSignup = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    })
  }

  const roleButtonStyle = (role: string) => {
    if (selectedRole === role) {
      return 'border-2 border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(0,88,190,0.12)]'
    }
    return 'border border-outline-variant bg-surface text-on-surface-variant hover:bg-surface-container-low'
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-on-primary shadow-lg shadow-primary/20">
            <Heart className="h-6 w-6 stroke-[2.5]" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-on-background sm:text-4xl">
            Create an Account
          </h2>
          <p className="mt-2 text-sm font-medium text-primary">
            Join Food Bridge and help redistribute surplus food
          </p>
        </div>

        <div className="relative rounded-3xl bg-surface-container-lowest p-8 shadow-2xl border-2 border-outline-variant/30">
          <form action={formAction} className="space-y-6">
            {getErrorMessage(state?.error) && (
              <div className="flex items-center gap-2 rounded-lg border border-error/20 bg-error/10 p-3 text-sm text-error">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>{getErrorMessage(state?.error)}</span>
              </div>
            )}

            {/* Hidden role input to bind to FormData */}
            <input type="hidden" name="role" value={selectedRole} />

            {/* Role Cards Selectors */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-on-surface">Register As</label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole('donor')}
                  className={`flex flex-col items-center justify-center rounded-xl p-3 text-center transition-all duration-200 ${roleButtonStyle('donor')}`}
                >
                  <Building2 className={`h-5 w-5 mb-1.5 ${selectedRole === 'donor' ? 'text-primary' : 'text-on-surface-variant'}`} />
                  <span className="text-xs font-semibold">Donor</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('ngo')}
                  className={`flex flex-col items-center justify-center rounded-xl p-3 text-center transition-all duration-200 ${roleButtonStyle('ngo')}`}
                >
                  <Heart className={`h-5 w-5 mb-1.5 ${selectedRole === 'ngo' ? 'text-primary' : 'text-on-surface-variant'}`} />
                  <span className="text-xs font-semibold">NGO</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('volunteer')}
                  className={`flex flex-col items-center justify-center rounded-xl p-3 text-center transition-all duration-200 ${roleButtonStyle('volunteer')}`}
                >
                  <Sparkles className={`h-5 w-5 mb-1.5 ${selectedRole === 'volunteer' ? 'text-primary' : 'text-on-surface-variant'}`} />
                  <span className="text-xs font-semibold">Volunteer</span>
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="text-sm font-semibold text-on-surface">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-on-surface-variant">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  placeholder="John Doe"
                  className="block w-full rounded-xl bg-surface border border-outline-variant pl-10 pr-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                />
              </div>
            </div>

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
                  className="block w-full rounded-xl bg-surface border border-outline-variant pl-10 pr-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-semibold text-on-surface">
                Password
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-on-primary bg-primary hover:bg-surface-tint focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 disabled:opacity-50 shadow-lg shadow-primary/20"
            >
              {isPending ? 'Signing up...' : 'Create Account'}
            </button>

            {/* Google Signup Option */}
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
              onClick={handleGoogleSignup}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-outline-variant rounded-xl text-sm font-semibold text-on-surface bg-surface hover:bg-surface-container-low transition-all duration-300 focus:outline-none"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>
          </form>

          <div className="mt-6 text-center text-xs border-t border-outline-variant pt-4">
            <span className="text-on-surface-variant">Already have an account? </span>
            <Link
              href="/login"
              className="font-bold text-primary hover:text-surface-tint transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
