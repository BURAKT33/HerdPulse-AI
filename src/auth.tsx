import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'

const STORAGE_KEY = 'herdpulse.demo.session'

export const DEMO_CREDENTIALS = {
  email: 'investor@herdpulse.ai',
  password: 'demo2026',
} as const

type Session = { email: string; name: string }

type AuthContextValue = {
  session: Session | null
  login: (email: string, password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => readSession())

  useEffect(() => {
    if (session) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    else sessionStorage.removeItem(STORAGE_KEY)
  }, [session])

  const login = (email: string, password: string) => {
    const ok =
      email.trim().toLowerCase() === DEMO_CREDENTIALS.email &&
      password === DEMO_CREDENTIALS.password
    if (!ok) return false
    setSession({ email: DEMO_CREDENTIALS.email, name: 'HerdPulse Demo' })
    return true
  }

  const logout = () => setSession(null)

  return <AuthContext.Provider value={{ session, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const location = useLocation()
  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return children
}
