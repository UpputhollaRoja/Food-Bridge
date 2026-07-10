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
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute top-[60%] -right-[10%] w-[30%] h-[50%] rounded-full bg-tertiary/5 blur-3xl"></div>
      </div>
      <div className="w-full max-w-xl space-y-8 z-10">
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border border-primary/20 bg-primary/10 text-primary">
            <Sparkles className="h-3 w-3" />
            Complete Onboarding
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-on-background sm:text-4xl">
            Welcome, {userFullName}!
          </h2>
          <p className="mt-2 text-sm max-w-sm text-on-surface-variant">
            Let&apos;s finish setting up your profile to activate your account as a{' '}
            <span className="font-semibold capitalize text-primary">{selectedRole}</span>.
          </p>
        </div>

        <div className="relative rounded-3xl bg-surface-container-lowest border-2 border-outline-variant/30 p-8 sm:p-10 shadow-2xl">
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
              <label className="text-sm font-semibold text-on-surface">Confirm Your Role</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole('donor')}
                  className={`flex flex-col items-center justify-center rounded-xl p-3 text-center transition-all duration-200 ${selectedRole === 'donor' ? 'border-2 border-primary bg-primary/10 text-primary shadow-md shadow-primary/20' : 'border border-outline-variant bg-surface text-on-surface-variant hover:bg-surface-container-low'}`}
                >
                  <Building2 className={`h-5 w-5 mb-1.5 ${selectedRole === 'donor' ? 'text-primary' : 'text-on-surface-variant'}`} />
                  <span className="text-xs font-bold">Donor</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('ngo')}
                  className={`flex flex-col items-center justify-center rounded-xl p-3 text-center transition-all duration-200 ${selectedRole === 'ngo' ? 'border-2 border-primary bg-primary/10 text-primary shadow-md shadow-primary/20' : 'border border-outline-variant bg-surface text-on-surface-variant hover:bg-surface-container-low'}`}
                >
                  <Heart className={`h-5 w-5 mb-1.5 ${selectedRole === 'ngo' ? 'text-primary' : 'text-on-surface-variant'}`} />
                  <span className="text-xs font-bold">NGO</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('volunteer')}
                  className={`flex flex-col items-center justify-center rounded-xl p-3 text-center transition-all duration-200 ${selectedRole === 'volunteer' ? 'border-2 border-primary bg-primary/10 text-primary shadow-md shadow-primary/20' : 'border border-outline-variant bg-surface text-on-surface-variant hover:bg-surface-container-low'}`}
                >
                  <Sparkles className={`h-5 w-5 mb-1.5 ${selectedRole === 'volunteer' ? 'text-primary' : 'text-on-surface-variant'}`} />
                  <span className="text-xs font-bold">Volunteer</span>
                </button>
              </div>
            </div>

            {/* Hidden role input to bind to FormData */}
            <input type="hidden" name="role" value={selectedRole} />

            {/* Business Role Fields (Donor/NGO) */}
            {isBusinessRole && (
              <div className="space-y-1.5">
                <label htmlFor="organizationName" className="text-sm font-semibold text-on-surface">
                  Organization Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-on-surface-variant">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <input
                    id="organizationName"
                    name="organizationName"
                    type="text"
                    required
                    placeholder="e.g. Hope Food Kitchen"
                    className="block w-full rounded-xl bg-surface border border-outline-variant pl-10 pr-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-sm font-semibold text-on-surface">
                Contact Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-on-surface-variant">
                  <Phone className="h-4 w-4" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="+1 (555) 000-0000"
                  className="block w-full rounded-xl bg-surface border border-outline-variant pl-10 pr-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <label htmlFor="address" className="text-sm font-semibold text-on-surface">
                Operating Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-on-surface-variant">
                  <MapPin className="h-4 w-4" />
                </div>
                <input
                  id="address"
                  name="address"
                  type="text"
                  required
                  placeholder="123 Sustainability Way, Green City"
                  className="block w-full rounded-xl bg-surface border border-outline-variant pl-10 pr-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                />
              </div>
            </div>

            {/* Hidden Coordinates */}
            <input type="hidden" name="latitude" value={coords.latitude} />
            <input type="hidden" name="longitude" value={coords.longitude} />

            {/* Document Upload for verification (Only for Donor/NGO) */}
            {isBusinessRole && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-on-surface">
                  Verification Document (PDF/Image)
                </label>
                <div className="relative rounded-xl border-2 border-dashed border-outline-variant bg-surface p-4 flex flex-col items-center justify-center text-center transition-colors hover:bg-surface-container-low">
                  {docPath ? (
                    <div className="flex items-center gap-2 text-primary">
                      <ShieldCheck className="h-5 w-5" />
                      <span className="text-xs font-bold">Document Uploaded Successfully!</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-on-surface-variant mb-2" />
                      <span className="text-xs font-medium text-on-surface-variant mb-1">
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
                  <p className="text-xs text-error mt-1 font-medium">{getErrorMessage(uploadError)}</p>
                )}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isPending || uploadingDoc}
              className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-on-primary bg-primary hover:bg-surface-tint active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:scale-100 shadow-md hover:shadow-lg"
            >
              {isPending ? 'Saving profile...' : 'Complete Registration'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
