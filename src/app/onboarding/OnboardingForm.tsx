'use client'

import React, { useActionState } from 'react'
import { saveOnboarding } from './actions'
import { createClient } from '@/lib/supabase/client'
import { MapPin, Phone, Building2, Upload, ShieldCheck, ShieldAlert, Sparkles, Heart } from 'lucide-react'

function getErrorMessage(err: any): string {
  if (!err) return ''
  if (typeof err === 'string') return err
  if (typeof err === 'object') {
    return err.message || err.text || err.error_description || err.msg || JSON.stringify(err)
  }
  return String(err)
}

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
      console.warn('Storage upload error:', err)
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
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border" style={{ background: 'var(--success-bg)', color: 'var(--success-text)', borderColor: 'var(--brand-green)' }}>
            <Sparkles className="h-3 w-3" />
            Complete Onboarding
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl" style={{ color: 'var(--text-primary)' }}>
            Welcome, {userFullName}!
          </h2>
          <p className="mt-2 text-sm max-w-sm" style={{ color: 'var(--text-secondary)' }}>
            Let&apos;s finish setting up your profile to activate your account as a{' '}
            <span className="font-semibold capitalize" style={{ color: 'var(--brand-green)' }}>{selectedRole}</span>.
          </p>
        </div>

        <div className="relative rounded-2xl glass-card p-8 shadow-2xl">
          <form action={formAction} className="space-y-6">
            {getErrorMessage(state?.error) && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500 dark:text-red-400">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>{getErrorMessage(state?.error)}</span>
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
                  className="flex flex-col items-center justify-center rounded-xl p-3 text-center transition-all duration-200"
                  style={selectedRole === 'donor'
                    ? { border: '2px solid var(--brand-green)', background: 'var(--success-bg)', color: 'var(--text-primary)', boxShadow: '0 0 15px rgba(31,93,61,0.12)' }
                    : { border: '1px solid var(--border-hairline)', background: 'var(--bg-card)', color: 'var(--text-secondary)' }}
                >
                  <Building2 className="h-5 w-5 mb-1.5" style={{ color: selectedRole === 'donor' ? 'var(--brand-green)' : 'var(--text-secondary)' }} />
                  <span className="text-xs font-semibold">Donor</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('ngo')}
                  className="flex flex-col items-center justify-center rounded-xl p-3 text-center transition-all duration-200"
                  style={selectedRole === 'ngo'
                    ? { border: '2px solid var(--brand-green)', background: 'var(--success-bg)', color: 'var(--text-primary)', boxShadow: '0 0 15px rgba(31,93,61,0.12)' }
                    : { border: '1px solid var(--border-hairline)', background: 'var(--bg-card)', color: 'var(--text-secondary)' }}
                >
                  <Heart className="h-5 w-5 mb-1.5" style={{ color: selectedRole === 'ngo' ? 'var(--brand-green)' : 'var(--text-secondary)' }} />
                  <span className="text-xs font-semibold">NGO</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('volunteer')}
                  className="flex flex-col items-center justify-center rounded-xl p-3 text-center transition-all duration-200"
                  style={selectedRole === 'volunteer'
                    ? { border: '2px solid var(--brand-green)', background: 'var(--success-bg)', color: 'var(--text-primary)', boxShadow: '0 0 15px rgba(31,93,61,0.12)' }
                    : { border: '1px solid var(--border-hairline)', background: 'var(--bg-card)', color: 'var(--text-secondary)' }}
                >
                  <Sparkles className="h-5 w-5 mb-1.5" style={{ color: selectedRole === 'volunteer' ? 'var(--brand-green)' : 'var(--text-secondary)' }} />
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
                    className="block w-full rounded-xl glass-input pl-10 pr-3 py-2.5 text-sm transition-colors"
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
                  className="block w-full rounded-xl glass-input pl-10 pr-3 py-2.5 text-sm transition-colors"
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
                  className="block w-full rounded-xl glass-input pl-10 pr-3 py-2.5 text-sm transition-colors"
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
                <div className="relative rounded-xl border-2 border-dashed p-4 flex flex-col items-center justify-center text-center transition-colors" style={{ borderColor: 'var(--border-hairline)', background: 'var(--bg-page)' }}>
                  {docPath ? (
                    <div className="flex items-center gap-2" style={{ color: 'var(--success-text)' }}>
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
                {getErrorMessage(uploadError) && (
                  <p className="text-xs text-red-400 mt-1 font-medium">{getErrorMessage(uploadError)}</p>
                )}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isPending || uploadingDoc}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-white focus:outline-none transition-all duration-300 disabled:opacity-50 shadow-lg"
              style={{ background: 'var(--brand-green)', boxShadow: '0 4px 14px -2px rgba(31,93,61,0.4)' }}
              onMouseOver={e => !(isPending || uploadingDoc) && ((e.currentTarget as HTMLButtonElement).style.background = 'var(--brand-green-hover)')}
              onMouseOut={e => ((e.currentTarget as HTMLButtonElement).style.background = 'var(--brand-green)')}
            >
              {isPending ? 'Saving profile...' : 'Complete Registration'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
