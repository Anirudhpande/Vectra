import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  PlusSquare,
  MessageSquare,
  Key,
  Settings,
  LogOut,
  User,
} from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'

const navItems = [
  { label: 'New Chat', icon: PlusSquare, action: 'newchat' },
  { label: 'Messages', icon: MessageSquare, to: '/chat' },
  { label: 'API Keys', icon: Key, to: '/credentials' },
  { label: 'Account', icon: User, to: '/account' },
  { label: 'Settings', icon: Settings, to: '/account' },
]

export const AccountDetails = ({ className = '', onNewConversation }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const displayName = user?.name || user?.username || 'User'
  const displayInitial = displayName.charAt(0).toUpperCase()

  const handleItem = (item) => {
    if (item.action === 'newchat') {
      onNewConversation?.()
    } else if (item.to) {
      navigate(item.to)
    }
  }

  const isActive = (item) => {
    if (item.action === 'newchat') return false
    return item.to && location.pathname.startsWith(item.to)
  }

  return (
    <aside
      className={`flex h-screen flex-col overflow-hidden bg-[#0E0F17] border-r border-white/[0.05] ${className}`}
    >
      {/* Top — Vectra logo + provider accent bar */}
      <div className="shrink-0 px-4 pt-5 pb-4">
        <span className="block text-lg font-bold tracking-tight text-white">Vectra</span>
        {user?.provider && (
          <span className="mt-0.5 inline-block rounded-full bg-indigo-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-indigo-400">
            {user.provider}
          </span>
        )}
      </div>

      <div className="mx-4 h-px bg-white/[0.05]" />

      {/* Avatar + name */}
      <div className="flex shrink-0 flex-col items-center px-4 py-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/20 text-xl font-semibold text-indigo-300">
          {displayInitial}
        </div>
        <p className="mt-3 text-center text-sm font-medium text-white/90 leading-tight">
          {displayName}
        </p>
        {user?.email && (
          <p className="mt-0.5 text-center text-[11px] text-white/30 leading-tight truncate max-w-full px-1">
            {user.email}
          </p>
        )}
      </div>

      <div className="mx-4 h-px bg-white/[0.05]" />

      {/* Nav items */}
      <nav className="mt-3 flex flex-col gap-0.5 px-2 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item)
          return (
            <button
              key={item.label}
              onClick={() => handleItem(item)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                active
                  ? 'bg-indigo-600/20 text-indigo-300'
                  : 'text-white/50 hover:bg-white/[0.05] hover:text-white/90'
              }`}
            >
              <Icon size={17} className="shrink-0" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Logout at bottom */}
      <div className="shrink-0 px-2 pb-4 pt-2">
        <div className="mx-2 h-px bg-white/[0.05] mb-2" />
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/30 transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut size={17} className="shrink-0" />
          <span className="text-xs font-medium">Sign out</span>
        </button>
      </div>
    </aside>
  )
}