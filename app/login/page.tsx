"use client"

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl: '/dashboard',
    })

    if (result?.error) {
      setError('Invalid email or password')
      setLoading(false)
      return
    }

    window.location.assign(result?.url ?? '/dashboard')
  }

  const onGoogleLogin = () => {
    void signIn('google', { callbackUrl: '/dashboard' })
  }

  return (
    <main className="max-w-md mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Login</h1>
        <p className="text-slate-400">Access your account</p>
      </div>

      {error && <p className="text-red-400">{error}</p>}

      <form onSubmit={onSubmit} className="space-y-4">
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
          {loading ? 'Logging in…' : 'Login'}
        </button>
      </form>

      <div className="space-y-3">
        <button
          type="button"
          onClick={onGoogleLogin}
          className="button-secondary w-full"
        >
          Continue with Google
        </button>
        <p className="text-sm text-slate-400">
          New here? <Link href="/signup" className="text-blue-400 underline">Create an account</Link>
        </p>
      </div>
    </main>
  )
}
