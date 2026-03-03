"use client"

import { useState } from 'react'

export default function ChangePasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!open) return null

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/account/change-password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': '1',
        },
        body: JSON.stringify({ currentPassword, newPassword })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Failed to change password')
      } else {
        setSuccess(true)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch (e: any) {
      setError(e.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-md border border-slate-700 bg-slate-900 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Change Password</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>
        <p className="text-sm text-slate-400 mb-3">Enter your current password and your new password.</p>
        {error && <p className="text-red-400 mb-2">{error}</p>}
        {success && <p className="text-green-400 mb-2">Password updated successfully.</p>}
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm">Current password</label>
            <input
              type="password"
              className="w-full rounded border border-slate-700 bg-slate-800 p-2"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="block text-sm">New password</label>
            <input
              type="password"
              className="w-full rounded border border-slate-700 bg-slate-800 p-2"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="block text-sm">Confirm new password</label>
            <input
              type="password"
              className="w-full rounded border border-slate-700 bg-slate-800 p-2"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" className="button-primary" disabled={loading}>
              {loading ? 'Updating…' : 'Update password'}
            </button>
            <button type="button" className="button-secondary" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
