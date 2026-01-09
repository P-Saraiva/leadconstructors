export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { getPrisma } from '@/lib/db'
import { getToken } from 'next-auth/jwt'
import { z } from 'zod'

const schema = z.object({ content: z.string().min(1).max(4000) })

export async function POST(req: Request) {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
  const token = await getToken({ req, secret })
  if (!token?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid content' }, { status: 400 })
  }
  const prisma = getPrisma()
  const prompt = await prisma.prompt.create({
    data: { userId: token.sub, content: parsed.data.content }
  })
  return NextResponse.json({ id: prompt.id })
}
