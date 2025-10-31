import Link from 'next/link'
import { Expense } from '@/types/database'
import { formatCurrency } from '@/lib/calculations'
import { getCategoryEmoji, getCategoryName } from '@/lib/categories'

interface ExpenseCardProps {
  expense: Expense
  paidByEmail: string
  currentUserId: string
  groupId: string
  currency: string
  onDelete?: (expenseId: string) => void
}

export default function ExpenseCard({ expense, paidByEmail, currentUserId, groupId, currency, onDelete }: ExpenseCardProps) {
  const canEdit = expense.paid_by === currentUserId
  const categoryEmoji = getCategoryEmoji(expense.category)
  const categoryName = getCategoryName(expense.category)

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:shadow-md hover:bg-gray-850 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{categoryEmoji}</span>
            <h4 className="font-medium text-white">{expense.description}</h4>
            <span className="px-2 py-1 text-xs bg-indigo-900/30 text-indigo-300 border border-indigo-700/50 rounded-full">
              {categoryName}
            </span>
          </div>
          <p className="text-sm text-gray-400">
            Paid by {paidByEmail}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(expense.expense_date || expense.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-lg font-semibold text-white">
              {formatCurrency(expense.amount, currency)}
            </p>
          </div>
          {canEdit && (
            <div className="flex gap-2">
              <Link
                href={`/dashboard/groups/${groupId}/expenses/${expense.id}/edit`}
                className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
              >
                Edit
              </Link>
              {onDelete && (
                <button
                  onClick={() => onDelete(expense.id)}
                  className="text-red-400 hover:text-red-300 text-sm font-medium"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

