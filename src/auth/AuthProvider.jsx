import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiFetch, clearToken, getToken, setToken } from '../api/client'
import { AuthContext } from './context'

const LOADING = 'loading'
const ANONYMOUS = 'anonymous'
const AUTHENTICATED = 'authenticated'

export default function AuthProvider({ children }) {
  const [status, setStatus] = useState(() => (getToken() ? LOADING : ANONYMOUS))
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (!getToken()) {
      return undefined
    }
    let cancelled = false
    apiFetch('/api/v1/auth/me')
      .then((me) => {
        if (cancelled) {
          return
        }
        setUser(me)
        setStatus(AUTHENTICATED)
      })
      .catch(() => {
        if (cancelled) {
          return
        }
        clearToken()
        setUser(null)
        setStatus(ANONYMOUS)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const token = await apiFetch('/api/v1/auth/login', {
      method: 'POST',
      auth: false,
      body: { email, password },
    })
    setToken(token.access_token)
    try {
      const me = await apiFetch('/api/v1/auth/me')
      setUser(me)
      setStatus(AUTHENTICATED)
      return me
    } catch (exception) {
      clearToken()
      setUser(null)
      setStatus(ANONYMOUS)
      throw exception
    }
  }, [])

  const register = useCallback(
    async (email, password) => {
      await apiFetch('/api/v1/auth/register', {
        method: 'POST',
        auth: false,
        body: { email, password },
      })
      return login(email, password)
    },
    [login],
  )

  const logout = useCallback(async () => {
    try {
      await apiFetch('/api/v1/auth/logout', { method: 'POST' })
    } catch {
      // токен всё равно удаляем: выход не должен зависеть от доступности сервера
    }
    clearToken()
    setUser(null)
    setStatus(ANONYMOUS)
  }, [])

  const value = useMemo(
    () => ({ status, user, login, register, logout }),
    [status, user, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
