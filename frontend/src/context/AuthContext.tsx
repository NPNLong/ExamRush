import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { authApi, clearToken, getToken, setToken } from '../lib/api'
import type { User } from '../lib/types'

interface AuthCtx {
  user: User | null
  authLoading: boolean
  isAuthenticated: boolean
  login: (c: { username: string; password: string }) => Promise<User>
  register: (c: { username: string; password: string; display_name?: string }) => Promise<User>
  logout: () => void
}

const AuthContext = createContext<AuthCtx | null>(null)
const USER_KEY = 'examrush_user'

function readStoredUser(): User | null {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readStoredUser)
  const [authLoading, setAuthLoading] = useState(true)

  const store = useCallback((u: User | null) => {
    setUser(u)
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u))
    else localStorage.removeItem(USER_KEY)
  }, [])

  useEffect(() => {
    if (!getToken()) {
      store(null)
      setAuthLoading(false)
      return
    }
    authApi
      .me()
      .then(store)
      .catch(() => {
        clearToken()
        store(null)
      })
      .finally(() => setAuthLoading(false))
  }, [store])

  const login = useCallback(
    async (c: { username: string; password: string }) => {
      const res = await authApi.login(c)
      setToken(res.access_token)
      store(res.user)
      return res.user
    },
    [store],
  )

  const register = useCallback(
    async (c: { username: string; password: string; display_name?: string }) => {
      const res = await authApi.register(c)
      setToken(res.access_token)
      store(res.user)
      return res.user
    },
    [store],
  )

  const logout = useCallback(() => {
    clearToken()
    store(null)
  }, [store])

  const value = useMemo(
    () => ({ user, authLoading, isAuthenticated: Boolean(user), login, register, logout }),
    [user, authLoading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
