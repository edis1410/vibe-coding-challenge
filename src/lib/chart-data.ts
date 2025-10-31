import { Expense } from '@/types/database'
import { getCategoryById } from './categories'

export interface CategoryChartData {
  category: string
  categoryName: string
  emoji: string
  value: number
  percentage: number
}

export interface TimelineChartData {
  date: string
  [key: string]: number | string
}

export function processCategoryData(expenses: Expense[]): CategoryChartData[] {
  if (expenses.length === 0) return []

  const categoryTotals: Record<string, number> = {}
  let total = 0

  expenses.forEach((expense) => {
    const amount = Number(expense.amount)
    categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + amount
    total += amount
  })

  const data = Object.entries(categoryTotals).map(([categoryId, value]) => {
    const category = getCategoryById(categoryId)
    return {
      category: categoryId,
      categoryName: category?.name || 'Other',
      emoji: category?.emoji || '🎉',
      value: Number(value.toFixed(2)),
      percentage: Number(((value / total) * 100).toFixed(1)),
    }
  })

  return data.sort((a, b) => b.value - a.value)
}

export function processTimelineData(
  expenses: Expense[],
  members: { user_id: string; email: string; first_name?: string | null; last_name?: string | null }[]
): TimelineChartData[] {
  if (expenses.length === 0) return []

  const dateMap: Record<string, Record<string, number>> = {}

  expenses.forEach((expense) => {
    const date = expense.expense_date || new Date(expense.created_at).toISOString().split('T')[0]
    
    if (!dateMap[date]) {
      dateMap[date] = {}
      members.forEach(member => {
        dateMap[date][member.user_id] = 0
      })
    }

    const paidBy = expense.paid_by
    if (paidBy) {
      dateMap[date][paidBy] = (dateMap[date][paidBy] || 0) + Number(expense.amount)
    }
  })

  const dates = Object.keys(dateMap).sort()
  
  const data: TimelineChartData[] = dates.map(date => {
    const entry: TimelineChartData = { date }
    members.forEach(member => {
      entry[member.user_id] = dateMap[date][member.user_id] || 0
    })
    return entry
  })

  return data
}

export function getUserDisplayName(member: {
  email: string
  first_name?: string | null
  last_name?: string | null
}): string {
  if (member.first_name && member.last_name) {
    return `${member.first_name} ${member.last_name}`
  }
  if (member.first_name) {
    return member.first_name
  }
  return member.email
}

