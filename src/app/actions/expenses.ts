'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { calculateEqualSplit } from '@/lib/calculations'

export async function createExpense(formData: {
  groupId: string
  description: string
  amount: number
  expenseDate: string
  paidBy: string
  splits: { userId: string; amount: number }[]
  category: string
}) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data: expense, error: expenseError } = await supabase
    .from('expenses')
    .insert({
      group_id: formData.groupId,
      description: formData.description,
      amount: formData.amount,
      expense_date: formData.expenseDate,
      paid_by: formData.paidBy,
      category: formData.category,
    })
    .select()
    .single()

  if (expenseError) {
    throw new Error(expenseError.message)
  }

  const splits = formData.splits.map((split) => ({
    expense_id: expense.id,
    user_id: split.userId,
    amount: split.amount,
  }))

  const { error: splitError } = await supabase
    .from('expense_splits')
    .insert(splits)

  if (splitError) {
    throw new Error(splitError.message)
  }

  revalidatePath(`/dashboard/groups/${formData.groupId}`)
  return expense
}

export async function getGroupExpenses(groupId: string) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data: expenses, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  const expensesWithProfiles = await Promise.all(
    expenses.map(async (expense) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, avatar_url')
        .eq('id', expense.paid_by)
        .single()

      const { data: authData } = await supabase
        .from('user_profiles_view')
        .select('email')
        .eq('id', expense.paid_by)
        .single()

      return {
        ...expense,
        paid_by_email: authData?.email || 'Unknown',
        paid_by_first_name: profile?.first_name || null,
        paid_by_last_name: profile?.last_name || null,
        paid_by_avatar_url: profile?.avatar_url || null,
      }
    })
  )

  return expensesWithProfiles
}

export async function getExpenseSplits(groupId: string) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data: expenses } = await supabase
    .from('expenses')
    .select('id')
    .eq('group_id', groupId)

  if (!expenses || expenses.length === 0) {
    return []
  }

  const expenseIds = expenses.map((e) => e.id)

  const { data: splits, error } = await supabase
    .from('expense_splits')
    .select('*')
    .in('expense_id', expenseIds)

  if (error) {
    throw new Error(error.message)
  }

  return splits
}

export async function getExpense(expenseId: string) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data: expense, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('id', expenseId)
    .single()

  if (error || !expense) {
    throw new Error('Expense not found')
  }

  const { data: splits } = await supabase
    .from('expense_splits')
    .select('user_id, amount')
    .eq('expense_id', expenseId)

  return {
    ...expense,
    splits: splits || [],
  }
}

export async function updateExpense(
  expenseId: string,
  formData: {
    groupId: string
    description: string
    amount: number
    expenseDate: string
    paidBy: string
    splits: { userId: string; amount: number }[]
    category: string
  }
) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data: existingExpense } = await supabase
    .from('expenses')
    .select('paid_by')
    .eq('id', expenseId)
    .single()

  if (!existingExpense || existingExpense.paid_by !== user.id) {
    throw new Error('Not authorized to edit this expense')
  }

  const { error: updateError } = await supabase
    .from('expenses')
    .update({
      description: formData.description,
      amount: formData.amount,
      expense_date: formData.expenseDate,
      paid_by: formData.paidBy,
      category: formData.category,
    })
    .eq('id', expenseId)

  if (updateError) {
    throw new Error(updateError.message)
  }

  await supabase
    .from('expense_splits')
    .delete()
    .eq('expense_id', expenseId)

  const splits = formData.splits.map((split) => ({
    expense_id: expenseId,
    user_id: split.userId,
    amount: split.amount,
  }))

  const { error: splitError } = await supabase
    .from('expense_splits')
    .insert(splits)

  if (splitError) {
    throw new Error(splitError.message)
  }

  revalidatePath(`/dashboard/groups/${formData.groupId}`)
  return { success: true }
}

export async function deleteExpense(expenseId: string, groupId: string) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', expenseId)
    .eq('paid_by', user.id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(`/dashboard/groups/${groupId}`)
  return { success: true }
}

