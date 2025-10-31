'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createGroup } from '@/app/actions/groups'
import TopNav from '@/components/TopNav'
import CurrencySelector from '@/components/CurrencySelector'
import GroupIconSelector from '@/components/GroupIconSelector'

export default function NewGroup() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [iconType, setIconType] = useState<'emoji' | 'image'>('emoji')
  const [iconValue, setIconValue] = useState('💰')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleIconChange = (type: 'emoji' | 'image', value: string) => {
    setIconType(type)
    setIconValue(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const group = await createGroup({
        name,
        description,
        currency,
        iconType,
        iconValue,
      })
      router.push(`/dashboard/groups/${group.id}`)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create group'
      setError(errorMessage)
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
          <h1 className="text-3xl font-bold text-white mb-2">Create New Group</h1>
          <p className="text-gray-400 mb-8">Start tracking expenses with friends and family</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-900/30 border border-red-700 p-4 text-sm text-red-300">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Group Name *
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-white placeholder-gray-500"
                placeholder="e.g., Trip to Paris, Roommates, Office Lunch"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                Description (optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-white placeholder-gray-500"
                placeholder="Add details about this group..."
              />
            </div>

            <CurrencySelector value={currency} onChange={setCurrency} />

            <GroupIconSelector
              iconType={iconType}
              iconValue={iconValue}
              onIconChange={handleIconChange}
            />

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? 'Creating...' : 'Create Group'}
              </button>
              <Link
                href="/dashboard"
                className="px-6 py-3 border border-gray-700 text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors font-medium text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

