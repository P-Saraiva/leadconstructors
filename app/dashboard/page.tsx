"use client"

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { getMockLeads } from '@/lib/leads'
import PromptForm from '@/components/prompt-form'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [leads, setLeads] = useState<Array<{ id: string; name: string; email: string }>>([])

  useEffect(() => {
    const load = async () => {
      if (session?.user?.email) {
        const res = await getMockLeads(session.user.email)
        setLeads(res)
      }
    }
    load()
  }, [session?.user?.email])

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
        </div>
        <button className="button-secondary" onClick={() => signOut({ callbackUrl: '/' })}>Logout</button>
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
    </main>
  )
}
