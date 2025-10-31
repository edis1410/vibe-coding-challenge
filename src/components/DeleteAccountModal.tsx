'use client'

import { useState } from 'react'
import { deleteAccount } from '@/app/actions/profile'

interface DeleteAccountModalProps {
  email: string
  isOpen: boolean
  onClose: () => void
}

export default function DeleteAccountModal({ email, isOpen, onClose }: DeleteAccountModalProps) {
  const [confirmEmail, setConfirmEmail] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const isConfirmed = confirmEmail === email

  const handleDelete = async () => {
    if (!isConfirmed) return

    setDeleting(true)
    setError(null)

    try {
      await deleteAccount()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete account'
      setError(errorMessage)
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Delete Account
          </h2>
          <p className="text-gray-600 text-center">
            This action is permanent and cannot be undone
          </p>
        </div>

        <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="text-sm text-red-800 font-medium mb-2">
            This will permanently delete:
          </p>
          <ul className="text-sm text-red-700 space-y-1">
            <li>• Your user account and profile</li>
            <li>• All groups you created</li>
            <li>• All your expenses and settlements</li>
            <li>• Your membership in all groups</li>
            <li>• Your profile picture</li>
          </ul>
          <p className="text-sm text-red-800 font-medium mt-3">
            ⚠️ There is no way to recover this data!
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label htmlFor="confirmEmail" className="block text-sm font-medium text-gray-700 mb-2">
            Type your email <span className="font-bold">&quot;{email}&quot;</span> to confirm
          </label>
          <input
            id="confirmEmail"
            type="email"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder={email}
            autoComplete="off"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={deleting}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!isConfirmed || deleting}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {deleting ? 'Deleting...' : 'Delete My Account'}
          </button>
        </div>
      </div>
    </div>
  )
}


