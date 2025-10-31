'use client'

import { useState } from 'react'

interface InviteCodeDisplayProps {
  inviteCode: string
}

export default function InviteCodeDisplay({ inviteCode }: InviteCodeDisplayProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode.toUpperCase())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-xl p-6 border border-indigo-700/50">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Group Invite Code</h3>
          <div className="flex items-center gap-3">
            <code className="text-3xl font-bold font-mono text-indigo-300 tracking-wider">
              {inviteCode.toUpperCase()}
            </code>
            <button
              onClick={handleCopy}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {copied ? '✓ Copied!' : 'Copy Code'}
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            Share this code with others to invite them to the group
          </p>
        </div>
      </div>
    </div>
  )
}

