'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Expense } from '@/types/database'
import { processCategoryData } from '@/lib/chart-data'
import { formatCurrency } from '@/lib/calculations'

interface ExpenseCategoryPieChartProps {
  expenses: Expense[]
  currency: string
}

const COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#f97316',
  '#14b8a6',
  '#ef4444',
  '#a855f7',
]

export default function ExpenseCategoryPieChart({ expenses, currency }: ExpenseCategoryPieChartProps) {
  const data = processCategoryData(expenses)

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <p>No expenses to display</p>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">
            {data.emoji} {data.categoryName}
          </p>
          <p className="text-sm text-gray-600">
            {formatCurrency(data.value, currency)}
          </p>
          <p className="text-sm text-gray-500">
            {data.percentage}% of total
          </p>
        </div>
      )
    }
    return null
  }

  const renderLabel = (entry: any) => {
    return `${entry.emoji} ${entry.percentage}%`
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="categoryName"
          cx="50%"
          cy="50%"
          outerRadius={80}
          label={renderLabel}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value, entry: any) => `${entry.payload.emoji} ${value}`}
          wrapperStyle={{ fontSize: '12px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

