import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { API_BASE } from '../config'
import { getCsrfHeaders } from '../lib/csrf'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)       // null = not loaded yet
  const [loading, setLoading] = useState(true)  // true while initial fetch
  const [error, setError] = useState('')

  const fetchUser = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_BASE}/api/me/account`, {
        credentials: 'include',
      })

      if (response.status === 401 || response.status === 403) {
        setUser(false) // explicitly not authenticated
        return
      }

      if (!response.ok) {
        setUser(null)
        setError('Unable to verify your session. Please try again.')
        return
      }

      const data = await response.json()
      setUser(data) // { provider, providerID, username, name, email }
    } catch {
      setUser(null)
      setError('Unable to reach the backend. Check that it is running and try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const logout = useCallback(async () => {
    try {
      const csrfHeaders = await getCsrfHeaders()
      const response = await fetch(`${API_BASE}/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: csrfHeaders,
      })

      if (!response.ok) {
        throw new Error('Sign out failed.')
      }

      setUser(false)
      window.location.href = '/login'
    } catch {
      setError('Unable to sign out. Please try again.')
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, error, logout, refetch: fetchUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
