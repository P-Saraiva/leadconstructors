export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import NextAuth from 'next-auth'
import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { getPrisma } from '@/lib/db'
import { verifyUserCredentials } from '@/lib/credentials'

const prisma = getPrisma()

const config = {
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },

  callbacks: {
    async redirect({ url, baseUrl }) {
      try {
        const target = new URL(url, baseUrl)
        return `${baseUrl}${target.pathname}${target.search}${target.hash}`
      } catch {
        return baseUrl
      }
    },

    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },

    async session({ session, token }) {
      if (session.user) session.user.id = token.id as string
      return session
    }
  },

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },

      async authorize(credentials) {
        const email =
          typeof credentials?.email === 'string'
            ? credentials.email
            : undefined

        const password =
          typeof credentials?.password === 'string'
            ? credentials.password
            : undefined

        if (!email || !password) return null

        const user = await verifyUserCredentials(email, password)

        if (!user) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name
        }
      }
    })
  ]
} satisfies NextAuthConfig

export const { GET, POST } = NextAuth(config).handlers