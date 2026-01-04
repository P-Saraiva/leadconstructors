"use client"

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function PromptForm({ inline }: { inline?: boolean }) {
  const { data: session } = useSession()
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  // On dashboard, if there is a cached prompt, auto-submit once logged in
  useEffect(() => {
    if (session?.user?.email) {
      const cached = localStorage.getItem('pendingPrompt')
      if (cached) {
        submitPrompt(cached)
        localStorage.removeItem('pendingPrompt')
      }
    }
  }, [session?.user?.email])

  async function submitPrompt(text: string) {
    if (!text.trim()) return
    setStatus('sending')
    setError(null)
    try {
      const res = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text.trim() })
      })
      if (!res.ok) throw new Error('Failed to submit prompt')
      setStatus('sent')
      setContent('')
    } catch (e: any) {
      setStatus('error')
      setError(e.message || 'Error submitting prompt')
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = content
    if (session?.user) {
      await submitPrompt(text)
    } else {
      localStorage.setItem('pendingPrompt', text)
      window.location.href = '/login'
    }
  }

  return (
    <form onSubmit={onSubmit} className={inline ? 'flex gap-2' : 'space-y-3 w-full max-w-xl'}>
      <label className="block text-sm font-medium">Tell us what you want to share with the world!</label>
      <textarea
        className="w-full rounded border border-slate-700 bg-slate-900 p-2"
        rows={3}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Your message or campaign description..."
        required
      />
      <div className="flex items-center gap-3">
        <button type="submit" className="button-primary" disabled={status==='sending'}>
          {status === 'sending' ? 'Sending…' : 'Send prompt'}
        </button>
        {status === 'sent' && <span className="text-green-400 text-sm">Saved!</span>}
        {error && <span className="text-red-400 text-sm">{error}</span>}
      </div>
    </form>
  )
}
