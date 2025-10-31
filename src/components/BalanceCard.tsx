import { Balance } from '@/types/database'
import { formatCurrency } from '@/lib/calculations'

interface BalanceCardProps {
  balance: Balance & {
    first_name?: string | null
    last_name?: string | null
  }
  currency: string
}

export default function BalanceCard({ balance, currency }: BalanceCardProps) {
  const isPositive = balance.balance > 0
  const isZero = Math.abs(balance.balance) < 0.01

  const displayName = balance.first_name && balance.last_name
    ? `${balance.first_name} ${balance.last_name}`
    : balance.first_name || balance.user_email

  const initials = balance.first_name && balance.last_name
    ? `${balance.first_name.charAt(0)}${balance.last_name.charAt(0)}`.toUpperCase()
    : balance.first_name 
      ? balance.first_name.charAt(0).toUpperCase()
      : balance.user_email.charAt(0).toUpperCase()

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-900/50 border border-indigo-700/50 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-indigo-300">
              {initials}
            </span>
          </div>
          <div>
            <p className="font-medium text-white">{displayName}</p>
          </div>
        </div>
        <div className="text-right">
          {isZero ? (
            <p className="text-sm font-medium text-gray-500">Settled up</p>
          ) : (
            <>
              <p className={`text-lg font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(Math.abs(balance.balance), currency)}
              </p>
              <p className="text-xs text-gray-500">
                {isPositive ? 'gets back' : 'owes'}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

