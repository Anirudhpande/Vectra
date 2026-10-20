
import React, { useMemo, useState } from 'react'

import {
  Search,
  SlidersHorizontal,
  Plus,
  Bot,
  BrainCircuit,
  Code2,
  SquareTerminal,
  Lightbulb,
} from 'lucide-react'

const initialConversations = [
  {
    id: 1,
    title: 'Spring Boot debugging',
    subtitle: 'Groq · openai/gpt-oss-20b',
    time: '5m',
    age: 5,
    pinned: true,
    icon: Bot,
  },
  {
    id: 2,
    title: 'Understanding Kafka',
    subtitle: 'Gemini · 12 messages',
    time: '1h',
    age: 60,
    pinned: false,
    icon: BrainCircuit,
  },
  {
    id: 3,
    title: 'React component design',
    subtitle: 'OpenAI · 8 messages',
    time: '3h',
    age: 180,
    pinned: false,
    icon: Code2,
  },
  {
    id: 4,
    title: 'MongoDB connection issue',
    subtitle: 'Groq · 16 messages',
    time: '1d',
    age: 1440,
    pinned: false,
    icon: SquareTerminal,
  },
  {
    id: 5,
    title: 'System design fundamentals',
    subtitle: 'Claude · 21 messages',
    time: '2d',
    age: 2880,
    pinned: true,
    icon: Lightbulb,
  },
]

const ChatManager = ({
  className = '',
  onSelectConversation,
  onNewConversation,
}) => {
  const [conversations, setConversations] = useState(
    initialConversations
  )

  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('All')
  const [selectedId, setSelectedId] = useState(null)
  const [newestFirst, setNewestFirst] = useState(true)

  const filteredConversations = useMemo(() => {
    let result = [...conversations]

    // Search conversations
    if (search.trim()) {
      const query = search.toLowerCase()

      result = result.filter(
        (conversation) =>
          conversation.title.toLowerCase().includes(query) ||
          conversation.subtitle.toLowerCase().includes(query)
      )
    }

    // Filter tabs
    if (activeTab === 'Pinned') {
      result = result.filter((conversation) => conversation.pinned)
    }

    if (activeTab === 'Recent') {
      result = result.filter((conversation) => conversation.age <= 1440)
    }

    // Sort by most recent activity
    result.sort((a, b) =>
      newestFirst ? a.age - b.age : b.age - a.age
    )

    return result
  }, [conversations, search, activeTab, newestFirst])

  const createConversation = () => {
    const count = conversations.filter((conversation) =>
      conversation.title.startsWith('New conversation')
    ).length

    const conversation = {
      id: Date.now(),
      title: count === 0
        ? 'New conversation'
        : `New conversation ${count + 1}`,
      subtitle: 'Vectra · Ready to chat',
      time: 'now',
      age: 0,
      pinned: false,
      icon: Bot,
    }

    setConversations((previous) => [
      conversation,
      ...previous,
    ])

    setSelectedId(conversation.id)
    setActiveTab('All')
    setSearch('')
    setNewestFirst(true)

    onNewConversation?.(conversation)
  }

  const selectConversation = (conversation) => {
    setSelectedId(conversation.id)
    onSelectConversation?.(conversation)
  }

  const tabs = ['All', 'Pinned', 'Recent']

  return (
    <aside
      className={`h-screen w-2/8 bg-[#242433] p-3 ${className}`}
    >
      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl bbg-[#242433]">

        {/* Search bar */}
        <div className="flex shrink-0 items-center gap-2 rounded-xl bg-[#2A2D3E] px-3 py-3">
          <Search
            size={18}
            className="shrink-0 text-[#9298AD]"
          />

          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-[#9298AD]"
          />

          <button
            type="button"
            onClick={() => setNewestFirst((previous) => !previous)}
            title={newestFirst ? 'Sort oldest first' : 'Sort newest first'}
            aria-label="Change conversation sorting"
            className="shrink-0 text-[#9298AD] transition hover:text-white"
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>

        {/* Tabs and create button */}
        <div className="mt-4 flex shrink-0 items-center justify-between">
          <div className="flex items-center gap-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`border-b-1 pb-1 text-sm transition ${
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
            onClick={createConversation}
            title="New conversation"
            aria-label="Create new conversation"
            className="mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#F53659] text-white transition hover:bg-[#FF4969] active:scale-95"
          >
            <Plus size={19} />
          </button>
        </div>

        {/* Conversation list */}
        <div className="mt-3 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">

          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => {
              const Icon = conversation.icon
              const isSelected = selectedId === conversation.id

              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => selectConversation(conversation)}
                  className={`flex w-full shrink-0 items-center gap-3 rounded-xl p-3 text-left transition ${
                    isSelected
                      ? 'bg-[#34384C] ring-1 ring-[#F53659]/60'
                      : 'bg-[#2A2D3E] hover:bg-[#32364A]'
                  }`}
                >
                  {/* Conversation icon */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#383C51] text-[#E1E4F0]">
                    <Icon size={19} />
                  </div>

                  {/* Conversation details */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#F1F2F8]">
                      {conversation.title}
                    </p>

                    <p className="mt-1 truncate text-[11px] text-[#9298AD]">
                      {conversation.subtitle}
                    </p>
                  </div>

                  {/* Activity time */}
                  <span className="shrink-0 self-center text-[11px] text-[#9298AD]">
                    {conversation.time}
                  </span>
                </button>
              )
            })
          ) : (
            <div className="px-3 py-10 text-center text-sm text-[#9298AD]">
              No conversations found.
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="mt-3 shrink-0 text-[10px] text-[#777E95]">
          Illustrative conversations — not live VECTRA data.
        </p>
      </div>
    </aside>
  )
}

export default ChatManager
