'use client'

import React, { useActionState } from 'react'
import { saveOnboarding } from './actions'
import LocationPicker from '@/components/LocationPicker'
import { createClient } from '@/lib/supabase/client'
import { MapPin, Phone, Building2, Upload, ShieldCheck, ShieldAlert, Sparkles, Heart } from 'lucide-react'
import { generateAndSaveUserKeys } from '@/lib/keys'
import type { KeyPair } from '@/lib/keys'
import { encryptForSelf } from '@/lib/crypto'

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
  const [coords, setCoords] = React.useState({ latitude: '37.7749', longitude: '-122.4194', address: '' })
  const [uploadingDoc, setUploadingDoc] = React.useState(false)
  const [docPath, setDocPath] = React.useState('')
  const [uploadError, setUploadError] = React.useState('')
  const [selectedRole, setSelectedRole] = React.useState(userRole)
  const [keys, setKeys] = React.useState<KeyPair | null>(null)
  const [volunteerAddress, setVolunteerAddress] = React.useState('')

  React.useEffect(() => {
    if (userEmail) {
      generateAndSaveUserKeys(userEmail).then((k) => setKeys(k))
    }
  }, [userEmail])

  const supabase = createClient()

  const isBusinessRole = selectedRole === 'donor' || selectedRole === 'ngo'

  // Geolocation is now handled by LocationPicker for business roles.
  // For volunteers, we can just leave default SF coords or let them use LocationPicker if we want,
  // but for now we follow the user requirement: "from ngo live location and make it fixed"
  React.useEffect(() => {
    if (!isBusinessRole && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          }))
        },
        (error) => {
          console.warn('Geolocation access denied or failed, using default fallback:', error)
        }
      )
    }
  }, [isBusinessRole])

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



  const handleFormSubmit = (formData: FormData) => {
    if (keys) {
      const phone = formData.get('phone') as string || ''
      const address = formData.get('address') as string || ''
      const docUrl = formData.get('docUrl') as string || ''

      const payload = JSON.stringify({ phone, address, docUrl })
      const encrypted = encryptForSelf(payload, keys.secretKey, keys.publicKey)
      
      formData.set('encrypted_data', JSON.stringify(encrypted))
      formData.set('public_key', keys.publicKey)
    }
    
    // Proceed with the server action wrapped in a transition to allow Next.js redirects to work
    React.startTransition(() => {
      formAction(formData)
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 blur-3xl"></div>
        <div className="absolute top-[60%] -right-[10%] w-[30%] h-[50%] rounded-full bg-blue-100/30 blur-3xl"></div>
      </div>
      <div className="w-full max-w-lg space-y-8 z-10">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-800">
            Welcome, {userFullName}!
          </h2>
          <p className="mt-3 text-sm max-w-sm text-slate-500">
            Let&apos;s finish setting up your profile to activate your account as a{' '}
            <span className="font-bold capitalize text-slate-800">{selectedRole}</span>.
          </p>
        </div>

        <div className="relative rounded-[2rem] bg-white p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <form action={handleFormSubmit} className="space-y-6">
            {getErrorMessage(state?.error) && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500 dark:text-red-400">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>{getErrorMessage(state?.error)}</span>
              </div>
            )}

            {/* Hidden field for document path */}
            <input type="hidden" name="docUrl" value={docPath} />

            {/* Role Cards Selectors */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700">Confirm Your Role</label>
              <div className="flex rounded-full border border-slate-200 bg-white p-1">
                <button
                  type="button"
                  onClick={() => setSelectedRole('donor')}
                  className={`flex flex-1 flex-col items-center justify-center rounded-full py-2.5 transition-all duration-300 ${selectedRole === 'donor' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  <Building2 className="h-5 w-5 mb-1" />
                  <span className="text-[11px] font-bold">Donor</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('ngo')}
                  className={`flex flex-1 flex-col items-center justify-center rounded-full py-2.5 transition-all duration-300 ${selectedRole === 'ngo' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  <Heart className="h-5 w-5 mb-1" />
                  <span className="text-[11px] font-bold">NGO</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('volunteer')}
                  className={`flex flex-1 flex-col items-center justify-center rounded-full py-2.5 transition-all duration-300 ${selectedRole === 'volunteer' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  <Sparkles className="h-5 w-5 mb-1" />
                  <span className="text-[11px] font-bold">Volunteer</span>
                </button>
              </div>
            </div>

            {/* Hidden role input to bind to FormData */}
            <input type="hidden" name="role" value={selectedRole} />

            {/* Business Role Fields (Donor/NGO) */}
            {isBusinessRole && (
              <div className="space-y-1.5">
                <label htmlFor="organizationName" className="text-sm font-bold text-slate-700">
                  Organization Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <input
                    id="organizationName"
                    name="organizationName"
                    type="text"
                    required
                    placeholder="e.g. Hope Food Kitchen"
                    className="block w-full rounded-xl bg-slate-50 border-0 py-3 pl-10 pr-4 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>
            )}

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-sm font-bold text-slate-700">
                Contact Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Phone className="h-4 w-4" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="+1 (555) 000-0000"
                  className="block w-full rounded-xl bg-slate-50 border-0 py-3 pl-10 pr-4 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <label htmlFor="address" className="text-sm font-bold text-slate-700">
                Operating Address / Location
              </label>
              
              {isBusinessRole ? (
                <div className="mt-2">
                  <LocationPicker 
                    label="Organization Location" 
                    onChange={(loc) => {
                      setCoords({
                        latitude: loc.lat.toString(),
                        longitude: loc.lng.toString(),
                        address: loc.address
                      })
                    }} 
                  />
                  {/* Hidden input to pass address for business roles since they don't type it */}
                  <input type="hidden" name="address" value={coords.address} />
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    required
                    placeholder="123 Sustainability Way, Green City"
                    value={volunteerAddress}
                    onChange={(e) => setVolunteerAddress(e.target.value)}
                    className="block w-full rounded-xl bg-slate-50 border-0 py-3 pl-10 pr-4 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
              )}
            </div>

            {/* Hidden Coordinates */}
            <input type="hidden" name="latitude" value={coords.latitude} />
            <input type="hidden" name="longitude" value={coords.longitude} />

            {/* Document Upload for verification (Only for Donor/NGO) */}
            {isBusinessRole && (
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">
                  Verification Document (PDF/Image)
                </label>
                <div className="relative rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 flex flex-col items-center justify-center text-center transition-colors hover:bg-slate-100 cursor-pointer">
                  {docPath ? (
                    <div className="flex items-center gap-2 text-blue-600">
                      <ShieldCheck className="h-5 w-5" />
                      <span className="text-xs font-bold">Document Uploaded Successfully!</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-slate-400 mb-2" />
                      <span className="text-xs font-medium text-slate-500 mb-1">
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
                  <p className="text-xs text-red-500 mt-1 font-medium">{getErrorMessage(uploadError)}</p>
                )}
              </div>
            )}

            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending || uploadingDoc}
                className="w-full flex justify-center py-3.5 px-4 rounded-full text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'Saving profile...' : 'Complete Registration'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
