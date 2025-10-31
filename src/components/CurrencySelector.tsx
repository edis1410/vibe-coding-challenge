import { getCurrencyList } from '@/lib/currency'

interface CurrencySelectorProps {
  value: string
  onChange: (currency: string) => void
  disabled?: boolean
}

export default function CurrencySelector({ value, onChange, disabled = false }: CurrencySelectorProps) {
  const currencies = getCurrencyList()

  return (
    <div>
      <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
        Currency *
      </label>
      <select
        id="currency"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        {currencies.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.code} - {currency.symbol} ({currency.name})
          </option>
        ))}
      </select>
      <p className="mt-2 text-sm text-gray-500">
        All expenses in this group will be tracked in this currency
      </p>
    </div>
  )
}


