import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { MessageSquare, Key, User, Store, LogOut, Menu, X } from 'lucide-react'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/marketplace', label: 'Marketplace' },
  { to: '/chat', label: 'Chat', icon: MessageSquare, protected: true },
  { to: '/credentials', label: 'API Keys', icon: Key, protected: true },
  { to: '/account', label: 'Account', icon: User, protected: true },
]

const Navbar = () => {
  const { user, loading, logout } = useAuth()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/'
    return location.pathname.startsWith(to)
  }

  const visibleLinks = navLinks.filter((l) => !l.protected || user)

  return (
    <nav className="absolute top-0 left-0 z-50 w-full">
      <div className="flex flex-col">
        <div className="flex w-full items-center justify-between px-6 py-3">

          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold tracking-tight text-white transition-opacity hover:opacity-80"
          >
            Vectra
          </Link>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-1 md:flex">
            {visibleLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? 'bg-white/[0.08] text-white'
                    : 'text-white/50 hover:bg-white/[0.05] hover:text-white/90'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side — auth actions */}
          <div className="hidden items-center gap-3 md:flex">
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/10 border-t-indigo-500" />
            ) : user ? (
              <>
                <span className="text-sm text-white/40">
                  {user.name || user.username || user.email}
                </span>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs text-white/50 transition hover:border-white/20 hover:text-white"
                >
                  <LogOut size={13} />
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-500 active:scale-95"
              >
                Sign in
              </Link>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="rounded-lg p-2 text-white/50 hover:text-white md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Border line */}
        <div className="h-px w-full bg-white/[0.06]" />

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="border-b border-white/[0.06] bg-[#09090E]/95 px-6 py-4 backdrop-blur-sm md:hidden">
            <div className="flex flex-col gap-2">
              {visibleLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive(link.to)
                      ? 'bg-white/[0.08] text-white'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {user && (
                <button
                  onClick={() => { setMobileOpen(false); logout() }}
                  className="mt-2 rounded-lg border border-white/[0.08] px-3 py-2 text-left text-sm text-white/40 hover:text-white"
                >
                  Sign out
                </button>
              )}
              {!user && !loading && (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 rounded-lg bg-indigo-600 px-3 py-2 text-center text-sm font-medium text-white"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar