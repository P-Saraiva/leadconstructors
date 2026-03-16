"use client"

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getMockLeads } from '@/lib/leads'
import PromptForm from '@/components/prompt-form'
import ChangePasswordModal from '@/components/change-password-modal'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [leads, setLeads] = useState<Array<{ id: string; name: string; email: string }>>([])
  const [showChangePw, setShowChangePw] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (session?.user?.email) {
        const res = await getMockLeads(session.user.email)
        setLeads(res)
      }
    }
    load()
  }, [session?.user?.email])

  // If unauthenticated, redirect to login (avoid indefinite loading)
  useEffect(() => {
    if (status === 'loading') return

    if (!session?.user) {
      router.replace('/login')
    }
  }, [status, session, router])

  if (status === 'loading') {
  return <main className="py-24">Loading…</main>
  }

  if (!session?.user) {
    return (
      <main className="space-y-4">
        <h1 className="text-2xl font-semibold">Unauthorized</h1>
        <p>Please <Link className="text-blue-400 underline" href="/login">login</Link> to continue.</p>
      </main>
    )
  }

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-slate-300">{session.user.name} · {session.user.email}</p>
          <div className="mt-2">
            <button className="button-secondary" onClick={() => setShowChangePw(true)}>Change password</button>
          </div>
        </div>
        <button className="button-secondary" onClick={() => signOut({ callbackUrl: `${window.location.origin}/` })}>Logout</button>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Your Leads</h2>
        {leads.length === 0 ? (
          <p className="text-slate-400">No leads yet. When your campaigns run, they will appear here.</p>
        ) : (
          <ul className="space-y-2">
            {leads.map((lead) => (
              <li key={lead.id} className="rounded border border-slate-700 p-3">
                <p className="font-medium">{lead.name}</p>
                <p className="text-slate-400 text-sm">{lead.email}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Share Your Prompt</h2>
        <PromptForm />
      </section>

      {showChangePw && (
        <ChangePasswordModal open={showChangePw} onClose={() => setShowChangePw(false)} />
      )}
    </main>
  )
}
