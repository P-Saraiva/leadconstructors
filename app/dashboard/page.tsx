import { getAuthSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DashboardClient from '@/components/dashboard-client'

export default async function DashboardPage() {
  const session = await getAuthSession()

  if (!session?.user) {
    redirect('/login')
  }

  return <DashboardClient session={session} />
}
