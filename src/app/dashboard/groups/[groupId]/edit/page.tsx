'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updateGroup, getGroup } from '@/app/actions/groups'
import { getGroupExpenses } from '@/app/actions/expenses'
import TopNav from '@/components/TopNav'
import GroupIconSelector from '@/components/GroupIconSelector'
import CurrencySelector from '@/components/CurrencySelector'
import CurrencyChangeModal from '@/components/CurrencyChangeModal'
import { use } from 'react'

export default function EditGroup({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = use(params)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [originalCurrency, setOriginalCurrency] = useState('USD')
  const [iconType, setIconType] = useState<'emoji' | 'image'>('emoji')
  const [iconValue, setIconValue] = useState('💰')
  const [sampleAmounts, setSampleAmounts] = useState<number[]>([])
  const [showCurrencyModal, setShowCurrencyModal] = useState(false)
  const [pendingCurrency, setPendingCurrency] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleIconChange = (type: 'emoji' | 'image', value: string) => {
    setIconType(type)
    setIconValue(value)
  }

  useEffect(() => {
    async function loadGroup() {
      try {
        const [group, expenses] = await Promise.all([
          getGroup(groupId),
          getGroupExpenses(groupId),
        ])
        
        setName(group.name)
        setDescription(group.description || '')
        setCurrency(group.currency || 'USD')
        setOriginalCurrency(group.currency || 'USD')
        setIconType(group.icon_type || 'emoji')
        setIconValue(group.icon_value || '💰')
        
        const amounts = expenses.slice(0, 3).map((exp: { amount: number }) => exp.amount)
        setSampleAmounts(amounts)
        
        setLoading(false)
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load group'
        setError(errorMessage)
        setLoading(false)
      }
    }
    loadGroup()
  }, [groupId])

  const handleCurrencyChange = (newCurrency: string) => {
    if (newCurrency !== originalCurrency) {
      setPendingCurrency(newCurrency)
      setShowCurrencyModal(true)
    } else {
      setCurrency(newCurrency)
    }
  }

  const handleConfirmCurrencyChange = () => {
    if (pendingCurrency) {
      setCurrency(pendingCurrency)
      setShowCurrencyModal(false)
      setPendingCurrency(null)
    }
  }

  const handleCancelCurrencyChange = () => {
    setPendingCurrency(null)
    setShowCurrencyModal(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      await updateGroup(groupId, {
        name,
        description,
        iconType,
        iconValue,
        currency,
      })
      router.push(`/dashboard/groups/${groupId}`)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update group'
      setError(errorMessage)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <TopNav />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <Link
            href={`/dashboard/groups/${groupId}`}
            className="text-indigo-400 hover:text-indigo-300 flex items-center gap-2"
          >
            ← Back to Group
          </Link>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-white mb-2">Edit Group</h1>
          <p className="text-gray-400 mb-8">Update group details</p>

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

            <CurrencySelector value={currency} onChange={handleCurrencyChange} />

            <GroupIconSelector
              iconType={iconType}
              iconValue={iconValue}
              onIconChange={handleIconChange}
              groupId={groupId}
            />

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving || !name.trim()}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <Link
                href={`/dashboard/groups/${groupId}`}
                className="px-6 py-3 border border-gray-700 text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors font-medium text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>

      <CurrencyChangeModal
        isOpen={showCurrencyModal}
        currentCurrency={originalCurrency}
        newCurrency={pendingCurrency || currency}
        sampleAmounts={sampleAmounts}
        onConfirm={handleConfirmCurrencyChange}
        onCancel={handleCancelCurrencyChange}
      />
    </div>
  )
}

