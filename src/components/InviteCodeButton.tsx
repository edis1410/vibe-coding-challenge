'use client'

import { useState } from 'react'

interface InviteCodeButtonProps {
  code: string
}

export default function InviteCodeButton({ code }: InviteCodeButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code.toUpperCase())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`px-3 py-1.5 rounded-lg border transition-all ${
        copied
          ? 'bg-green-900/30 border-green-700 text-green-300'
          : 'bg-gray-800 border-gray-700 text-indigo-300 hover:bg-gray-700'
      }`}
      title="Click to copy invite code"
    >
      <code className="text-sm font-mono font-bold tracking-wider">
        {copied ? '✓ Copied!' : code.toUpperCase()}
      </code>
    </button>
  )
}

