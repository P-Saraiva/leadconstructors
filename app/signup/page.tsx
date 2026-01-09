"use client"

import { useState } from 'react'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': '1',
        },
        body: JSON.stringify({ email, name, password })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to sign up')
      }
      // redirect to login
      window.location.href = '/login'
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-md mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Create account</h1>
        <p className="text-slate-400">Sign up to access your leads</p>
      </div>

      {error && <p className="text-red-400">{error}</p>}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm">Name</label>
          <input
            type="text"
            className="w-full rounded border border-slate-700 bg-slate-900 p-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm">Email</label>
          <input
            type="email"
            className="w-full rounded border border-slate-700 bg-slate-900 p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm">Password</label>
          <input
            type="password"
            className="w-full rounded border border-slate-700 bg-slate-900 p-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="button-primary w-full" disabled={loading}>
          {loading ? 'Creating…' : 'Create account'}
        </button>
      </form>

      <p className="text-sm text-slate-400">
        Already have an account? <Link href="/login" className="text-blue-400 underline">Login</Link>
      </p>
    </main>
  )
}
