'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSettlement, getGroupSettlements } from '@/app/actions/settlements'
import { calculateBalances } from '@/app/actions/balances'
import { getGroupMembers, getGroup } from '@/app/actions/groups'
import TopNav from '@/components/TopNav'
import MemberAvatar from '@/components/MemberAvatar'
import { formatCurrency } from '@/lib/calculations'
import { getCurrencySymbol } from '@/lib/currency'
import { use } from 'react'

export default function SettlePage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = use(params)
  const [paidBy, setPaidBy] = useState('')
  const [paidTo, setPaidTo] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [members, setMembers] = useState<any[]>([])
  const [simplifiedDebts, setSimplifiedDebts] = useState<any[]>([])
  const [settlements, setSettlements] = useState<any[]>([])
  const [currency, setCurrency] = useState('USD')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      try {
        const [groupMembers, balanceData, settlementHistory, group] = await Promise.all([
          getGroupMembers(groupId),
          calculateBalances(groupId),
          getGroupSettlements(groupId),
          getGroup(groupId),
        ])
        
        setMembers(groupMembers)
        setSimplifiedDebts(balanceData.simplifiedDebts)
        setSettlements(settlementHistory)
        setCurrency(group.currency || 'USD')
      } catch (err: any) {
        setError(err.message)
      }
    }
    loadData()
  }, [groupId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!paidBy) {
      setError('Please select who paid')
      return
    }

    if (!paidTo) {
      setError('Please select who received payment')
      return
    }

    if (paidBy === paidTo) {
      setError('Payer and receiver cannot be the same person')
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    setLoading(true)

    try {
      await createSettlement({
        groupId,
        paidBy,
        paidTo,
        amount: parseFloat(amount),
        note: note || undefined,
      })
      router.push(`/dashboard/groups/${groupId}`)
    } catch (err: any) {
      setError(err.message || 'Failed to record settlement')
      setLoading(false)
    }
  }

  const memberNames: Record<string, string> = {}
  members.forEach((member: any) => {
    const displayName = member.first_name && member.last_name
      ? `${member.first_name} ${member.last_name}`
      : member.first_name || member.email
    memberNames[member.user_id] = displayName
  })

  return (
    <div className="min-h-screen bg-gray-950">
      <TopNav />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <Link
            href={`/dashboard/groups/${groupId}`}
            className="text-indigo-400 hover:text-indigo-300 flex items-center gap-2"
          >
            ← Back to Group
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-8">
            <h1 className="text-2xl font-bold text-white mb-2">Record Settlement</h1>
            <p className="text-gray-400 mb-6">Record a payment to settle debts</p>

            {simplifiedDebts.length > 0 && (
              <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                <h3 className="font-semibold text-yellow-300 mb-2">Suggested Payments:</h3>
                <div className="space-y-2">
                  {simplifiedDebts.map((debt: any, index: number) => {
                    const fromName = memberNames[debt.from_user_id] || debt.from_user_email
                    const toName = memberNames[debt.to_user_id] || debt.to_user_email
                    return (
                      <p key={index} className="text-sm text-yellow-200">
                        <span className="font-medium">{fromName}</span>
                        {' → '}
                        <span className="font-medium">{toName}</span>
                        {': '}
                        <span className="font-semibold">{formatCurrency(debt.amount, currency)}</span>
                      </p>
                    )
                  })}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-lg bg-red-900/30 border border-red-700 p-4 text-sm text-red-300">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Who paid? *
                </label>
                <div className="flex flex-wrap gap-4">
                  {members.map((member: any) => {
                    const displayName = member.first_name && member.last_name
                      ? `${member.first_name} ${member.last_name}`
                      : member.first_name || member.email
                    const isSelected = paidBy === member.user_id
                    return (
                      <button
                        key={member.user_id}
                        type="button"
                        onClick={() => setPaidBy(member.user_id)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-lg !w-32 transition-all ${
                          isSelected
                            ? 'bg-green-900/50 border-2 border-green-500'
                            : 'bg-gray-800 border-2 border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <MemberAvatar
                          email={member.email}
                          avatarUrl={member.avatar_url}
                          firstName={member.first_name}
                          lastName={member.last_name}
                          size="lg"
                        />
                        <span className="text-xs font-medium text-gray-300 text-center">{displayName}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Who received payment? *
                </label>
                <div className="flex flex-wrap gap-4">
                  {members.map((member: any) => {
                    const displayName = member.first_name && member.last_name
                      ? `${member.first_name} ${member.last_name}`
                      : member.first_name || member.email
                    const isSelected = paidTo === member.user_id
                    return (
                      <button
                        key={member.user_id}
                        type="button"
                        onClick={() => setPaidTo(member.user_id)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-lg !w-32 transition-all ${
                          isSelected
                            ? 'bg-green-900/50 border-2 border-green-500'
                            : 'bg-gray-800 border-2 border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <MemberAvatar
                          email={member.email}
                          avatarUrl={member.avatar_url}
                          firstName={member.first_name}
                          lastName={member.last_name}
                          size="lg"
                        />
                        <span className="text-xs font-medium text-gray-300 text-center">{displayName}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
                  Amount ({getCurrencySymbol(currency)}) *
                </label>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 text-white placeholder-gray-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="note" className="block text-sm font-medium text-gray-300 mb-2">
                  Note (optional)
                </label>
                <textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 text-white placeholder-gray-500"
                  placeholder="Add a note about this payment..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading || !paidBy || !paidTo || !amount || paidBy === paidTo}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {loading ? 'Recording...' : 'Record Settlement'}
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

          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Settlement History</h2>
            {settlements.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No settlements recorded yet</p>
            ) : (
              <div className="space-y-4">
                {settlements.map((settlement: any) => {
                  const paidByName = memberNames[settlement.paid_by] || 'Unknown'
                  const paidToName = memberNames[settlement.paid_to] || 'Unknown'
                  return (
                    <div key={settlement.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm text-gray-300">
                            <span className="font-medium">{paidByName}</span>
                            {' paid '}
                            <span className="font-medium">{paidToName}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(settlement.settled_at).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-lg font-semibold text-green-400">
                          {formatCurrency(settlement.amount, currency)}
                        </p>
                      </div>
                      {settlement.note && (
                        <p className="text-sm text-gray-400 mt-2 italic">{settlement.note}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

