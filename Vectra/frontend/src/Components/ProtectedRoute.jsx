import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Wraps any route that requires authentication.
 * - Shows a loading spinner while auth state is resolving.
 * - Redirects to /login if the user is not authenticated.
 * - Renders children once confirmed authenticated.
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading, error, refetch } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#09090E]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-indigo-500" />
          <p className="text-sm text-white/40">Loading…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#09090E] px-6 text-center text-white">
        <p className="text-sm text-red-300">{error}</p>
        <button
          type="button"
          onClick={refetch}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium transition hover:bg-indigo-500"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute
