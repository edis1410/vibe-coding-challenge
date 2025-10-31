export function validatePercentageSplit(percentages: Record<string, number>): {
  valid: boolean
  error?: string
  total: number
} {
  const values = Object.values(percentages)
  
  if (values.length === 0) {
    return { valid: false, error: 'At least one person must be selected', total: 0 }
  }

  if (values.some(p => p < 0 || p > 100)) {
    return { valid: false, error: 'Percentages must be between 0 and 100', total: 0 }
  }

  const total = values.reduce((sum, p) => sum + p, 0)
  const rounded = Number(total.toFixed(2))

  if (Math.abs(rounded - 100) > 0.01) {
    return { valid: false, error: `Total must be 100% (currently ${rounded}%)`, total: rounded }
  }

  if (values.every(p => p === 0)) {
    return { valid: false, error: 'At least one person must have a percentage > 0', total: rounded }
  }

  return { valid: true, total: rounded }
}

export function validateAmountSplit(
  amounts: Record<string, number>,
  totalAmount: number
): {
  valid: boolean
  error?: string
  total: number
} {
  const values = Object.values(amounts)
  
  if (values.length === 0) {
    return { valid: false, error: 'At least one person must be selected', total: 0 }
  }

  if (values.some(a => a < 0)) {
    return { valid: false, error: 'Amounts cannot be negative', total: 0 }
  }

  const total = values.reduce((sum, a) => sum + a, 0)
  const rounded = Number(total.toFixed(2))

  if (Math.abs(rounded - totalAmount) > 0.01) {
    return { 
      valid: false, 
      error: `Splits must total ${totalAmount.toFixed(2)} (currently ${rounded})`, 
      total: rounded 
    }
  }

  if (values.every(a => a === 0)) {
    return { valid: false, error: 'At least one person must have an amount > 0', total: rounded }
  }

  return { valid: true, total: rounded }
}

export function calculatePercentageSplit(
  totalAmount: number,
  percentages: Record<string, number>
): Record<string, number> {
  const amounts: Record<string, number> = {}
  const entries = Object.entries(percentages)
  
  let runningTotal = 0
  entries.forEach(([userId, percentage], index) => {
    if (index === entries.length - 1) {
      amounts[userId] = Number((totalAmount - runningTotal).toFixed(2))
    } else {
      const amount = Number((totalAmount * (percentage / 100)).toFixed(2))
      amounts[userId] = amount
      runningTotal += amount
    }
  })

  return amounts
}

export function detectSplitMethod(
  splits: { user_id: string; amount: number }[],
  totalAmount: number
): 'equal' | 'percentage' | 'amount' {
  if (splits.length === 0) return 'equal'

  const firstAmount = splits[0].amount
  const allEqual = splits.every(s => Math.abs(s.amount - firstAmount) < 0.01)
  
  if (allEqual) {
    return 'equal'
  }

  return 'amount'
}

