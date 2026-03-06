import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { api, setAuthToken } from '../api/client'
import { readAuth, writeAuth, type StoredAuth } from './authStorage'

type AuthContextValue = {
  auth: StoredAuth | null
  login: (email: string, password: string) => Promise<void>
  googleLogin: (credential: string, role?: 'customer' | 'owner') => Promise<void>
  register: (payload: { role: 'customer' | 'owner' | 'admin'; name: string; email: string; password: string }) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<StoredAuth | null>(() => {
    const existing = readAuth()
    setAuthToken(existing?.token ?? null)
    return existing
  })

  const logout = useCallback(() => {
    setAuth(null)
    writeAuth(null)
    setAuthToken(null)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post('/api/auth/login', { email, password })
    const next: StoredAuth = res.data
    setAuth(next)
    writeAuth(next)
    setAuthToken(next.token)
  }, [])

  const googleLogin = useCallback(async (credential: string, role: 'customer' | 'owner' = 'customer') => {
    const res = await api.post('/api/auth/google', { credential, role })
    const next: StoredAuth = res.data
    setAuth(next)
    writeAuth(next)
    setAuthToken(next.token)
  }, [])

  const register = useCallback(
    async (payload: { role: 'customer' | 'owner' | 'admin'; name: string; email: string; password: string }) => {
      const res = await api.post('/api/auth/register', payload)
      const next: StoredAuth = res.data
      setAuth(next)
      writeAuth(next)
      setAuthToken(next.token)
    },
    [],
  )

  const value = useMemo<AuthContextValue>(
    () => ({ auth, login, googleLogin, register, logout }),
    [auth, login, googleLogin, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
