import '@/app/globals.css'
import type { ReactNode } from 'react'
import SessionProviderClient from '@/components/session-provider'

export const metadata = {
  title: 'LeadGen MVP',
  description: 'Simple lead delivery portal',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <SessionProviderClient>
          <div className="mx-auto max-w-4xl p-6">
            {children}
          </div>
        </SessionProviderClient>
      </body>
    </html>
  )
}
