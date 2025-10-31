'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createGroup(formData: {
  name: string
  description?: string
  currency?: string
  iconType?: 'emoji' | 'image'
  iconValue?: string
}) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data: group, error: groupError } = await supabase
    .from('groups')
    .insert({
      name: formData.name,
      description: formData.description || null,
      currency: formData.currency || 'USD',
      icon_type: formData.iconType || 'emoji',
      icon_value: formData.iconValue || '💰',
      created_by: user.id,
    })
    .select()
    .single()

  if (groupError) {
    throw new Error(groupError.message)
  }

  const { error: memberError } = await supabase
    .from('group_members')
    .insert({
      group_id: group.id,
      user_id: user.id,
    })

  if (memberError) {
    throw new Error(memberError.message)
  }

  revalidatePath('/dashboard')
  return group
}

export async function getGroups() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data: groups, error } = await supabase
    .from('group_members')
    .select('group_id, groups(*)')
    .eq('user_id', user.id)

  if (error) {
    throw new Error(error.message)
  }

  return groups?.map((gm: { groups: unknown }) => gm.groups) || []
}

export async function getGroup(groupId: string) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data: group, error } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return group
}

export async function getGroupMembers(groupId: string) {
  const supabase = await createClient()

  const { data: members, error } = await supabase
    .from('group_members')
    .select(`
      id, 
      user_id, 
      joined_at
    `)
    .eq('group_id', groupId)

  if (error) {
    throw new Error(error.message)
  }

  const memberDetails = await Promise.all(
    members.map(async (member) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, avatar_url')
        .eq('id', member.user_id)
        .single()

      const { data: authData } = await supabase
        .from('user_profiles_view')
        .select('email')
        .eq('id', member.user_id)
        .single()

      return {
        id: member.id,
        user_id: member.user_id,
        joined_at: member.joined_at,
        email: authData?.email || 'Unknown',
        first_name: profile?.first_name || null,
        last_name: profile?.last_name || null,
        avatar_url: profile?.avatar_url || null,
      }
    })
  )

  return memberDetails
}

export async function addMemberByEmail(groupId: string, email: string) {
  const supabase = await createClient()
  
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Not authenticated')
  }

  const { data: group } = await supabase
    .from('groups')
    .select('created_by')
    .eq('id', groupId)
    .single()

  if (!group || group.created_by !== currentUser.id) {
    throw new Error('Only group creator can add members')
  }

  const { data: users, error: userError } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('email', email)
    .single()

  if (userError || !users) {
    throw new Error('User not found')
  }

  const { error: memberError } = await supabase
    .from('group_members')
    .insert({
      group_id: groupId,
      user_id: users.id,
    })

  if (memberError) {
    if (memberError.code === '23505') {
      throw new Error('User is already a member')
    }
    throw new Error(memberError.message)
  }

  revalidatePath(`/dashboard/groups/${groupId}`)
  return { success: true }
}

export async function joinGroupByCode(inviteCode: string) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('id, name')
    .eq('invite_code', inviteCode.trim().toLowerCase())
    .single()

  if (groupError || !group) {
    throw new Error('Invalid invite code')
  }

  const { data: existingMember } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', group.id)
    .eq('user_id', user.id)
    .single()

  if (existingMember) {
    throw new Error('You are already a member of this group')
  }

  const { error: memberError } = await supabase
    .from('group_members')
    .insert({
      group_id: group.id,
      user_id: user.id,
    })

  if (memberError) {
    throw new Error(memberError.message)
  }

  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/groups/${group.id}`)
  return { groupId: group.id, groupName: group.name }
}

export async function removeMember(groupId: string, userId: string) {
  const supabase = await createClient()
  
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Not authenticated')
  }

  const { data: group } = await supabase
    .from('groups')
    .select('created_by')
    .eq('id', groupId)
    .single()

  if (!group || group.created_by !== currentUser.id) {
    throw new Error('Only group creator can remove members')
  }

  if (userId === currentUser.id) {
    throw new Error('You cannot remove yourself. Use leave group instead.')
  }

  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(`/dashboard/groups/${groupId}`)
  return { success: true }
}

export async function updateGroup(groupId: string, formData: {
  name: string
  description?: string
  iconType?: 'emoji' | 'image'
  iconValue?: string
  currency?: string
}) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data: membership } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    throw new Error('Only group members can update the group')
  }

  const { data: group } = await supabase
    .from('groups')
    .select('icon_type, icon_value, currency')
    .eq('id', groupId)
    .single()

  if (!group) {
    throw new Error('Group not found')
  }

  if (formData.currency && formData.currency !== group.currency) {
    const { convertAmount } = await import('@/lib/exchange-rate')
    
    const { data: expenses } = await supabase
      .from('expenses')
      .select('id, amount')
      .eq('group_id', groupId)

    if (expenses && expenses.length > 0) {
      for (const expense of expenses) {
        const newAmount = await convertAmount(expense.amount, group.currency, formData.currency)
        
        await supabase
          .from('expenses')
          .update({ amount: newAmount })
          .eq('id', expense.id)

        const { data: splits } = await supabase
          .from('expense_splits')
          .select('id, amount')
          .eq('expense_id', expense.id)

        if (splits) {
          for (const split of splits) {
            const newSplitAmount = await convertAmount(split.amount, group.currency, formData.currency)
            await supabase
              .from('expense_splits')
              .update({ amount: newSplitAmount })
              .eq('id', split.id)
          }
        }
      }
    }

    const { data: settlements } = await supabase
      .from('settlements')
      .select('id, amount')
      .eq('group_id', groupId)

    if (settlements) {
      for (const settlement of settlements) {
        const newAmount = await convertAmount(settlement.amount, group.currency, formData.currency)
        await supabase
          .from('settlements')
          .update({ amount: newAmount })
          .eq('id', settlement.id)
      }
    }
  }

  if (formData.iconType === 'emoji' && group.icon_type === 'image' && group.icon_value?.startsWith('http')) {
    const filePath = group.icon_value.split('/').pop()
    if (filePath) {
      await supabase.storage
        .from('group-icons')
        .remove([`${groupId}/${filePath}`])
    }
  }

  const updateData: {
    name: string
    description: string | null
    icon_type?: 'emoji' | 'image'
    icon_value?: string
    currency?: string
  } = {
    name: formData.name,
    description: formData.description || null,
  }

  if (formData.iconType) {
    updateData.icon_type = formData.iconType
  }
  if (formData.iconValue) {
    updateData.icon_value = formData.iconValue
  }
  if (formData.currency) {
    updateData.currency = formData.currency
  }

  const { error } = await supabase
    .from('groups')
    .update(updateData)
    .eq('id', groupId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(`/dashboard/groups/${groupId}`)
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteGroup(groupId: string) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data: group } = await supabase
    .from('groups')
    .select('created_by')
    .eq('id', groupId)
    .single()

  if (!group || group.created_by !== user.id) {
    throw new Error('Only group creator can delete the group')
  }

  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', groupId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard')
  return { success: true }
}

