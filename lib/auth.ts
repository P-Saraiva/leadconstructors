import { auth } from './nextauth'

export function getAuthSession() {
  return auth()
}