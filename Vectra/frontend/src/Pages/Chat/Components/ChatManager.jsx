
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Search,
  SlidersHorizontal,
  Plus,
  Bot,
  Clock3,
  MessageSquare,
} from 'lucide-react'
import { API_BASE } from '../../../config'

const ChatManager = ({
  className = '',
  activeConversation,
  onSelectConversation,
  onNewConversation,
}) => {
  const [conversations, setConversations] = useState([])
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('All')
  const [newestFirst, setNewestFirst] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadConversations = useCallback(async () => {
    try {
      setError('')

      const response = await fetch(`${API_BASE}/api/chats`, {
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to load conversations.')
      }

      const list = Array.isArray(data) ? data : []

      setConversations(
        list.map((item) => ({
          ...item,
          id: item.id ?? item.conversationId,
          title: item.summary || 'New conversation',
          subtitle: `${item.messageCount ?? 0} messages`,
          persisted: true,
          updatedAt: item.updatedAt ?? item.createdAt,
        })),
      )
    } catch (err) {
      setError(err.message || 'Could not load conversation history.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  // Add a conversation after the first successful backend response.
  useEffect(() => {
    if (!activeConversation?.persisted || !activeConversation.id) return

    setConversations((previous) => {
      const exists = previous.some((item) => item.id === activeConversation.id)

      const updated = {
        ...activeConversation,
        subtitle: activeConversation.subtitle || 'Conversation saved',
        persisted: true,
      }

      return exists
        ? previous.map((item) =>
            item.id === updated.id ? { ...item, ...updated } : item,
          )
        : [updated, ...previous]
    })
  }, [activeConversation])

  const filteredConversations = useMemo(() => {
    let result = [...conversations]

    if (search.trim()) {
      const query = search.toLowerCase()

      result = result.filter((item) =>
        `${item.title} ${item.subtitle}`.toLowerCase().includes(query),
      )
    }

    if (activeTab === 'Recent') {
      result = result.filter((item) => {
        const timestamp = item.updatedAt
          ? new Date(item.updatedAt).getTime()
          : 0

        return timestamp && Date.now() - timestamp < 7 * 24 * 60 * 60 * 1000
      })
    }

    result.sort((a, b) => {
      const first = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
      const second = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
      return newestFirst ? second - first : first - second
    })

    return result
  }, [conversations, search, activeTab, newestFirst])

  const deleteConversation = async (event, conversation) => {
    event.stopPropagation()

    if (!conversation.persisted || !conversation.id) return

    try {
      const response = await fetch(
        `${API_BASE}/api/chats/${encodeURIComponent(conversation.id)}`,
        {
          method: 'DELETE',
          credentials: 'include',
        },
      )

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.message || 'Failed to delete conversation.')
      }

      setConversations((previous) =>
        previous.filter((item) => item.id !== conversation.id),
      )

      if (activeConversation?.id === conversation.id) {
        onNewConversation?.()
      }
    } catch (err) {
      setError(err.message || 'Could not delete conversation.')
    }
  }

  const tabs = ['All', 'Recent']

  return (
    <aside
      className={`flex h-full min-h-0 flex-col overflow-hidden bg-[#0A0B12] border-r border-white/[0.05] p-3 ${className}`}
    >
      <div className="flex shrink-0 items-center gap-2 rounded-xl bg-white/[0.04] border border-white/[0.05] px-3 py-2.5">
        <Search size={18} className="shrink-0 text-[#9298AD]" />

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search conversations..."
          className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-[#9298AD]"
        />

        <button
          type="button"
          onClick={() => setNewestFirst((value) => !value)}
          title={newestFirst ? 'Oldest first' : 'Newest first'}
          aria-label="Change sorting"
          className="text-[#9298AD] hover:text-white"
        >
          <SlidersHorizontal size={18} />
        </button>
      </div>

      <div className="mt-4 flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 pb-1 text-xs font-medium ${
                activeTab === tab
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-white/35 hover:text-white/70'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            setSearch('')
            setActiveTab('All')
            onNewConversation?.()
          }}
          title="New conversation"
          aria-label="New conversation"
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95 transition"
        >
          <Plus size={15} />
        </button>
      </div>

      {error && (
        <p className="mt-3 text-xs text-red-400">{error}</p>
      )}

      <div className="mt-3 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
        {loading ? (
          <p className="px-2 py-5 text-sm text-[#9298AD]">
            Loading conversations...
          </p>
        ) : filteredConversations.length ? (
          filteredConversations.map((conversation) => {
            const selected = activeConversation?.id === conversation.id

            return (
              <div
                key={conversation.id}
                className={`group flex shrink-0 items-center gap-3 rounded-xl p-3 transition cursor-pointer ${
                  selected
                    ? 'bg-indigo-600/15 ring-1 ring-indigo-500/40'
                    : 'bg-white/[0.03] hover:bg-white/[0.06]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectConversation?.(conversation)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
                    <Bot size={16} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium text-white/80">
                      {conversation.title}
                    </span>
                    <span className="mt-0.5 block truncate text-[10px] text-white/35">
                      {conversation.subtitle}
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={(event) => deleteConversation(event, conversation)}
                  title="Delete conversation"
                  aria-label={`Delete ${conversation.title}`}
                  className="hidden shrink-0 rounded-md p-1 text-white/25 hover:bg-red-500/15 hover:text-red-400 group-hover:block"
                >
                  <span className="text-xs">Delete</span>
                </button>
              </div>
            )
          })
        ) : (
          <div className="px-3 py-10 text-center">
            <MessageSquare size={20} className="mx-auto mb-2 text-white/15" />
            <p className="text-xs text-white/25">{search ? 'No matching conversations.' : 'No conversations yet.'}</p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={loadConversations}
        className="mt-3 flex shrink-0 items-center justify-center gap-2 py-2 text-xs text-white/20 hover:text-white/60 transition"
      >
        <Clock3 size={12} />
        Refresh
      </button>
    </aside>
  )
}

export default ChatManager
