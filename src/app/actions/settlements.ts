'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createSettlement(formData: {
  groupId: string
  paidBy: string
  paidTo: string
  amount: number
  note?: string
}) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  if (formData.paidBy === formData.paidTo) {
    throw new Error('Payer and receiver cannot be the same person')
  }

  const { data: settlement, error } = await supabase
    .from('settlements')
    .insert({
      group_id: formData.groupId,
      paid_by: formData.paidBy,
      paid_to: formData.paidTo,
      amount: formData.amount,
      note: formData.note || null,
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(`/dashboard/groups/${formData.groupId}`)
  return settlement
}

export async function getGroupSettlements(groupId: string) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data: settlements, error } = await supabase
    .from('settlements')
    .select('*')
    .eq('group_id', groupId)
    .order('settled_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return settlements
}

