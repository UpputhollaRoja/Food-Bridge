'use client'

import React from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Loader2 } from 'lucide-react'

interface ImageUploaderProps {
  bucket: 'donation-images' | 'delivery-proof'
  value: string[]
  onChange: (urls: string[]) => void
  maxImages?: number
}

export default function ImageUploader({ bucket, value, onChange, maxImages = 3 }: ImageUploaderProps) {
  const [uploading, setUploading] = React.useState(false)
  const [error, setError] = React.useState('')
  const supabase = createClient()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (value.length + files.length > maxImages) {
      setError(`You can only upload up to ${maxImages} images`)
      return
    }

    setUploading(true)
    setError('')

    const updatedPaths = [...value]

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split('.').pop()
        // eslint-disable-next-line react-hooks/purity
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file)

        if (uploadError) throw uploadError

        updatedPaths.push(filePath)
      }

      onChange(updatedPaths)
    } catch (err: unknown) {
      console.error(err)
      const message = err instanceof Error ? err.message : 'Error uploading image'
      setError(message)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = (indexToRemove: number) => {
    const updated = value.filter((_, idx) => idx !== indexToRemove)
    onChange(updated)
  }

  // Get full storage URL for previewing
  const getPublicUrl = (path: string) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {/* Existing Previews */}
        {value.map((path, idx) => (
          <div key={idx} className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-white/50 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getPublicUrl(path)}
              alt={`Upload ${idx + 1}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className="absolute top-1.5 right-1.5 h-6 w-6 flex items-center justify-center rounded-full bg-black/60 text-slate-350 hover:text-white hover:bg-black/80 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {/* Upload Button */}
        {value.length < maxImages && (
          <div className="relative aspect-square rounded-xl border-2 border-dashed border-slate-200 bg-white/50 hover:border-purple-500/30 flex flex-col items-center justify-center text-center p-2 cursor-pointer transition-colors group">
            {uploading ? (
              <Loader2 className="h-6 w-6 text-purple-600 animate-spin" />
            ) : (
              <>
                <Upload className="h-6 w-6 text-slate-500 group-hover:text-purple-600 transition-colors" />
                <span className="text-[10px] font-semibold text-slate-500 mt-1">Upload Photo</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={uploading}
              onChange={handleUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
    </div>
  )
}
