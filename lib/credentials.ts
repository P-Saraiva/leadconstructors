import { getPrisma } from '@/lib/db'
import * as bcrypt from 'bcryptjs'

export async function verifyUserCredentials(email: string, password: string) {
  const prisma = getPrisma()
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.passwordHash) return null
  const match = await bcrypt.compare(password, user.passwordHash)
  if (!match) return null
  return user
}
