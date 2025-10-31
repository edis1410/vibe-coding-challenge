'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function getUserProfile(userId?: string) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const targetUserId = userId || user.id

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', targetUserId)
    .single()

  if (error) {
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({ id: user.id })
      .select()
      .single()

    if (insertError) {
      throw new Error('Failed to create profile')
    }

    return {
      id: user.id,
      first_name: null,
      last_name: null,
      avatar_url: null,
      email: user.email || '',
    }
  }

  return {
    ...profile,
    email: user.email || '',
  }
}

export async function updateProfile(formData: {
  firstName?: string
  lastName?: string
}) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      first_name: formData.firstName?.trim() || null,
      last_name: formData.lastName?.trim() || null,
    })
    .eq('id', user.id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/profile')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateAvatar(avatarUrl: string) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      avatar_url: avatarUrl,
    })
    .eq('id', user.id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/profile')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteAvatar() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('id', user.id)
    .single()

  if (profile?.avatar_url) {
    const filePath = profile.avatar_url.split('/').pop()
    if (filePath) {
      await supabase.storage
        .from('avatars')
        .remove([`${user.id}/${filePath}`])
    }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      avatar_url: null,
    })
    .eq('id', user.id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/profile')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteAccount() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('id', user.id)
    .single()

  if (profile?.avatar_url) {
    const filePath = profile.avatar_url.split('/').pop()
    if (filePath) {
      await supabase.storage
        .from('avatars')
        .remove([`${user.id}/${filePath}`])
    }
  }

  const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)

  if (deleteError) {
    throw new Error(deleteError.message)
  }

  await supabase.auth.signOut()
  redirect('/')
}


