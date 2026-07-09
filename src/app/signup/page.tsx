'use client'

import React, { useActionState } from 'react'
import Link from 'next/link'
import { signup } from '@/app/auth/actions'
import { createClient } from '@/lib/supabase/client'
import { Heart, Building2, ShieldAlert, Sparkles, User, Mail, Lock } from 'lucide-react'

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

  const handleGoogleSignup = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    })
  }

  const roleButtonStyle = (role: string) =>
    selectedRole === role
      ? {
          border: '2px solid var(--brand-green)',
          background: 'var(--success-bg)',
          color: 'var(--text-primary)',
          boxShadow: '0 0 15px rgba(31,93,61,0.12)',
        }
      : {
          border: '1px solid var(--border-hairline)',
          background: 'var(--bg-card)',
          color: 'var(--text-secondary)',
        }

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8">
        <div className="flex flex-col items-center text-center">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl shadow-lg animate-float"
            style={{ background: 'var(--brand-green)', boxShadow: '0 8px 20px -4px rgba(31, 93, 61, 0.35)' }}
          >
            <Heart className="h-6 w-6 stroke-[2.5]" style={{ color: '#fff' }} />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl gradient-text-pink-purple">
            Create an Account
          </h2>
          <p className="mt-2 text-sm font-medium" style={{ color: 'var(--brand-green)' }}>
            Join Food Bridge and help redistribute surplus food
          </p>
        </div>

        <div className="relative rounded-2xl glass-card p-8 shadow-2xl">
          <form action={formAction} className="space-y-6">
            {getErrorMessage(state?.error) && (
              <div
                className="flex items-center gap-2 rounded-lg border p-3 text-sm"
                style={{ borderColor: 'var(--urgent-bg)', background: 'var(--urgent-bg)', color: 'var(--urgent-text)' }}
              >
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>{getErrorMessage(state?.error)}</span>
              </div>
            )}

            {/* Hidden role input to bind to FormData */}
            <input type="hidden" name="role" value={selectedRole} />

            {/* Role Cards Selectors */}
            <div className="space-y-2">
              <label className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Register As</label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole('donor')}
                  className="flex flex-col items-center justify-center rounded-xl p-3 text-center transition-all duration-200"
                  style={roleButtonStyle('donor')}
                >
                  <Building2 className="h-5 w-5 mb-1.5" style={{ color: selectedRole === 'donor' ? 'var(--brand-green)' : 'var(--text-secondary)' }} />
                  <span className="text-xs font-semibold">Donor</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('ngo')}
                  className="flex flex-col items-center justify-center rounded-xl p-3 text-center transition-all duration-200"
                  style={roleButtonStyle('ngo')}
                >
                  <Heart className="h-5 w-5 mb-1.5" style={{ color: selectedRole === 'ngo' ? 'var(--brand-green)' : 'var(--text-secondary)' }} />
                  <span className="text-xs font-semibold">NGO</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('volunteer')}
                  className="flex flex-col items-center justify-center rounded-xl p-3 text-center transition-all duration-200"
                  style={roleButtonStyle('volunteer')}
                >
                  <Sparkles className="h-5 w-5 mb-1.5" style={{ color: selectedRole === 'volunteer' ? 'var(--brand-green)' : 'var(--text-secondary)' }} />
                  <span className="text-xs font-semibold">Volunteer</span>
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none" style={{ color: 'var(--text-secondary)' }}>
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  placeholder="John Doe"
                  className="block w-full rounded-xl glass-input pl-10 pr-3 py-2.5 text-sm shadow-sm transition-colors"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none" style={{ color: 'var(--text-secondary)' }}>
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="name@organization.com"
                  className="block w-full rounded-xl glass-input pl-10 pr-3 py-2.5 text-sm shadow-sm transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none" style={{ color: 'var(--text-secondary)' }}>
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="block w-full rounded-xl glass-input pl-10 pr-3 py-2.5 text-sm shadow-sm transition-colors"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-white focus:outline-none transition-all duration-300 disabled:opacity-50 shadow-lg"
              style={{ background: 'var(--brand-green)', boxShadow: '0 4px 14px -2px rgba(31,93,61,0.4)' }}
              onMouseOver={e => !isPending && (e.currentTarget.style.background = 'var(--brand-green-hover)')}
              onMouseOut={e => (e.currentTarget.style.background = 'var(--brand-green)')}
            >
              {isPending ? 'Signing up...' : 'Create Account'}
            </button>

            {/* Google Signup Option */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: 'var(--border-hairline)' }} />
              </div>
              <div className="relative px-3 text-[10px] uppercase font-bold tracking-widest rounded-full" style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}>
                Or continue with
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignup}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-300 focus:outline-none"
              style={{ border: '1px solid var(--border-hairline)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
              onMouseOver={e => (e.currentTarget.style.background = 'var(--success-bg)')}
              onMouseOut={e => (e.currentTarget.style.background = 'var(--bg-card)')}
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

          <div className="mt-6 text-center text-xs">
            <span style={{ color: 'var(--text-secondary)' }}>Already have an account? </span>
            <Link
              href="/login"
              className="font-bold transition-colors"
              style={{ color: 'var(--brand-green)' }}
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
