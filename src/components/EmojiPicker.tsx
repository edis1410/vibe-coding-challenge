'use client'

import { useState } from 'react'
import { EMOJI_CATEGORIES } from '@/lib/emojis'

interface EmojiPickerProps {
  selectedEmoji: string
  onSelect: (emoji: string) => void
}

export default function EmojiPicker({ selectedEmoji, onSelect }: EmojiPickerProps) {
  const [showPicker, setShowPicker] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        className="flex items-center gap-3 px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg hover:border-indigo-500 transition-colors"
      >
        <span className="text-4xl">{selectedEmoji}</span>
        <span className="text-sm text-gray-400">Click to change emoji</span>
      </button>

      {showPicker && (
        <div className="absolute top-full left-0 mt-2 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-4 w-96 max-h-96 overflow-y-auto z-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-white">Choose an Emoji</h3>
            <button
              type="button"
              onClick={() => setShowPicker(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {EMOJI_CATEGORIES.map((category) => (
              <div key={category.name}>
                <h4 className="text-xs font-medium text-gray-400 mb-2">{category.name}</h4>
                <div className="grid grid-cols-8 gap-2">
                  {category.emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        onSelect(emoji)
                        setShowPicker(false)
                      }}
                      className={`text-2xl p-2 rounded-lg hover:bg-gray-700 transition-colors ${
                        selectedEmoji === emoji ? 'bg-indigo-900/50 ring-2 ring-indigo-500' : ''
                      }`}
                      title={emoji}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


