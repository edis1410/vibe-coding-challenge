import { Expense, ExpenseSplit, Settlement, Balance, SimplifiedDebt } from '@/types/database'
import { formatCurrencyAmount } from './currency'

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return formatCurrencyAmount(amount, currency)
}

export function calculateGroupBalances(
  expenses: Expense[],
  splits: ExpenseSplit[],
  settlements: Settlement[],
  memberEmails: Record<string, string>
): Balance[] {
  const balances: Record<string, number> = {}

  expenses.forEach((expense) => {
    const expenseSplits = splits.filter((s) => s.expense_id === expense.id)
    
    if (!balances[expense.paid_by]) {
      balances[expense.paid_by] = 0
    }
    balances[expense.paid_by] += expense.amount

    expenseSplits.forEach((split) => {
      if (!balances[split.user_id]) {
        balances[split.user_id] = 0
      }
      balances[split.user_id] -= split.amount
    })
  })

  settlements.forEach((settlement) => {
    if (!balances[settlement.paid_by]) {
      balances[settlement.paid_by] = 0
    }
    if (!balances[settlement.paid_to]) {
      balances[settlement.paid_to] = 0
    }
    balances[settlement.paid_by] += settlement.amount
    balances[settlement.paid_to] -= settlement.amount
  })

  return Object.entries(balances).map(([user_id, balance]) => ({
    user_id,
    user_email: memberEmails[user_id] || 'Unknown',
    balance: Number(balance.toFixed(2)),
  }))
}

export function simplifyDebts(balances: Balance[]): SimplifiedDebt[] {
  const creditors = balances.filter((b) => b.balance > 0.01).sort((a, b) => b.balance - a.balance)
  const debtors = balances.filter((b) => b.balance < -0.01).sort((a, b) => a.balance - b.balance)

  const debts: SimplifiedDebt[] = []
  let i = 0
  let j = 0

  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i]
    const debtor = debtors[j]
    const amount = Math.min(creditor.balance, Math.abs(debtor.balance))

    if (amount > 0.01) {
      debts.push({
        from_user_id: debtor.user_id,
        from_user_email: debtor.user_email,
        to_user_id: creditor.user_id,
        to_user_email: creditor.user_email,
        amount: Number(amount.toFixed(2)),
      })
    }

    creditor.balance -= amount
    debtor.balance += amount

    if (creditor.balance < 0.01) i++
    if (Math.abs(debtor.balance) < 0.01) j++
  }

  return debts
}

export function calculateEqualSplit(amount: number, numPeople: number): number {
  return Number((amount / numPeople).toFixed(2))
}

