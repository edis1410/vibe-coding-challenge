'use client'

import { useState, useEffect } from 'react'
import { getCurrencySymbol } from '@/lib/currency'
import { formatCurrency } from '@/lib/calculations'

interface CurrencyChangeModalProps {
  isOpen: boolean
  currentCurrency: string
  newCurrency: string
  sampleAmounts: number[]
  onConfirm: () => void
  onCancel: () => void
}

export default function CurrencyChangeModal({
  isOpen,
  currentCurrency,
  newCurrency,
  sampleAmounts,
  onConfirm,
  onCancel,
}: CurrencyChangeModalProps) {
  const [conversionRate, setConversionRate] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && currentCurrency !== newCurrency) {
      setLoading(true)
      setError(null)
      
      fetch(`https://v6.exchangerate-api.com/v6/7ba791d5e792124eba3ae54b/pair/${currentCurrency}/${newCurrency}`)
        .then(res => res.json())
        .then(data => {
          if (data.result === 'success') {
            setConversionRate(data.conversion_rate)
          } else {
            setError('Failed to fetch exchange rate')
          }
          setLoading(false)
        })
        .catch(() => {
          setError('Failed to fetch exchange rate')
          setLoading(false)
        })
    }
  }, [isOpen, currentCurrency, newCurrency])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
        <div className="mb-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Change Group Currency
          </h2>
          <p className="text-gray-600 text-center">
            All expenses will be automatically converted
          </p>
        </div>

        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-sm text-gray-600">Current Currency</p>
              <p className="text-lg font-bold text-gray-900">
                {currentCurrency} ({getCurrencySymbol(currentCurrency)})
              </p>
            </div>
            <span className="text-2xl">→</span>
            <div>
              <p className="text-sm text-gray-600">New Currency</p>
              <p className="text-lg font-bold text-indigo-900">
                {newCurrency} ({getCurrencySymbol(newCurrency)})
              </p>
            </div>
          </div>

          {loading && (
            <p className="text-sm text-gray-600 text-center">Loading exchange rate...</p>
          )}

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          {conversionRate && !loading && !error && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-sm text-gray-700 mb-2">
                Exchange rate: <span className="font-semibold">1 {currentCurrency} = {conversionRate.toFixed(4)} {newCurrency}</span>
              </p>
              {sampleAmounts.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-600 mb-2">Example conversions:</p>
                  <div className="space-y-1">
                    {sampleAmounts.slice(0, 3).map((amount, index) => (
                      <p key={index} className="text-sm text-gray-700">
                        {formatCurrency(amount, currentCurrency)} → {formatCurrency(amount * conversionRate, newCurrency)}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800 font-medium mb-2">
            This will convert:
          </p>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• All expense amounts</li>
            <li>• All split amounts</li>
            <li>• All settlement amounts</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading || !!error || !conversionRate}
            className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Convert Currency
          </button>
        </div>
      </div>
    </div>
  )
}

