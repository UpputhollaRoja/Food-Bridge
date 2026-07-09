'use client'

import React, { useActionState } from 'react'
import Link from 'next/link'
import { createDonation } from './actions'
import ImageUploader from '@/components/ImageUploader'
import LocationPickerMap from '@/components/LocationPickerMap'
import { ArrowLeft, Plus, Calendar, AlertTriangle, Info, ShieldAlert, Loader2 } from 'lucide-react'

interface DonationFormProps {
  defaultAddress: string
  defaultLat?: number
  defaultLng?: number
  verificationStatus?: string
}

export default function DonationForm({ defaultAddress, verificationStatus }: DonationFormProps) {
  const [state, formAction, isPending] = useActionState(createDonation, null)
  const [images, setImages] = React.useState<string[]>([])
  const [isUploading, setIsUploading] = React.useState(false)
  const [uploadError, setUploadError] = React.useState<string | null>(null)

  const isSubmitDisabled = isPending || isUploading || !!uploadError

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (isUploading) {
      e.preventDefault()
      alert('Please wait for the image upload to complete before submitting.')
      return
    }
    if (uploadError) {
      e.preventDefault()
      alert(`Please resolve the image upload error before submitting: ${uploadError}`)
      return
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/donor"
          className="flex h-9 w-9 items-center justify-center rounded-lg border transition-colors shadow-sm"
          style={{ borderColor: 'var(--border-hairline)', background: 'var(--bg-card)', color: 'var(--text-secondary)' }}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Create Donation</h1>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Share your surplus food with local NGOs</p>
        </div>
      </div>

      <div className="relative rounded-2xl glass-card p-8 shadow-2xl">
        <form action={formAction} onSubmit={handleSubmit} className="space-y-6">
          {state?.error && (
            <div
              className="flex items-center gap-2 rounded-lg border p-3 text-sm"
              style={{ borderColor: 'var(--urgent-bg)', background: 'var(--urgent-bg)', color: 'var(--urgent-text)' }}
            >
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          {uploadError && (
            <div
              className="flex items-center gap-2 rounded-lg border p-3 text-sm"
              style={{ borderColor: 'var(--urgent-bg)', background: 'var(--urgent-bg)', color: 'var(--urgent-text)' }}
            >
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>Image upload error: {uploadError}</span>
            </div>
          )}

          {/* Upload-in-progress notice */}
          {isUploading && (
            <div
              className="flex items-center gap-2 rounded-lg border p-3 text-sm"
              style={{ borderColor: 'var(--border-hairline)', background: 'var(--pending-bg)', color: 'var(--pending-text)' }}
            >
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
              <span>Image uploading — please wait before submitting.</span>
            </div>
          )}

          {/* Hidden Images field */}
          <input type="hidden" name="images" value={JSON.stringify(images)} />

          {/* Food Images */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Food Images</label>
            <ImageUploader
              bucket="donation-images"
              value={images}
              onChange={setImages}
              maxImages={3}
              onUploadStateChange={setIsUploading}
              onUploadError={setUploadError}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="space-y-1.5">
              <label htmlFor="title" className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Item Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                placeholder="e.g. Surplus Fresh Vegetable Salad"
                className="block w-full rounded-xl glass-input px-3 py-2.5 text-sm transition-colors"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label htmlFor="category" className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Food Category
              </label>
              <select
                id="category"
                name="category"
                required
                defaultValue=""
                className="block w-full rounded-xl glass-input px-3 py-2.5 text-sm transition-colors"
              >
                <option value="" disabled>Select category...</option>
                <option value="cooked_meals">Cooked Meals</option>
                <option value="bakery">Bakery</option>
                <option value="produce">Fresh Produce</option>
                <option value="packaged">Packaged Food</option>
                <option value="dairy">Dairy Products</option>
                <option value="beverages">Beverages</option>
                <option value="other">Other Surplus</option>
              </select>
            </div>

            {/* Quantity */}
            <div className="space-y-1.5">
              <label htmlFor="quantity" className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Quantity
              </label>
              <div className="flex gap-2">
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 15"
                  className="block w-full flex-1 rounded-xl glass-input px-3 py-2.5 text-sm transition-colors"
                />
                <input
                  id="quantityUnit"
                  name="quantityUnit"
                  type="text"
                  required
                  placeholder="e.g. kg"
                  className="block w-28 rounded-xl glass-input px-3 py-2.5 text-sm transition-colors"
                />
              </div>
            </div>

            {/* Estimated Meals */}
            <div className="space-y-1.5">
              <label htmlFor="estimatedMeals" className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Estimated Meals Served
              </label>
              <input
                id="estimatedMeals"
                name="estimatedMeals"
                type="number"
                required
                placeholder="e.g. 30"
                className="block w-full rounded-xl glass-input px-3 py-2.5 text-sm transition-colors"
              />
            </div>

            {/* Expiry At */}
            <div className="space-y-1.5">
              <label htmlFor="expiryAt" className="text-sm font-semibold flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                <Calendar className="h-3.5 w-3.5" />
                Expiry Date &amp; Time
              </label>
              <input
                id="expiryAt"
                name="expiryAt"
                type="datetime-local"
                required
                className="block w-full rounded-xl glass-input px-3 py-2.5 text-sm transition-colors"
              />
            </div>

            {/* Pickup Location */}
            <div className="space-y-1.5">
              <label htmlFor="pickupLocation" className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Pickup Address
              </label>
              <input
                id="pickupLocation"
                name="pickupLocation"
                type="text"
                required
                defaultValue={defaultAddress}
                placeholder="e.g. Suite 400, 100 Main St"
                className="block w-full rounded-xl glass-input px-3 py-2.5 text-sm transition-colors"
              />
            </div>

            {/* Pickup Window Start */}
            <div className="space-y-1.5">
              <label htmlFor="pickupWindowStart" className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Pickup Window Start
              </label>
              <input
                id="pickupWindowStart"
                name="pickupWindowStart"
                type="datetime-local"
                required
                className="block w-full rounded-xl glass-input px-3 py-2.5 text-sm transition-colors"
              />
            </div>

            {/* Pickup Window End */}
            <div className="space-y-1.5">
              <label htmlFor="pickupWindowEnd" className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Pickup Window End
              </label>
              <input
                id="pickupWindowEnd"
                name="pickupWindowEnd"
                type="datetime-local"
                required
                className="block w-full rounded-xl glass-input px-3 py-2.5 text-sm transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Storage Instructions */}
            <div className="space-y-1.5">
              <label htmlFor="storageInstructions" className="text-sm font-semibold flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                <Info className="h-3.5 w-3.5" />
                Storage Instructions
              </label>
              <textarea
                id="storageInstructions"
                name="storageInstructions"
                rows={2}
                placeholder="e.g. Keep refrigerated until collection. Transport in cooler boxes."
                className="block w-full rounded-xl glass-input px-3 py-2.5 text-sm resize-none transition-colors"
              />
            </div>

            {/* Allergen Info */}
            <div className="space-y-1.5">
              <label htmlFor="allergenInfo" className="text-sm font-semibold flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                <AlertTriangle className="h-3.5 w-3.5" style={{ color: 'var(--pending-text)' }} />
                Allergen Information
              </label>
              <input
                id="allergenInfo"
                name="allergenInfo"
                type="text"
                placeholder="e.g. Contains nuts, dairy, gluten"
                className="block w-full rounded-xl glass-input px-3 py-2.5 text-sm transition-colors"
              />
            </div>
          </div>

          {/* Submit */}
          <div title={isUploading ? 'Please wait for image upload to complete' : ''}>
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-white focus:outline-none transition-all duration-300 disabled:opacity-50 shadow-lg disabled:cursor-not-allowed"
              style={{ background: 'var(--brand-green)', boxShadow: '0 4px 14px -2px rgba(31,93,61,0.4)' }}
              onMouseOver={e => !isSubmitDisabled && (e.currentTarget.style.background = 'var(--brand-green-hover)')}
              onMouseOut={e => (e.currentTarget.style.background = 'var(--brand-green)')}
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>
                {isUploading ? 'Uploading image...' : isPending ? 'Listing food item...' : 'List Food Donation'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
