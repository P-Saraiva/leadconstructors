export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0
import { NextResponse } from 'next/server'
import { getPrisma } from '@/lib/db'
import { getToken } from 'next-auth/jwt'
import { verifyAccessToken, hasScope } from '@/lib/oauth2'
import { z } from 'zod'
import * as bcrypt from 'bcryptjs'

// Schema for session-based (frontend) requests
const sessionSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).max(128),
})

// Schema for OAuth2 (cURL) requests – Microsoft Graph-style body
const oauth2Schema = z.object({
  passwordProfile: z.object({
    forceChangePasswordNextSignIn: z.boolean().optional(),
    password: z.string().min(8).max(128),
  }),
})

const REQUIRED_SCOPE = 'user.password.write'

// ── Helpers ─────────────────────────────────────────────────────────────

/** Extract Bearer token from Authorization header */
function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.get('authorization') || ''
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim()
  }
  return null
}

/**
 * Resolve the user id from either:
 *   1. A session JWT (next-auth) – for frontend calls
 *   2. A Bearer OAuth2 access-token – for external/cURL calls
 *
 * Returns `{ userId, via }` or a NextResponse error.
 */
async function resolveAuth(req: Request): Promise<
  | { userId: string; via: 'session' | 'oauth2' }
  | NextResponse
> {
  // 1. Try OAuth2 Bearer token first
  const bearer = extractBearerToken(req)
  if (bearer) {
    try {
      const payload = await verifyAccessToken(bearer)
      if (!hasScope(payload, REQUIRED_SCOPE)) {
        return NextResponse.json(
          { error: 'insufficient_scope', error_description: `Requires scope: ${REQUIRED_SCOPE}` },
          { status: 403 },
        )
      }
      // For OAuth2 calls, the target user id must be provided in the URL
      // query string (?userId=...) or defaults to the client subject.
      const url = new URL(req.url)
      const userId = url.searchParams.get('userId') || payload.sub
      return { userId, via: 'oauth2' }
    } catch {
      return NextResponse.json({ error: 'invalid_token' }, { status: 401 })
    }
  }

  // 2. Fall back to next-auth session JWT
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
  const sessionToken = await getToken({ req, secret })
  if (!sessionToken?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return { userId: sessionToken.sub, via: 'session' }
}

// ── PATCH handler (primary – used by cURL / OAuth2 and frontend) ────────

export async function PATCH(req: Request) {
  const auth = await resolveAuth(req)
  if (auth instanceof NextResponse) return auth

  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const prisma = getPrisma()
  const user = await prisma.user.findUnique({ where: { id: auth.userId } })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // ── OAuth2 path: passwordProfile body ───────────────────────────────
  if (auth.via === 'oauth2') {
    const parsed = oauth2Schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    const newHash = await bcrypt.hash(parsed.data.passwordProfile.password, 10)
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    })
    return NextResponse.json({ ok: true })
  }

  // ── Session path: currentPassword + newPassword body ────────────────
  const parsed = sessionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  if (user.passwordHash) {
    const ok = await bcrypt.compare(parsed.data.currentPassword || '', user.passwordHash)
    if (!ok) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 403 })
    }
  }

  const newHash = await bcrypt.hash(parsed.data.newPassword, 10)
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  })

  return NextResponse.json({ ok: true })
}

// ── POST handler (kept for backward-compat, delegates to PATCH) ─────────

export async function POST(req: Request) {
  return PATCH(req)
}
