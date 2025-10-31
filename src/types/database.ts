export interface Group {
  id: string
  name: string
  description: string | null
  created_by: string
  created_at: string
  invite_code: string
  currency: string
  icon_type: 'emoji' | 'image'
  icon_value: string
}

export interface GroupMember {
  id: string
  group_id: string
  user_id: string
  joined_at: string
}

export interface Expense {
  id: string
  group_id: string
  description: string
  amount: number
  paid_by: string
  category: string
  expense_date: string
  created_at: string
}

export interface ExpenseSplit {
  id: string
  expense_id: string
  user_id: string
  amount: number
}

export interface Settlement {
  id: string
  group_id: string
  paid_by: string
  paid_to: string
  amount: number
  note: string | null
  settled_at: string
}

export interface GroupWithMembers extends Group {
  group_members: GroupMember[]
}

export interface ExpenseWithDetails extends Expense {
  expense_splits: ExpenseSplit[]
  paid_by_user?: {
    email: string
  }
}

export interface Balance {
  user_id: string
  user_email: string
  balance: number
}

export interface SimplifiedDebt {
  from_user_id: string
  from_user_email: string
  to_user_id: string
  to_user_email: string
  amount: number
}

