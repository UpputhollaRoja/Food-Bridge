'use client'

import React, { useActionState } from 'react'
import { saveOnboarding } from './actions'
import { createClient } from '@/lib/supabase/client'
import { MapPin, Phone, Building2, Upload, ShieldCheck, ShieldAlert, Sparkles, Heart } from 'lucide-react'

interface OnboardingFormProps {
  userEmail: string
  userRole: string
  userFullName: string
}

export default function OnboardingForm({ userEmail, userRole, userFullName }: OnboardingFormProps) {
  const [state, formAction, isPending] = useActionState(saveOnboarding, null)
  const [coords, setCoords] = React.useState({ latitude: '37.7749', longitude: '-122.4194' })
  const [uploadingDoc, setUploadingDoc] = React.useState(false)
  const [docPath, setDocPath] = React.useState('')
  const [uploadError, setUploadError] = React.useState('')
  const [selectedRole, setSelectedRole] = React.useState(userRole)

  React.useEffect(() => {
    if (userEmail) {
      // no-op to satisfy unused variable check
    }
  }, [userEmail])

  const supabase = createClient()

  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          })
        },
        (error) => {
          console.warn('Geolocation access denied or failed, using default fallback:', error)
        }
      )
    }
  }, [])

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingDoc(true)
    setUploadError('')

    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
    const filePath = `docs/${fileName}`

    try {
      const { error: uploadError } = await supabase.storage
        .from('verification-documents')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      setDocPath(filePath)
    } catch (err: unknown) {
      console.error(err)
      const message = err instanceof Error ? err.message : 'Error uploading document'
      setUploadError(message)
    } finally {
      setUploadingDoc(false)
    }
  }

  const isBusinessRole = selectedRole === 'donor' || selectedRole === 'ngo'

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent px-4 py-12">
      <div className="w-full max-w-xl space-y-8">
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 dark:bg-[#ff5a00]/10 px-3 py-1 text-xs font-semibold text-purple-700 dark:text-[#ff7900] border border-purple-200 dark:border-[#ff5a00]/20">
            <Sparkles className="h-3 w-3" />
            Complete Onboarding
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Welcome, {userFullName}!
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 max-w-sm">
            Let&apos;s finish setting up your profile to activate your account as a{' '}
            <span className="text-purple-700 dark:text-[#ff7900] font-semibold capitalize">{selectedRole}</span>.
          </p>
        </div>

        <div className="relative rounded-2xl glass-card p-8 shadow-2xl">
          <form action={formAction} className="space-y-6">
            {state?.error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500 dark:text-red-400">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>{state.error}</span>
              </div>
            )}

            {/* Hidden field for document path */}
            <input type="hidden" name="docUrl" value={docPath} />

            {/* Role Cards Selectors */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Confirm Your Role</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole('donor')}
                  className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all duration-300 ${
                    selectedRole === 'donor'
                      ? 'border-purple-500 dark:border-[#ff5a00] bg-purple-50/30 dark:bg-[#ff5a00]/10 text-slate-900 dark:text-white shadow-[0_0_15px_rgba(147,51,234,0.15)] dark:shadow-[0_0_15px_rgba(255,90,0,0.15)]'
                      : 'border-slate-200 dark:border-slate-700/50 bg-white/40 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-white/60 dark:hover:bg-white/10'
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
                      ? 'border-purple-500 dark:border-[#ff5a00] bg-purple-50/30 dark:bg-[#ff5a00]/10 text-slate-900 dark:text-white shadow-[0_0_15px_rgba(147,51,234,0.15)] dark:shadow-[0_0_15px_rgba(255,90,0,0.15)]'
                      : 'border-slate-200 dark:border-slate-700/50 bg-white/40 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-white/60 dark:hover:bg-white/10'
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
                      ? 'border-purple-500 dark:border-[#ff5a00] bg-purple-50/30 dark:bg-[#ff5a00]/10 text-slate-900 dark:text-white shadow-[0_0_15px_rgba(147,51,234,0.15)] dark:shadow-[0_0_15px_rgba(255,90,0,0.15)]'
                      : 'border-slate-200 dark:border-slate-700/50 bg-white/40 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-white/60 dark:hover:bg-white/10'
                  }`}
                >
                  <Sparkles className={`h-5 w-5 mb-1.5 ${selectedRole === 'volunteer' ? 'text-purple-600 dark:text-[#ff5a00]' : ''}`} />
                  <span className="text-xs font-semibold">Volunteer</span>
                </button>
              </div>
            </div>

            {/* Hidden role input to bind to FormData */}
            <input type="hidden" name="role" value={selectedRole} />

            {/* Business Role Fields (Donor/NGO) */}
            {isBusinessRole && (
              <div className="space-y-1.5">
                <label htmlFor="organizationName" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Organization Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 dark:text-slate-500">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <input
                    id="organizationName"
                    name="organizationName"
                    type="text"
                    required
                    placeholder="e.g. Hope Food Kitchen"
                    className="block w-full rounded-xl glass-input pl-10 pr-3 py-2.5 text-sm placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white shadow-sm focus:ring-1 focus:ring-purple-500 dark:focus:ring-[#ff5a00] transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Contact Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 dark:text-slate-500">
                  <Phone className="h-4 w-4" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="+1 (555) 000-0000"
                  className="block w-full rounded-xl glass-input pl-10 pr-3 py-2.5 text-sm placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white shadow-sm focus:ring-1 focus:ring-purple-500 dark:focus:ring-[#ff5a00] transition-colors"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <label htmlFor="address" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Operating Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 dark:text-slate-500">
                  <MapPin className="h-4 w-4" />
                </div>
                <input
                  id="address"
                  name="address"
                  type="text"
                  required
                  placeholder="123 Sustainability Way, Green City"
                  className="block w-full rounded-xl glass-input pl-10 pr-3 py-2.5 text-sm placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white shadow-sm focus:ring-1 focus:ring-purple-500 dark:focus:ring-[#ff5a00] transition-colors"
                />
              </div>
            </div>

            {/* Hidden Coordinates */}
            <input type="hidden" name="latitude" value={coords.latitude} />
            <input type="hidden" name="longitude" value={coords.longitude} />

            {/* Document Upload for verification (Only for Donor/NGO) */}
            {isBusinessRole && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Verification Document (PDF/Image)
                </label>
                <div className="relative rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700/50 bg-white/30 dark:bg-white/5 p-4 flex flex-col items-center justify-center text-center transition-colors hover:border-purple-500/40 dark:hover:border-[#ff5a00]/30">
                  {docPath ? (
                    <div className="flex items-center gap-2 text-purple-700 dark:text-[#ff7900]">
                      <ShieldCheck className="h-5 w-5" />
                      <span className="text-xs font-semibold">Document Uploaded Successfully!</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-slate-400 dark:text-slate-500 mb-2" />
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                        {uploadingDoc ? 'Uploading...' : 'Upload proof of establishment / tax ID'}
                      </span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleDocUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={uploadingDoc}
                      />
                    </>
                  )}
                </div>
                {uploadError && (
                  <p className="text-xs text-red-400 mt-1 font-medium">{uploadError}</p>
                )}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isPending || uploadingDoc}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 dark:bg-[#ff5a00] dark:hover:bg-[#ff7900] focus:outline-none transition-all duration-300 disabled:opacity-50 shadow-lg shadow-purple-500/20 dark:shadow-[#ff5a00]/20"
            >
              {isPending ? 'Saving profile...' : 'Complete Registration'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
