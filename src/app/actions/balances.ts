'use server'

import { createClient } from '@/lib/supabase/server'
import { calculateGroupBalances, simplifyDebts } from '@/lib/calculations'
import { getGroupExpenses, getExpenseSplits } from './expenses'
import { getGroupSettlements } from './settlements'
import { getGroupMembers } from './groups'

export async function calculateBalances(groupId: string) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const [expenses, splits, settlements, members] = await Promise.all([
    getGroupExpenses(groupId),
    getExpenseSplits(groupId),
    getGroupSettlements(groupId),
    getGroupMembers(groupId),
  ])

  const memberEmails: Record<string, string> = {}
  members.forEach((member: any) => {
    memberEmails[member.user_id] = member.email
  })

  const balances = calculateGroupBalances(expenses, splits, settlements, memberEmails)
  
  const balancesWithProfiles = balances.map((balance) => {
    const member = members.find((m: any) => m.user_id === balance.user_id)
    return {
      ...balance,
      first_name: member?.first_name || null,
      last_name: member?.last_name || null,
    }
  })

  const simplifiedDebts = simplifyDebts(balances)

  return {
    balances: balancesWithProfiles,
    simplifiedDebts,
  }
}

