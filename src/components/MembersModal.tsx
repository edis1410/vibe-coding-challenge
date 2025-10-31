'use client'

import MembersList from './MembersList'

interface Member {
  id: string
  user_id: string
  email: string
  first_name?: string | null
  last_name?: string | null
  avatar_url?: string | null
}

interface MembersModalProps {
  isOpen: boolean
  onClose: () => void
  members: Member[]
  groupId: string
  isCreator: boolean
  currentUserId: string
}

export default function MembersModal({
  isOpen,
  onClose,
  members,
  groupId,
  isCreator,
  currentUserId,
}: MembersModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            Group Members ({members.length})
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        <MembersList
          members={members}
          groupId={groupId}
          isCreator={isCreator}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  )
}

