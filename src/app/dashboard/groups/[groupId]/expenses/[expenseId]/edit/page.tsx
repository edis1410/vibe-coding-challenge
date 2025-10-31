'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updateExpense, getExpense } from '@/app/actions/expenses'
import { getGroupMembers, getGroup } from '@/app/actions/groups'
import TopNav from '@/components/TopNav'
import CategorySelector from '@/components/CategorySelector'
import MemberAvatar from '@/components/MemberAvatar'
import { getCurrencySymbol } from '@/lib/currency'
import { validatePercentageSplit, validateAmountSplit, calculatePercentageSplit, detectSplitMethod } from '@/lib/split-validation'
import { use } from 'react'

export default function EditExpense({ params }: { params: Promise<{ groupId: string; expenseId: string }> }) {
  const { groupId, expenseId } = use(params)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0])
  const [category, setCategory] = useState('other')
  const [paidBy, setPaidBy] = useState('')
  const [splitMethod, setSplitMethod] = useState<'equal' | 'percentage' | 'amount'>('equal')
  const [splitWith, setSplitWith] = useState<string[]>([])
  const [percentageSplits, setPercentageSplits] = useState<Record<string, number>>({})
  const [amountSplits, setAmountSplits] = useState<Record<string, number>>({})
  const [members, setMembers] = useState<{id: string; user_id: string; email: string}[]>([])
  const [currency, setCurrency] = useState('USD')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [splitError, setSplitError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      try {
        const [expense, groupMembers, group] = await Promise.all([
          getExpense(expenseId),
          getGroupMembers(groupId),
          getGroup(groupId),
        ])

        setDescription(expense.description)
        setAmount(expense.amount.toString())
        setExpenseDate(expense.expense_date || new Date().toISOString().split('T')[0])
        setCategory(expense.category || 'other')
        setPaidBy(expense.paid_by)
        
        const splits = expense.splits as { user_id: string; amount: number }[]
        const userIds = splits.map(s => s.user_id)
        setSplitWith(userIds)
        
        const method = detectSplitMethod(splits, expense.amount)
        setSplitMethod(method)
        
        const percentages: Record<string, number> = {}
        const amounts: Record<string, number> = {}
        splits.forEach(split => {
          amounts[split.user_id] = split.amount
          percentages[split.user_id] = Number(((split.amount / expense.amount) * 100).toFixed(2))
        })
        setAmountSplits(amounts)
        setPercentageSplits(percentages)
        
        setMembers(groupMembers)
        setCurrency(group.currency || 'USD')
        setLoading(false)
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load expense'
        setError(errorMessage)
        setLoading(false)
      }
    }
    loadData()
  }, [groupId, expenseId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSplitError(null)

    if (!paidBy) {
      setError('Please select who paid')
      return
    }

    const totalAmount = parseFloat(amount)
    if (!totalAmount || totalAmount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    let splits: { userId: string; amount: number }[] = []

    if (splitMethod === 'equal') {
      if (splitWith.length === 0) {
        setError('Please select at least one person to split with')
        return
      }
      const splitAmount = Number((totalAmount / splitWith.length).toFixed(2))
      splits = splitWith.map(userId => ({ userId, amount: splitAmount }))
    } else if (splitMethod === 'percentage') {
      const validation = validatePercentageSplit(percentageSplits)
      if (!validation.valid) {
        setSplitError(validation.error)
        return
      }
      const amounts = calculatePercentageSplit(totalAmount, percentageSplits)
      splits = Object.entries(amounts).map(([userId, amount]) => ({ userId, amount }))
    } else if (splitMethod === 'amount') {
      const validation = validateAmountSplit(amountSplits, totalAmount)
      if (!validation.valid) {
        setSplitError(validation.error)
        return
      }
      splits = Object.entries(amountSplits).map(([userId, amount]) => ({ userId, amount }))
    }

    setSaving(true)

    try {
      await updateExpense(expenseId, {
        groupId,
        description,
        amount: totalAmount,
        expenseDate,
        paidBy,
        splits,
        category,
      })
      router.push(`/dashboard/groups/${groupId}`)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update expense'
      setError(errorMessage)
      setSaving(false)
    }
  }

  const toggleSplitWith = (userId: string) => {
    setSplitWith((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    )
  }

  const updatePercentage = (userId: string, value: string) => {
    const percentage = parseFloat(value) || 0
    setPercentageSplits(prev => ({ ...prev, [userId]: percentage }))
  }

  const updateAmount = (userId: string, value: string) => {
    const amt = parseFloat(value) || 0
    setAmountSplits(prev => ({ ...prev, [userId]: amt }))
  }

  const splitAmount = amount && splitWith.length > 0
    ? (parseFloat(amount) / splitWith.length).toFixed(2)
    : '0.00'

  const percentageValidation = splitMethod === 'percentage' 
    ? validatePercentageSplit(percentageSplits)
    : { valid: true, total: 0 }

  const amountValidation = splitMethod === 'amount' 
    ? validateAmountSplit(amountSplits, parseFloat(amount) || 0)
    : { valid: true, total: 0 }

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
          <h1 className="text-3xl font-bold text-white mb-2">Edit Expense</h1>
          <p className="text-gray-400 mb-8">Update expense details</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-900/30 border border-red-700 p-4 text-sm text-red-300">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                Description *
              </label>
              <input
                id="description"
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-white placeholder-gray-500"
                placeholder="e.g., Dinner at restaurant"
              />
            </div>

            <div>
              <label htmlFor="expenseDate" className="block text-sm font-medium text-gray-300 mb-2">
                Date *
              </label>
              <input
                id="expenseDate"
                type="date"
                required
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-white placeholder-gray-500"
              />
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
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-white placeholder-gray-500"
                placeholder="0.00"
              />
              <p className="mt-1 text-sm text-gray-500">
                All expenses in this group are tracked in {currency}
              </p>
            </div>

            <CategorySelector value={category} onChange={setCategory} />

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Paid by *
              </label>
              <div className="flex flex-wrap gap-4">
                {members.map((member) => {
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
                          ? 'bg-indigo-900/50 border-2 border-indigo-500'
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
                Split Method *
              </label>
              <div className="flex gap-4 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="splitMethod"
                    value="equal"
                    checked={splitMethod === 'equal'}
                    onChange={() => setSplitMethod('equal')}
                    className="w-4 h-4 text-indigo-500 focus:ring-indigo-400"
                  />
                  <span className="text-sm font-medium text-gray-300">Equally</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="splitMethod"
                    value="percentage"
                    checked={splitMethod === 'percentage'}
                    onChange={() => setSplitMethod('percentage')}
                    className="w-4 h-4 text-indigo-500 focus:ring-indigo-400"
                  />
                  <span className="text-sm font-medium text-gray-300">By Percentage</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="splitMethod"
                    value="amount"
                    checked={splitMethod === 'amount'}
                    onChange={() => setSplitMethod('amount')}
                    className="w-4 h-4 text-indigo-500 focus:ring-indigo-400"
                  />
                  <span className="text-sm font-medium text-gray-300">By Amount</span>
                </label>
              </div>

              {splitError && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
                  {splitError}
                </div>
              )}

              {splitMethod === 'equal' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Split equally among *
                  </label>
                  <div className="space-y-2">
                    {members.map((member) => {
                      const displayName = member.first_name && member.last_name
                        ? `${member.first_name} ${member.last_name}`
                        : member.first_name || member.email
                      return (
                        <label key={member.user_id} className="flex items-center gap-3 p-3 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={splitWith.includes(member.user_id)}
                            onChange={() => toggleSplitWith(member.user_id)}
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                          />
                          <span className="text-sm font-medium text-gray-200">{displayName}</span>
                        </label>
                      )
                    })}
                  </div>
                  {amount && splitWith.length > 0 && (
                    <p className="mt-2 text-sm text-gray-600">
                      Each person pays: {getCurrencySymbol(currency)}{splitAmount}
                    </p>
                  )}
                </div>
              )}

              {splitMethod === 'percentage' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Split by percentage *
                  </label>
                  <div className="space-y-2">
                    {members.map((member) => {
                      const displayName = member.first_name && member.last_name
                        ? `${member.first_name} ${member.last_name}`
                        : member.first_name || member.email
                      return (
                        <div key={member.user_id} className="flex items-center gap-3 p-3 bg-gray-800 border border-gray-700 rounded-lg">
                          <span className="text-sm font-medium text-gray-200 flex-1">{displayName}</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={percentageSplits[member.user_id] || 0}
                            onChange={(e) => updatePercentage(member.user_id, e.target.value)}
                            className="w-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-white"
                          />
                          <span className="text-sm text-gray-400">%</span>
                          {amount && (
                            <span className="text-sm text-gray-500 w-24 text-right">
                              {getCurrencySymbol(currency)}{((parseFloat(amount) * (percentageSplits[member.user_id] || 0)) / 100).toFixed(2)}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <p className={`mt-2 text-sm ${percentageValidation.valid ? 'text-green-600' : 'text-gray-600'}`}>
                    Total: {percentageValidation.total.toFixed(2)}% {percentageValidation.valid && '✓'}
                  </p>
                </div>
              )}

              {splitMethod === 'amount' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Split by amount *
                  </label>
                  <div className="space-y-2">
                    {members.map((member) => {
                      const displayName = member.first_name && member.last_name
                        ? `${member.first_name} ${member.last_name}`
                        : member.first_name || member.email
                      return (
                        <div key={member.user_id} className="flex items-center gap-3 p-3 bg-gray-800 border border-gray-700 rounded-lg">
                          <span className="text-sm font-medium text-gray-200 flex-1">{displayName}</span>
                          <span className="text-sm text-gray-600">{getCurrencySymbol(currency)}</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={amountSplits[member.user_id] || 0}
                            onChange={(e) => updateAmount(member.user_id, e.target.value)}
                            className="w-32 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-white"
                          />
                        </div>
                      )
                    })}
                  </div>
                  <p className={`mt-2 text-sm ${amountValidation.valid ? 'text-green-600' : 'text-gray-600'}`}>
                    Total: {getCurrencySymbol(currency)}{amountValidation.total.toFixed(2)} 
                    {amount && ` / ${getCurrencySymbol(currency)}${parseFloat(amount).toFixed(2)}`}
                    {amountValidation.valid && amount && ' ✓'}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={
                  saving || 
                  !description.trim() || 
                  !amount || 
                  !paidBy || 
                  (splitMethod === 'equal' && splitWith.length === 0) ||
                  (splitMethod === 'percentage' && !percentageValidation.valid) ||
                  (splitMethod === 'amount' && !amountValidation.valid)
                }
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
    </div>
  )
}

