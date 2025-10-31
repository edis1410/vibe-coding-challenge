'use client'

import { useState } from 'react'
import Link from 'next/link'
import GroupIcon from './GroupIcon'
import InviteCodeButton from './InviteCodeButton'
import MembersModal from './MembersModal'
import ExpenseCard from './ExpenseCard'
import SettlementCard from './SettlementCard'
import BalanceCard from './BalanceCard'
import ExpenseCategoryPieChart from './charts/ExpenseCategoryPieChart'
import ExpenseTimelineChart from './charts/ExpenseTimelineChart'
import { formatCurrency } from '@/lib/calculations'

interface GroupPageClientProps {
  group: any
  members: any[]
  timeline: any[]
  balances: any[]
  simplifiedDebts: any[]
  expenses: any[]
  groupId: string
  currentUserId: string
  memberNames: Record<string, string>
  totalExpenses: number
}

export default function GroupPageClient({
  group,
  members,
  timeline,
  balances,
  simplifiedDebts,
  expenses,
  groupId,
  currentUserId,
  memberNames,
  totalExpenses,
}: GroupPageClientProps) {
  const [showMembersModal, setShowMembersModal] = useState(false)

  return (
    <>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <GroupIcon
              iconType={group.icon_type}
              iconValue={group.icon_value}
              size="lg"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-white">{group.name}</h1>
                <Link
                  href={`/dashboard/groups/${groupId}/edit`}
                  className="text-gray-400 hover:text-indigo-400 transition-colors text-xl"
                  title="Edit group"
                >
                  ✏️
                </Link>
              </div>
              {group.description && (
                <p className="text-gray-400 mt-1">{group.description}</p>
              )}
            </div>
          </div>
          
          <InviteCodeButton code={group.invite_code} />
        </div>

        <div className="flex gap-3 mb-6">
          <Link
            href={`/dashboard/groups/${groupId}/expenses/new`}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            + Add Expense
          </Link>
          <Link
            href={`/dashboard/groups/${groupId}/settle`}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Settle Up
          </Link>
          <button
            onClick={() => setShowMembersModal(true)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            👥 {members.length} Members
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-indigo-900/30 border border-indigo-700/50 rounded-lg p-4">
            <p className="text-sm text-indigo-300 font-medium mb-1">Total Expenses</p>
            <p className="text-2xl font-bold text-indigo-100">{formatCurrency(totalExpenses, group.currency)}</p>
          </div>
          <div className="bg-purple-900/30 border border-purple-700/50 rounded-lg p-4">
            <p className="text-sm text-purple-300 font-medium mb-1">Members</p>
            <p className="text-2xl font-bold text-purple-100">{members.length}</p>
          </div>
          <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
            <p className="text-sm text-blue-300 font-medium mb-1">Transactions</p>
            <p className="text-2xl font-bold text-blue-100">{timeline.length}</p>
          </div>
        </div>
      </div>

      {expenses.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Expenses by Category</h2>
            <ExpenseCategoryPieChart expenses={expenses} currency={group.currency} />
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Expenses Over Time</h2>
            <ExpenseTimelineChart 
              expenses={expenses} 
              members={members}
              currency={group.currency}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Expenses & Settlements</h2>
            {timeline.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No expenses or settlements yet</p>
                <Link
                  href={`/dashboard/groups/${groupId}/expenses/new`}
                  className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Add First Expense
                </Link>
              </div>
            ) : (
              <div className="space-y-3 h-[500px] overflow-y-auto pr-2">
                {timeline.map((item) => {
                  if (item.type === 'expense') {
                    const expense = item.data as any
                    const displayName = expense.paid_by_first_name && expense.paid_by_last_name
                      ? `${expense.paid_by_first_name} ${expense.paid_by_last_name}`
                      : expense.paid_by_first_name || expense.paid_by_email
                    
                    return (
                      <ExpenseCard
                        key={`expense-${expense.id}`}
                        expense={expense}
                        paidByEmail={displayName}
                        currentUserId={currentUserId}
                        groupId={groupId}
                        currency={group.currency}
                      />
                    )
                  } else {
                    const settlement = item.data as any
                    return (
                      <SettlementCard
                        key={`settlement-${settlement.id}`}
                        settlement={settlement}
                        paidByName={memberNames[settlement.paid_by] || 'Unknown'}
                        paidToName={memberNames[settlement.paid_to] || 'Unknown'}
                        currency={group.currency}
                      />
                    )
                  }
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Balances</h2>
            {balances.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No expenses yet</p>
            ) : (
              <div className="space-y-3 h-[300px] overflow-y-auto pr-2">
                {balances.map((balance: any) => (
                  <BalanceCard key={balance.user_id} balance={balance} currency={group.currency} />
                ))}
              </div>
            )}
          </div>

          {simplifiedDebts.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Suggested Settlements</h2>
              <div className="space-y-3">
                {simplifiedDebts.map((debt: any, index: number) => (
                  <div key={index} className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
                    <p className="text-sm text-gray-300">
                      <span className="font-medium">{debt.from_user_email}</span>
                      {' owes '}
                      <span className="font-medium">{debt.to_user_email}</span>
                    </p>
                    <p className="text-lg font-bold text-yellow-300 mt-1">
                      {formatCurrency(debt.amount, group.currency)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <MembersModal
        isOpen={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        members={members}
        groupId={groupId}
        isCreator={group.created_by === currentUserId}
        currentUserId={currentUserId}
      />
    </>
  )
}

