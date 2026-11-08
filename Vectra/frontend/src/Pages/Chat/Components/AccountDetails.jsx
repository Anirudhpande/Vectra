import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  PlusSquare,
  MessageSquare,
  KeyRound,
  Settings,
  LogOut,
  UserRound,
  Sparkles,
} from 'lucide-react'

import { useAuth } from '../../../context/AuthContext'
import  VectraLogo  from '../../../assets/VectraLogo.png'

const AccountDetails = ({ className = '', onNewChat }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const navItems = [
    {
      label: 'New chat',
      icon: PlusSquare,
      action: 'newchat',
    },
    {
      label: 'Conversations',
      icon: MessageSquare,
      to: '/chat',
    },
    {
      label: 'API keys',
      icon: KeyRound,
      to: '/credentials',
    },
    {
      label: 'Account',
      icon: UserRound,
      to: '/account',
    },
  ]

  const displayName =
    user?.name || user?.username || user?.email?.split('@')[0] || 'User'

  const displayInitial = displayName.charAt(0).toUpperCase()

  const handleItem = (item) => {
    if (item.action === 'newchat') {
      onNewChat?.()
      return
    }

    if (item.to) navigate(item.to)
  }

  const isActive = (item) => {
    if (item.action === 'newchat') return false
    if (item.to === '/chat') return location.pathname === '/chat'
    return location.pathname.startsWith(item.to)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <aside
      className={`flex h-full min-h-0 flex-col overflow-hidden bg-[#080808] ${className}`}
    >
      {/* BRAND */}
      <div className="flex h-[76px] shrink-0 items-center border-b border-white/[0.07] px-6">
        <img
          src={VectraLogo}
          alt="Vectra"
          className="h-8 w-auto object-contain"
        />
      </div>

      {/* NAVIGATION */}
      <div className="flex-1 overflow-y-auto px-3 py-6">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">
          Workspace
        </p>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item)

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => handleItem(item)}
                className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] transition ${
                  active
                    ? 'bg-white/[0.09] text-white'
                    : 'text-white/45 hover:bg-white/[0.05] hover:text-white/90'
                }`}
              >
                <Icon
                  size={16}
                  strokeWidth={1.7}
                  className={active ? 'text-white' : 'text-white/40 group-hover:text-white/80'}
                />

                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="my-6 border-t border-white/[0.07]" />

        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">
          Preferences
        </p>

        <button
          type="button"
          onClick={() => navigate('/account')}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] text-white/45 transition hover:bg-white/[0.05] hover:text-white/90"
        >
          <Settings size={16} strokeWidth={1.7} className="text-white/40" />
          Settings
        </button>
      </div>

      {/* PROFILE */}
      <div className="shrink-0 border-t border-white/[0.07] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.08] text-sm font-medium text-white">
            {displayInitial}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-white/85">
              {displayName}
            </p>
            <p className="truncate text-[10px] text-white/35">
              {user?.email || 'Vectra account'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Log out"
            className="rounded-lg p-2 text-white/30 transition hover:bg-white/[0.07] hover:text-white"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  )
}

export default AccountDetails