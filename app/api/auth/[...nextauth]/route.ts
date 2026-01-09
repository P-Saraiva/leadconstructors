export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import NextAuth from 'next-auth'
import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { getPrisma } from '@/lib/db'

// Use NextAuth v5 "handlers" API for App Router
function getAuthHandlers() {
  const prisma = getPrisma()
  const options = {
    adapter: PrismaAdapter(prisma),
    session: { strategy: 'jwt' as const },
    pages: { signIn: '/login' },
    callbacks: {
      async jwt({ token, user }: any) {
        if (user) token.id = (user as any).id
        return token
      },
      async session({ session, token }: any) {
        if (session.user) (session.user as any).id = token.id
        return session
      }
    },
    providers: [
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID ?? '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      }),
      Credentials({
        name: 'Credentials',
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', type: 'password' }
        },
        async authorize(credentials) {
          const email = typeof credentials?.email === 'string' ? credentials.email : undefined
          const password = typeof credentials?.password === 'string' ? credentials.password : undefined
          if (!email || !password) return null
          const { verifyUserCredentials } = await import('@/lib/credentials')
          const user = await verifyUserCredentials(email, password)
          if (!user) return null
          return { id: user.id, email: user.email, name: user.name }
        }
      })
    ]
  } satisfies NextAuthConfig
  return NextAuth(options).handlers
}

export async function GET(req: Request, ctx: any) {
  const { GET } = getAuthHandlers()
  return GET(req as any)
}

export async function POST(req: Request, ctx: any) {
  const { POST } = getAuthHandlers()
  return POST(req as any)
}
