
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
// export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
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

      const response = await fetch(`${API_BASE}/api/chats`)
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
        { method: 'DELETE' },
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
      className={`flex h-full min-h-0 flex-col overflow-hidden bg-[#242433] p-3 ${className}`}
    >
      <div className="flex shrink-0 items-center gap-2 rounded-xl bg-[#2A2D3E] px-3 py-3">
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
              className={`border-b-2 pb-1 text-sm ${
                activeTab === tab
                  ? 'border-[#F53659] text-white'
                  : 'border-transparent text-[#9298AD] hover:text-white'
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
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F53659] text-white hover:bg-[#FF4969]"
        >
          <Plus size={19} />
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
                className={`group flex shrink-0 items-center gap-3 rounded-xl p-3 transition ${
                  selected
                    ? 'bg-[#34384C] ring-1 ring-[#F53659]/60'
                    : 'bg-[#2A2D3E] hover:bg-[#32364A]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectConversation?.(conversation)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#383C51] text-[#E1E4F0]">
                    <Bot size={19} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-[#F1F2F8]">
                      {conversation.title}
                    </span>
                    <span className="mt-1 block truncate text-[11px] text-[#9298AD]">
                      {conversation.subtitle}
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={(event) => deleteConversation(event, conversation)}
                  title="Delete conversation"
                  aria-label={`Delete ${conversation.title}`}
                  className="hidden shrink-0 rounded-md p-1 text-[#9298AD] hover:bg-red-500/15 hover:text-red-400 group-hover:block"
                >
                  <span className="text-xs">Delete</span>
                </button>
              </div>
            )
          })
        ) : (
          <div className="px-3 py-10 text-center text-sm text-[#9298AD]">
            <MessageSquare size={22} className="mx-auto mb-2 opacity-60" />
            {search ? 'No matching conversations.' : 'No conversations yet. Start a new chat.'}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={loadConversations}
        className="mt-3 flex shrink-0 items-center justify-center gap-2 py-2 text-xs text-[#777E95] hover:text-white"
      >
        <Clock3 size={13} />
        Refresh history
      </button>
    </aside>
  )
}

export default ChatManager
