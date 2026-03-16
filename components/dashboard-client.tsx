"use client"

import type { Session } from 'next-auth'
import { useEffect, useState } from 'react'
import { signOut } from 'next-auth/react'
import { getMockLeads } from '@/lib/leads'
import PromptForm from '@/components/prompt-form'
import ChangePasswordModal from '@/components/change-password-modal'

type DashboardClientProps = {
  session: Session
}

export default function DashboardClient({ session }: DashboardClientProps) {
  const [leads, setLeads] = useState<Array<{ id: string; name: string; email: string }>>([])
  const [showChangePw, setShowChangePw] = useState(false)
  const user = session.user!

  useEffect(() => {
    const load = async () => {
      if (!user.email) return
      const res = await getMockLeads(user.email)
      setLeads(res)
    }
    load()
  }, [user.email])

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-slate-300">
            {user.name} · {user.email}
          </p>

          <div className="mt-2">
            <button
              className="button-secondary"
              onClick={() => setShowChangePw(true)}
            >
              Change password
            </button>
          </div>
        </div>

        <button
          className="button-secondary"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          Logout
        </button>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Your Leads</h2>

        {leads.length === 0 ? (
          <p className="text-slate-400">
            No leads yet. When your campaigns run, they will appear here.
          </p>
        ) : (
          <ul className="space-y-2">
            {leads.map((lead) => (
              <li
                key={lead.id}
                className="rounded border border-slate-700 p-3"
              >
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
        <ChangePasswordModal
          open={showChangePw}
          onClose={() => setShowChangePw(false)}
        />
      )}
    </main>
  )
}