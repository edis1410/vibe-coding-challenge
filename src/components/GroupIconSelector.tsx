'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import EmojiPicker from './EmojiPicker'

interface GroupIconSelectorProps {
  iconType: 'emoji' | 'image'
  iconValue: string
  onIconChange: (type: 'emoji' | 'image', value: string) => void
  groupId?: string
}

export default function GroupIconSelector({ iconType, iconValue, onIconChange, groupId }: GroupIconSelectorProps) {
  const [uploading, setUploading] = useState(false)
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

    if (file.size > 1024 * 1024) {
      setError('Image must be smaller than 1MB')
      return
    }

    if (!groupId) {
      setError('Group must be created first before uploading image')
      return
    }

    setError(null)
    setUploading(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `icon.${fileExt}`
      const filePath = `${groupId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('group-icons')
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from('group-icons')
        .getPublicUrl(filePath)

      onIconChange('image', publicUrl)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image'
      setError(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Group Icon
      </label>

      <div className="flex gap-4 mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="iconType"
            value="emoji"
            checked={iconType === 'emoji'}
            onChange={() => onIconChange('emoji', iconValue.startsWith('http') ? '💰' : iconValue)}
            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm font-medium text-gray-700">Emoji</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="iconType"
            value="image"
            checked={iconType === 'image'}
            onChange={() => onIconChange('image', iconValue)}
            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm font-medium text-gray-700">Custom Image</span>
        </label>
      </div>

      {iconType === 'emoji' ? (
        <EmojiPicker
          selectedEmoji={iconValue}
          onSelect={(emoji) => onIconChange('emoji', emoji)}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            {iconValue && iconValue.startsWith('http') ? (
              <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-700">
                <Image
                  src={iconValue}
                  alt="Group icon"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-24 h-24 bg-gray-800 rounded-xl flex items-center justify-center border-2 border-gray-700">
                <span className="text-gray-500 text-sm">No image</span>
              </div>
            )}

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
                disabled={uploading || !groupId}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload Image'}
              </button>
              <p className="text-xs text-gray-500 mt-2">
                {groupId
                  ? 'JPG, PNG or WebP. Max 1MB. Square images work best.'
                  : 'Save group first to upload custom image'}
              </p>
              {error && (
                <p className="text-xs text-red-600 mt-2">{error}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


