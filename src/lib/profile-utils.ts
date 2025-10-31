import { UserProfile, UserProfileWithEmail } from '@/types/profile'

export function getDisplayName(profile: UserProfileWithEmail | null, email?: string): string {
  if (!profile) {
    return email || 'Unknown User'
  }

  if (profile.first_name && profile.last_name) {
    return `${profile.first_name} ${profile.last_name}`
  }

  if (profile.first_name) {
    return profile.first_name
  }

  return profile.email || email || 'Unknown User'
}

export function getInitials(profile: UserProfileWithEmail | null, email?: string): string {
  if (!profile) {
    return email ? email.charAt(0).toUpperCase() : 'U'
  }

  if (profile.first_name && profile.last_name) {
    return `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase()
  }

  if (profile.first_name) {
    return profile.first_name.charAt(0).toUpperCase()
  }

  const displayEmail = profile.email || email
  return displayEmail ? displayEmail.charAt(0).toUpperCase() : 'U'
}

export function getAvatarUrl(profile: UserProfile | null): string | null {
  return profile?.avatar_url || null
}

export function formatFullName(firstName?: string | null, lastName?: string | null): string {
  const parts = [firstName, lastName].filter(Boolean)
  return parts.join(' ') || ''
}

export function getFirstName(profile: UserProfileWithEmail | null, email?: string): string {
  return profile?.first_name || profile?.email || email || 'User'
}


