export type StoredAuth = {
  token: string
  user: { id: string; role: 'customer' | 'owner' | 'admin'; name: string; email: string; verified: boolean }
}

const KEY = 'oyo_auth'

export function readAuth(): StoredAuth | null {
  const raw = localStorage.getItem(KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredAuth
  } catch {
    return null
  }
}

export function writeAuth(auth: StoredAuth | null) {
  if (!auth) localStorage.removeItem(KEY)
  else localStorage.setItem(KEY, JSON.stringify(auth))
}
