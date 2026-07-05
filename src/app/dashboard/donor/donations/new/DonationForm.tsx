'use client'

import React, { useActionState } from 'react'
import Link from 'next/link'
import { createDonation } from './actions'
import ImageUploader from '@/components/ImageUploader'
import LocationPickerMap from '@/components/LocationPickerMap'
import { ArrowLeft, Plus, Calendar, AlertTriangle, Info, ShieldAlert } from 'lucide-react'

interface DonationFormProps {
  defaultAddress: string
  defaultLat?: number
  defaultLng?: number
}

export default function DonationForm({ defaultAddress }: DonationFormProps) {
  const [state, formAction, isPending] = useActionState(createDonation, null)
  const [images, setImages] = React.useState<string[]>([])

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/donor"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white/50 text-slate-600 hover:text-slate-900 hover:bg-white/80 transition-colors shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create Donation</h1>
          <p className="text-xs text-slate-550">Share your surplus food with local NGOs</p>
        </div>
      </div>

      <div className="relative rounded-2xl glass-card p-8 shadow-2xl">
        <form action={formAction} className="space-y-6">
          {state?.error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          {/* Hidden Images field */}
          <input type="hidden" name="images" value={JSON.stringify(images)} />

          {/* Food Images */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Food Images</label>
            <ImageUploader bucket="donation-images" value={images} onChange={setImages} maxImages={3} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="space-y-1.5">
              <label htmlFor="title" className="text-sm font-semibold text-slate-700">
                Item Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                placeholder="e.g. Surplus Fresh Vegetable Salad"
                className="block w-full rounded-xl glass-input px-3 py-2.5 text-sm placeholder-slate-400 focus:ring-1 focus:ring-purple-550 transition-colors"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label htmlFor="category" className="text-sm font-semibold text-slate-700">
                Food Category
              </label>
              <select
                id="category"
                name="category"
                required
                defaultValue=""
                className="block w-full rounded-xl glass-input px-3 py-2.5 text-sm focus:ring-1 focus:ring-purple-550 transition-colors"
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
              <label htmlFor="quantity" className="text-sm font-semibold text-slate-700">
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
                  className="block w-full flex-1 rounded-xl glass-input px-3 py-2.5 text-sm placeholder-slate-400 focus:ring-1 focus:ring-purple-550 transition-colors"
                />
                <input
                  id="quantityUnit"
                  name="quantityUnit"
                  type="text"
                  required
                  placeholder="e.g. kg or servings"
                  className="block w-28 rounded-xl glass-input px-3 py-2.5 text-sm placeholder-slate-400 focus:ring-1 focus:ring-purple-550 transition-colors"
                />
              </div>
            </div>

            {/* Estimated Meals */}
            <div className="space-y-1.5">
              <label htmlFor="estimatedMeals" className="text-sm font-semibold text-slate-700">
                Estimated Meals Served
              </label>
              <input
                id="estimatedMeals"
                name="estimatedMeals"
                type="number"
                required
                placeholder="e.g. 30"
                className="block w-full rounded-xl glass-input px-3 py-2.5 text-sm placeholder-slate-400 focus:ring-1 focus:ring-purple-550 transition-colors"
              />
            </div>

            {/* Expiry At */}
            <div className="space-y-1.5">
              <label htmlFor="expiryAt" className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Expiry Date & Time
              </label>
              <input
                id="expiryAt"
                name="expiryAt"
                type="datetime-local"
                required
                className="block w-full rounded-xl glass-input px-3 py-2.5 text-sm focus:ring-1 focus:ring-purple-550 transition-colors"
              />
            </div>

            {/* Pickup Location */}
            <div className="space-y-1.5">
              <label htmlFor="pickupLocation" className="text-sm font-semibold text-slate-700">
                Pickup Address
              </label>
              <input
                id="pickupLocation"
                name="pickupLocation"
                type="text"
                required
                defaultValue={defaultAddress}
                placeholder="e.g. Suite 400, 100 Main St"
                className="block w-full rounded-xl glass-input px-3 py-2.5 text-sm placeholder-slate-400 focus:ring-1 focus:ring-purple-550 transition-colors"
              />
            </div>

            {/* Pickup Window Start */}
            <div className="space-y-1.5">
              <label htmlFor="pickupWindowStart" className="text-sm font-semibold text-slate-700">
                Pickup Window Start
              </label>
              <input
                id="pickupWindowStart"
                name="pickupWindowStart"
                type="datetime-local"
                required
                className="block w-full rounded-xl glass-input px-3 py-2.5 text-sm focus:ring-1 focus:ring-purple-550 transition-colors"
              />
            </div>

            {/* Pickup Window End */}
            <div className="space-y-1.5">
              <label htmlFor="pickupWindowEnd" className="text-sm font-semibold text-slate-700">
                Pickup Window End
              </label>
              <input
                id="pickupWindowEnd"
                name="pickupWindowEnd"
                type="datetime-local"
                required
                className="block w-full rounded-xl glass-input px-3 py-2.5 text-sm focus:ring-1 focus:ring-purple-550 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Storage Instructions */}
            <div className="space-y-1.5">
              <label htmlFor="storageInstructions" className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                <Info className="h-3.5 w-3.5" />
                Storage Instructions
              </label>
              <textarea
                id="storageInstructions"
                name="storageInstructions"
                rows={2}
                placeholder="e.g. Keep refrigerated until collection. Transport in cooler boxes."
                className="block w-full rounded-xl glass-input px-3 py-2.5 text-sm placeholder-slate-400 focus:ring-1 focus:ring-purple-550 resize-none transition-colors"
              />
            </div>

            {/* Allergen Info */}
            <div className="space-y-1.5">
              <label htmlFor="allergenInfo" className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                Allergen Information
              </label>
              <input
                id="allergenInfo"
                name="allergenInfo"
                type="text"
                placeholder="e.g. Contains nuts, dairy, gluten"
                className="block w-full rounded-xl glass-input px-3 py-2.5 text-sm placeholder-slate-400 focus:ring-1 focus:ring-purple-550 transition-colors"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 disabled:opacity-50 shadow-lg shadow-purple-500/20"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>{isPending ? 'Listing food item...' : 'List Food Donation'}</span>
          </button>
        </form>
      </div>
    </div>
  )
}
