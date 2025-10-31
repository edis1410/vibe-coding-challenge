'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getUserProfile } from '@/app/actions/profile'
import TopNav from '@/components/TopNav'
import { getDisplayName, getInitials } from '@/lib/profile-utils'
import DeleteAccountModal from '@/components/DeleteAccountModal'

export default function ProfilePage() {
  const [profile, setProfile] = useState<{
    id: string
    first_name: string | null
    last_name: string | null
    avatar_url: string | null
    email: string
    created_at?: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      try {
        const userProfile = await getUserProfile()
        setProfile(userProfile)
        setLoading(false)
      } catch (err) {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <TopNav />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-2">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-8">
          <div className="flex flex-col items-center text-center mb-8">
            {profile?.avatar_url ? (
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-700 mb-4">
                <Image
                  src={profile.avatar_url}
                  alt="Profile"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-32 h-32 bg-indigo-900/50 border-4 border-indigo-700 rounded-full flex items-center justify-center mb-4">
                <span className="text-5xl text-indigo-300">
                  {getInitials(profile)}
                </span>
              </div>
            )}

            <h1 className="text-3xl font-bold text-white mb-2">
              {getDisplayName(profile)}
            </h1>
            <p className="text-gray-400 mb-1">{profile?.email}</p>
            <p className="text-sm text-gray-500">
              Member since {new Date(profile?.created_at || Date.now()).toLocaleDateString()}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">First Name</p>
              <p className="text-lg font-medium text-white">
                {profile?.first_name || 'Not set'}
              </p>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Last Name</p>
              <p className="text-lg font-medium text-white">
                {profile?.last_name || 'Not set'}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Link
              href="/dashboard/profile/edit"
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-center"
            >
              ✏️ Edit Profile
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-6 py-3 border-2 border-red-600 text-red-400 rounded-lg hover:bg-red-900/20 transition-colors font-medium"
            >
              🗑️ Delete Account
            </button>
          </div>
        </div>
      </main>

      <DeleteAccountModal
        email={profile?.email || ''}
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  )
}

