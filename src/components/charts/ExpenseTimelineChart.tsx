'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Expense } from '@/types/database'
import { processTimelineData, getUserDisplayName } from '@/lib/chart-data'
import { formatCurrency } from '@/lib/calculations'

interface ExpenseTimelineChartProps {
  expenses: Expense[]
  members: {
    user_id: string
    email: string
    first_name?: string | null
    last_name?: string | null
  }[]
  currency: string
}

const USER_COLORS = [
  '#6366f1',
  '#ec4899',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#3b82f6',
  '#f97316',
  '#14b8a6',
]

export default function ExpenseTimelineChart({ expenses, members, currency }: ExpenseTimelineChartProps) {
  const data = processTimelineData(expenses, members)

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <p>No expenses to display</p>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">
            {new Date(label).toLocaleDateString()}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-gray-700">
              <span style={{ color: entry.color }}>●</span> {entry.name}:{' '}
              {formatCurrency(entry.value, currency)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          style={{ fontSize: '12px' }}
        />
        <YAxis
          style={{ fontSize: '12px' }}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '12px' }}
        />
        {members.map((member, index) => (
          <Line
            key={member.user_id}
            type="monotone"
            dataKey={member.user_id}
            name={getUserDisplayName(member)}
            stroke={USER_COLORS[index % USER_COLORS.length]}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

