export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0
import { NextResponse } from 'next/server'
import { getPrisma } from '@/lib/db'
import { getToken } from 'next-auth/jwt'
import { z } from 'zod'
import * as bcrypt from 'bcryptjs'

const schema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).max(128)
})

export async function POST(req: Request) {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
  const token = await getToken({ req, secret })
  if (!token?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const prisma = getPrisma()
  const user = await prisma.user.findUnique({ where: { id: token.sub } })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // If user has an existing passwordHash, verify current password
  if (user.passwordHash) {
    const ok = await bcrypt.compare(parsed.data.currentPassword || '', user.passwordHash)
    if (!ok) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 403 })
    }
  }

  const newHash = await bcrypt.hash(parsed.data.newPassword, 10)
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash }
  })

  return NextResponse.json({ ok: true })
}
