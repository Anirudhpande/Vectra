
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Plus,
  MessageSquare,
  Trash2,
  ArrowDownUp,
  RefreshCw,
  MessageCircle,
  UserRound,
} from 'lucide-react'

import { API_BASE } from '../../../config'
import { getCsrfHeaders } from '../../../lib/csrf'
import { useAuth } from '../../../context/AuthContext'

const ChatManager = ({
  className = '',
  activeConversation,
  onNewConversation,
  onSelectConversation,
  onConversationTitleUpdate,
}) => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const [conversations, setConversations] = useState([])
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('All')
  const [newestFirst, setNewestFirst] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const displayName = user?.name || user?.username || 'User'
  const displayEmail = user?.email || ''
  const displayInitial = displayName.charAt(0).toUpperCase()

  // Load conversations from backend
  const loadConversations = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true)
        setError('')
      }

      const response = await fetch(`${API_BASE}/api/chats`, {
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || data.error || 'Failed to load conversations.',
        )
      }

      const list = (Array.isArray(data) ? data : []).map((item) => ({
        ...item,
        id: item.id ?? item.conversationId,
        title: item.title || 'New conversation',
        subtitle: item.subtitle || (
          item.messageCount != null
            ? `${item.messageCount} messages`
            : 'Conversation'
        ),
        persisted: true,
        updatedAt: item.updatedAt || item.createdAt || '',
      }))

      setConversations(list)

      return list
    } catch (err) {
      if (!silent) {
        setError(err.message || 'Could not load conversations.')
      }

      return null
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }, [])

  // Initial conversation loading
  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  // Automatically check for AI-generated conversation titles
  useEffect(() => {
    if (
      !activeConversation?.persisted ||
      activeConversation.title !== 'New conversation'
    ) {
      return
    }

    let cancelled = false
    let timeoutId

    const startedAt = Date.now()

    const pollForTitle = async () => {
      const list = await loadConversations({ silent: true })

      if (cancelled) return

      const updatedConversation = list?.find(
        (item) => item.id === activeConversation.id,
      )

      if (
        updatedConversation?.title &&
        updatedConversation.title !== 'New conversation'
      ) {
        onConversationTitleUpdate?.(updatedConversation)
        return
      }

      // Stop polling after 90 seconds
      if (Date.now() - startedAt < 90000) {
        timeoutId = setTimeout(pollForTitle, 3000)
      }
    }

    timeoutId = setTimeout(pollForTitle, 3000)

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [
    activeConversation?.id,
    activeConversation?.persisted,
    activeConversation?.title,
    loadConversations,
    onConversationTitleUpdate,
  ])

  // Keep the list updated when a new conversation is saved
  useEffect(() => {
    if (!activeConversation?.persisted) return

    setConversations((previous) => {
      const exists = previous.some(
        (item) => item.id === activeConversation.id,
      )

      if (exists) {
        return previous.map((item) =>
          item.id === activeConversation.id
            ? { ...item, ...activeConversation }
            : item,
        )
      }

      return [activeConversation, ...previous]
    })
  }, [activeConversation])

  // Delete a conversation
  const deleteConversation = async (id) => {
    const confirmed = window.confirm(
      'Delete this conversation? This cannot be undone.',
    )

    if (!confirmed) return

    try {
      const csrfHeaders = await getCsrfHeaders()

      const response = await fetch(
        `${API_BASE}/api/chats/${encodeURIComponent(id)}`,
        {
          method: 'DELETE',
          credentials: 'include',
          headers: csrfHeaders,
        },
      )

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))

        throw new Error(
          data.message || data.error || 'Could not delete conversation.',
        )
      }

      setConversations((previous) =>
        previous.filter((item) => item.id !== id),
      )

      if (activeConversation?.id === id) {
        onNewConversation?.()
      }
    } catch (err) {
      setError(err.message || 'Could not delete conversation.')
    }
  }

  // Search, filter and sort conversations
  const filteredConversations = useMemo(() => {
    let result = [...conversations]

    if (search.trim()) {
      const query = search.toLowerCase()

      result = result.filter((item) =>
        `${item.title} ${item.subtitle}`.toLowerCase().includes(query),
      )
    }

    if (activeTab === 'Recent') {
      result = result.slice(0, 10)
    }

    result.sort((a, b) => {
      const first = new Date(a.updatedAt || 0).getTime()
      const second = new Date(b.updatedAt || 0).getTime()

      return newestFirst ? second - first : first - second
    })

    return result
  }, [conversations, search, activeTab, newestFirst])

  const isActive = (item) =>
    activeConversation?.id === item.id

  // Navigate to account page when profile is clicked
  const handleProfileClick = () => {
    navigate('/account')
  }

  // Logout
  const handleLogout = async (event) => {
    event.stopPropagation()

    try {
      await logout()
      navigate('/login')
    } catch (err) {
      setError('Could not log out. Please try again.')
    }
  }

  return (
    <aside
      className={`flex h-full min-h-0 flex-col overflow-hidden bg-[#0A0A0A] ${className}`}
    >
      {/* BRAND */}
      <div className="flex h-[76px] shrink-0 items-center border-b border-white/[0.07] px-6">
        <span className="text-lg font-semibold tracking-[0.16em] text-white">
          VECTRA
        </span>
      </div>

      {/* SIDEBAR HEADER */}
      <div className="shrink-0 border-b border-white/[0.07] px-5 pb-5 pt-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">
              Your workspace
            </p>

            <h2 className="mt-1 text-lg font-medium tracking-tight text-white/90">
              Conversations
            </h2>
          </div>

          <button
            type="button"
            onClick={() => loadConversations()}
            title="Refresh conversations"
            className="rounded-lg p-2 text-white/30 transition hover:bg-white/[0.06] hover:text-white"
          >
            <RefreshCw size={15} />
          </button>
        </div>

        {/* NEW CONVERSATION */}
        <button
          type="button"
          onClick={onNewConversation}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-xs font-semibold text-black transition hover:bg-white/85 active:scale-[0.99]"
        >
          <Plus size={15} />
          New conversation
        </button>

        {/* SEARCH */}
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 py-2.5 transition focus-within:border-white/25">
          <Search size={15} className="shrink-0 text-white/30" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search conversations..."
            className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/25"
          />
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-5 py-3">
        <div className="flex items-center gap-1">
          {['All', 'Recent'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-md px-3 py-1.5 text-[11px] transition ${
                activeTab === tab
                  ? 'bg-white/[0.09] text-white'
                  : 'text-white/35 hover:text-white/75'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setNewestFirst((previous) => !previous)}
          title="Change sort order"
          className="rounded-md p-1.5 text-white/30 transition hover:bg-white/[0.06] hover:text-white/80"
        >
          <ArrowDownUp size={14} />
        </button>
      </div>

      {/* CONVERSATION LIST */}
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {error && (
          <p className="mb-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
            {error}
          </p>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-xs text-white/30">
            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/10 border-t-white/70" />
            Loading conversations
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center px-4 py-12 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/40">
              <MessageCircle size={17} />
            </div>

            <p className="text-xs font-medium text-white/65">
              {search ? 'No matching conversations' : 'Nothing here yet'}
            </p>

            <p className="mt-1 text-[10px] leading-relaxed text-white/30">
              {search
                ? 'Try another search term.'
                : 'Your conversations will appear here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredConversations.map((item) => {
              const active = isActive(item)

              return (
                <div
                  key={item.id}
                  className={`group relative flex items-start gap-3 rounded-lg px-3 py-3 transition ${
                    active
                      ? 'bg-white/[0.09]'
                      : 'hover:bg-white/[0.045]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectConversation?.(item)}
                    className="flex min-w-0 flex-1 items-start gap-3 text-left"
                  >
                    <div
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                        active
                          ? 'border-white/15 bg-white/[0.09] text-white'
                          : 'border-white/[0.06] bg-white/[0.025] text-white/40'
                      }`}
                    >
                      <MessageSquare size={14} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate text-xs font-medium ${
                          active ? 'text-white' : 'text-white/70'
                        }`}
                      >
                        {item.title}
                      </p>

                      <p className="mt-1 truncate text-[10px] text-white/30">
                        {item.subtitle}
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteConversation(item.id)}
                    title="Delete conversation"
                    className="shrink-0 rounded-md p-1.5 text-white/20 opacity-0 transition hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100 focus:opacity-100"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* PROFILE FOOTER */}
      <div className="shrink-0 border-t border-white/[0.08] p-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleProfileClick}
            className="group flex min-w-0 flex-1 items-center gap-3 rounded-xl p-2 text-left transition hover:bg-white/[0.06]"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.08] text-sm font-medium text-white">
              {displayInitial}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white/85">
                {displayName}
              </p>

              <p className="truncate text-[10px] text-white/35">
                {displayEmail}
              </p>
            </div>

            <UserRound
              size={15}
              className="shrink-0 text-white/30 transition group-hover:text-white/80"
            />
          </button>

          <button
            type="button"
            onClick={handleLogout}
            title="Log out"
            className="shrink-0 rounded-lg p-2 text-white/30 transition hover:bg-white/[0.07] hover:text-white"
          >
            <LogOutIcon />
          </button>
        </div>
      </div>
    </aside>
  )
}

const LogOutIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  )
}

export default ChatManager
