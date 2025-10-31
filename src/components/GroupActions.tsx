'use client'

import { useState } from 'react'
import Link from 'next/link'
import DeleteGroupModal from './DeleteGroupModal'

interface GroupActionsProps {
  groupId: string
  groupName: string
  isCreator: boolean
}

export default function GroupActions({ groupId, groupName, isCreator }: GroupActionsProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  return (
    <>
      <div className="flex gap-2">
        <Link
          href={`/dashboard/groups/${groupId}/edit`}
          className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
        >
          ✏️ Edit Group
        </Link>
        {isCreator && (
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            🗑️ Delete Group
          </button>
        )}
      </div>

      {isCreator && (
        <DeleteGroupModal
          groupId={groupId}
          groupName={groupName}
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </>
  )
}

