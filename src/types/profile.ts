export interface UserProfile {
  id: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface UserProfileWithEmail extends UserProfile {
  email: string
}


