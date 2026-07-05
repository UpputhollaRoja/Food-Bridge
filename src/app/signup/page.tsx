'use client'

import React, { useActionState } from 'react'
import Link from 'next/link'
import { signup } from '@/app/auth/actions'
import { createClient } from '@/lib/supabase/client'
import { Heart, Building2, ShieldAlert, Sparkles, User, Mail, Lock } from 'lucide-react'

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

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-fuchsia-500 shadow-lg shadow-purple-500/20">
            <Heart className="h-6 w-6 text-neutral-950 stroke-[2.5]" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Create an Account
          </h2>
          <p className="mt-2 text-sm text-purple-700 dark:text-purple-400 font-medium">
            Join Food Bridge and help redistribute surplus food
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

            {/* Hidden role input to bind to FormData */}
            <input type="hidden" name="role" value={selectedRole} />

            {/* Role Cards Selectors */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Register As</label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole('donor')}
                  className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all duration-300 ${
                    selectedRole === 'donor'
                      ? 'border-purple-500 dark:border-[#ff5a00] bg-purple-500/15 dark:bg-[#ff5a00]/10 text-slate-900 dark:text-white shadow-[0_0_15px_rgba(168,85,247,0.1)] dark:shadow-[0_0_15px_rgba(255,90,0,0.15)]'
                      : 'border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white/60 dark:hover:bg-white/10'
                  }`}
                >
                  <Building2 className={`h-5 w-5 mb-1.5 ${selectedRole === 'donor' ? 'text-purple-600 dark:text-[#ff5a00]' : ''}`} />
                  <span className="text-xs font-semibold">Donor</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('ngo')}
                  className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all duration-300 ${
                    selectedRole === 'ngo'
                      ? 'border-purple-500 dark:border-[#ff5a00] bg-purple-500/15 dark:bg-[#ff5a00]/10 text-slate-900 dark:text-white shadow-[0_0_15px_rgba(168,85,247,0.1)] dark:shadow-[0_0_15px_rgba(255,90,0,0.15)]'
                      : 'border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white/60 dark:hover:bg-white/10'
                  }`}
                >
                  <Heart className={`h-5 w-5 mb-1.5 ${selectedRole === 'ngo' ? 'text-purple-600 dark:text-[#ff5a00]' : ''}`} />
                  <span className="text-xs font-semibold">NGO</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('volunteer')}
                  className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all duration-300 ${
                    selectedRole === 'volunteer'
                      ? 'border-purple-500 dark:border-[#ff5a00] bg-purple-500/15 dark:bg-[#ff5a00]/10 text-slate-900 dark:text-white shadow-[0_0_15px_rgba(168,85,247,0.1)] dark:shadow-[0_0_15px_rgba(255,90,0,0.15)]'
                      : 'border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white/60 dark:hover:bg-white/10'
                  }`}
                >
                  <Sparkles className={`h-5 w-5 mb-1.5 ${selectedRole === 'volunteer' ? 'text-purple-600 dark:text-[#ff5a00]' : ''}`} />
                  <span className="text-xs font-semibold">Volunteer</span>
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500 dark:text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  placeholder="John Doe"
                  className="block w-full rounded-xl glass-input pl-10 pr-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 shadow-sm focus:ring-1 focus:ring-purple-500 dark:focus:ring-[#ff5a00] transition-colors"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500 dark:text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="name@organization.com"
                  className="block w-full rounded-xl glass-input pl-10 pr-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 shadow-sm focus:ring-1 focus:ring-purple-500 dark:focus:ring-[#ff5a00] transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Password
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
                  className="block w-full rounded-xl glass-input pl-10 pr-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 shadow-sm focus:ring-1 focus:ring-purple-500 dark:focus:ring-[#ff5a00] transition-colors"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 dark:bg-[#ff5a00] dark:hover:bg-[#ff7900] focus:outline-none transition-all duration-300 disabled:opacity-50 shadow-lg shadow-purple-500/20 dark:shadow-[#ff5a00]/20"
            >
              {isPending ? 'Signing up...' : 'Create Account'}
            </button>

            {/* Google Signup Option */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative bg-white/90 dark:bg-[#060b08]/90 px-3 text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400 rounded-full">
                Or continue with
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignup}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300 focus:outline-none"
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

          <div className="mt-6 text-center text-xs">
            <span className="text-slate-500 dark:text-slate-400">Already have an account? </span>
            <Link
              href="/login"
              className="font-bold text-purple-600 hover:text-purple-500 transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
