'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateAvatar } from '@/app/actions/profile'
import Image from 'next/image'

interface ImageUploadProps {
  currentAvatarUrl: string | null
  userId: string
  onUploadComplete?: () => void
}

export default function ImageUpload({ currentAvatarUrl, userId, onUploadComplete }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be smaller than 2MB')
      return
    }

    setError(null)
    setUploading(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `avatar.${fileExt}`
      const filePath = `${userId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      await updateAvatar(publicUrl)

      setPreview(publicUrl)
      if (onUploadComplete) {
        onUploadComplete()
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image'
      setError(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Profile Picture
      </label>
      
      <div className="flex items-center gap-6">
        <div className="relative group">
          {preview ? (
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-700">
                <Image
                  src={preview}
                  alt="Profile"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={async () => {
                  const { deleteAvatar } = await import('@/app/actions/profile')
                  await deleteAvatar()
                  setPreview(null)
                }}
                className="absolute -top-1 -right-1 w-8 h-8 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center border-2 border-gray-900 shadow-lg transition-colors"
                title="Remove picture"
              >
                <span className="text-white text-sm">🗑️</span>
              </button>
            </div>
          ) : (
            <div className="w-24 h-24 bg-gray-800 border-4 border-gray-700 rounded-full flex items-center justify-center">
              <span className="text-3xl text-gray-500">👤</span>
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">Uploading...</span>
            </div>
          )}
        </div>

        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload Photo'}
          </button>
          <p className="text-sm text-gray-400 mt-2">
            JPG, PNG or WebP. Max size 2MB.
          </p>
          {error && (
            <p className="text-sm text-red-400 mt-2">{error}</p>
          )}
        </div>
      </div>
    </div>
  )
}


