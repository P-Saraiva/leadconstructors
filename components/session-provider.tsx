"use client"

import { SessionProvider } from "next-auth/react"
import type { ReactNode } from "react"

export default function SessionProviderClient({
  children,
}: {
  children: ReactNode
}) {
  return (
    <SessionProvider
      refetchOnWindowFocus={true}
      refetchInterval={0}
    >
      {children}
    </SessionProvider>
  )
}