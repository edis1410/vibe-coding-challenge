'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getUserProfile } from '@/app/actions/profile'
import { getDisplayName } from '@/lib/profile-utils'
import MemberAvatar from './MemberAvatar'
import SignOutButton from './SignOutButton'

export default function TopNav() {
  const [profile, setProfile] = useState<{
    id: string
    first_name: string | null
    last_name: string | null
    avatar_url: string | null
    email: string
  } | null>(null)
  const [email, setEmail] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function loadUserData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setEmail(user.email || '')
        try {
          const userProfile = await getUserProfile()
          setProfile(userProfile)
        } catch {
          setProfile(null)
        }
      }
    }
    loadUserData()
  }, [supabase])

  return (
    <nav className="sticky top-0 z-50 bg-gray-900 shadow-lg border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-bold text-white">
              Splittify
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <MemberAvatar
                email={email}
                avatarUrl={profile?.avatar_url}
                firstName={profile?.first_name}
                lastName={profile?.last_name}
                size="sm"
              />
              <span className="text-sm font-medium text-gray-300">
                {getDisplayName(profile, email)}
              </span>
            </Link>
            <SignOutButton />
          </div>
        </div>
      </div>
    </nav>
  )
}


