import { Settlement } from '@/types/database'
import { formatCurrency } from '@/lib/calculations'

interface SettlementCardProps {
  settlement: Settlement
  paidByName: string
  paidToName: string
  currency: string
}

export default function SettlementCard({ settlement, paidByName, paidToName, currency }: SettlementCardProps) {
  return (
    <div className="bg-green-900/20 border-2 border-green-700/50 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">💸</span>
            <span className="font-medium text-green-300">{paidByName}</span>
            <span className="text-gray-400 text-lg">→</span>
            <span className="font-medium text-green-300">{paidToName}</span>
          </div>
          <p className="text-xs text-gray-500 italic">
            Settlement on {new Date(settlement.settled_at).toLocaleDateString()}
          </p>
          {settlement.note && (
            <p className="text-sm text-gray-400 mt-2 italic">
              &quot;{settlement.note}&quot;
            </p>
          )}
        </div>
        <div className="text-right ml-4">
          <p className="text-lg font-semibold text-green-400">
            {formatCurrency(settlement.amount, currency)}
          </p>
        </div>
      </div>
    </div>
  )
}

