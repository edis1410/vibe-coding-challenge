'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MemberAvatar from './MemberAvatar'
import { removeMember } from '@/app/actions/groups'

interface Member {
  id: string
  user_id: string
  email: string
  first_name?: string | null
  last_name?: string | null
  avatar_url?: string | null
}

interface MembersListProps {
  members: Member[]
  groupId: string
  isCreator: boolean
  currentUserId: string
}

export default function MembersList({ members, groupId, isCreator, currentUserId }: MembersListProps) {
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const router = useRouter()

  const handleRemove = async (userId: string, email: string) => {
    if (confirmingId !== userId) {
      setConfirmingId(userId)
      return
    }

    setRemovingId(userId)
    try {
      await removeMember(groupId, userId)
      router.refresh()
    } catch (err: any) {
      alert(err.message || 'Failed to remove member')
      setRemovingId(null)
      setConfirmingId(null)
    }
  }

  return (
    <div>
      <div className="space-y-2">
        {members.map((member) => {
          const isCurrentUser = member.user_id === currentUserId
          const isConfirming = confirmingId === member.user_id
          const isRemoving = removingId === member.user_id

          return (
            <div
              key={member.id}
              className="flex items-center justify-between bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <MemberAvatar
                  email={member.email}
                  avatarUrl={member.avatar_url}
                  firstName={member.first_name}
                  lastName={member.last_name}
                  size="sm"
                />
                <div>
                  <span className="text-sm font-medium text-white">
                    {member.first_name && member.last_name
                      ? `${member.first_name} ${member.last_name}`
                      : member.first_name || member.email}
                  </span>
                  {isCurrentUser && (
                    <span className="ml-2 text-xs text-gray-500">(You)</span>
                  )}
                  {(member.first_name || member.last_name) && (
                    <p className="text-xs text-gray-500">{member.email}</p>
                  )}
                </div>
              </div>

              {isCreator && !isCurrentUser && (
                <div className="flex items-center gap-2">
                  {isConfirming ? (
                    <>
                      <button
                        onClick={() => handleRemove(member.user_id, member.email)}
                        disabled={isRemoving}
                        className="px-3 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded disabled:opacity-50"
                      >
                        {isRemoving ? 'Removing...' : 'Confirm'}
                      </button>
                      <button
                        onClick={() => setConfirmingId(null)}
                        disabled={isRemoving}
                        className="px-3 py-1 text-xs font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setConfirmingId(member.user_id)}
                      className="px-3 py-1 text-xs font-medium text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

