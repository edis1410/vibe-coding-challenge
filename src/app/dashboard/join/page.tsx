'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { joinGroupByCode } from '@/app/actions/groups'
import TopNav from '@/components/TopNav'

export default function JoinGroup() {
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { groupId, groupName } = await joinGroupByCode(inviteCode)
      router.push(`/dashboard/groups/${groupId}`)
    } catch (err: any) {
      setError(err.message || 'Failed to join group')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <TopNav />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-2">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-900/50 border border-indigo-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔗</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Join a Group</h1>
            <p className="text-gray-400">Enter an invite code to join an existing group</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-900/30 border border-red-700 p-4 text-sm text-red-300">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-300 mb-2">
                Invite Code *
              </label>
              <input
                id="inviteCode"
                type="text"
                required
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-center text-2xl font-mono uppercase tracking-wider text-white placeholder-gray-500"
                placeholder="ABC12345"
                maxLength={8}
                style={{ textTransform: 'uppercase' }}
              />
              <p className="mt-2 text-sm text-gray-500">
                Enter the 8-character code shared by a group member
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || inviteCode.trim().length !== 8}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? 'Joining...' : 'Join Group'}
              </button>
              <Link
                href="/dashboard"
                className="px-6 py-3 border border-gray-700 text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors font-medium text-center"
              >
                Cancel
              </Link>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-800">
            <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-300 mb-2 flex items-center gap-2">
                💡 How it works
              </h3>
              <ul className="text-sm text-blue-200 space-y-1">
                <li>• Ask a group member for their invite code</li>
                <li>• Enter the code above</li>
                <li>• You'll be added to the group instantly</li>
                <li>• Start tracking expenses together!</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

