import { auth } from '@/app/api/auth/[...nextauth]/route'

export function getAuthSession() {
  return auth()
}