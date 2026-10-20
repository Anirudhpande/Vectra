
import React, { useEffect, useRef, useState } from 'react'
import { Paperclip, Send } from 'lucide-react'

const EMPTY_MESSAGES = []

const getCurrentTime = () =>
  new Date().toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
  })

export const ChatFlow = ({
  className = '',
  conversation = null,
  onSendMessage,
}) => {
  const [messagesByConversation, setMessagesByConversation] =
    useState({})

  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState('')

  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  const conversationId = conversation?.id ?? null

  const messages =
    conversationId === null
      ? EMPTY_MESSAGES
      : messagesByConversation[conversationId] ?? EMPTY_MESSAGES

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    })
  }, [conversationId, messages])

  const addMessage = (id, message) => {
    setMessagesByConversation((previous) => ({
      ...previous,
      [id]: [...(previous[id] ?? []), message],
    }))
  }

  const handleSendMessage = async () => {
    const text = draft.trim()

    if (!text || !conversation || isSending) return

    const currentConversationId = conversation.id

    const userMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      content: text,
      time: getCurrentTime(),
    }

    // Display the user's message immediately.
    addMessage(currentConversationId, userMessage)

    setDraft('')
    setError('')

    // Local message sending works without a backend callback.
    // An assistant response requires onSendMessage to be connected.
    if (!onSendMessage) return

    setIsSending(true)

    try {
      const response = await onSendMessage(text, conversation)

      const reply =
        typeof response === 'string'
          ? response
          : response?.reply ??
            response?.content ??
            response?.message

      if (typeof reply === 'string' && reply.trim()) {
        addMessage(currentConversationId, {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          content: reply,
          time: getCurrentTime(),
        })
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Message could not be sent. Please try again.'
      )
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSendMessage()
    }
  }

  const handleAttachment = (event) => {
    const file = event.target.files?.[0]

    if (file) {
      setError(`Attachment selected: ${file.name}. File upload is not connected yet.`)
    }

    // Allow selecting the same file again.
    event.target.value = ''
  }

  return (
    <section
      className={`flex h-screen min-h-0 w-5/8 flex-col overflow-hidden bg-[#1D1F2B] p-3 ${className}`}
    >
      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-white/4 bg-[#242635] px-4 sm:px-6">

        {/* HEADER */}
        <header className="flex shrink-0 items-center border-b border-white/[0.06] py-4">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-[#F1F2F8]">
              {conversation?.title ?? 'New conversation'}
            </h2>

            <p className="mt-1 truncate text-xs text-[#9298AD]">
              {conversation
                ? conversation.subtitle ?? 'Vectra conversation'
                : 'Create or select a conversation to begin'}
            </p>
          </div>
        </header>

        {/* MESSAGE HISTORY */}
        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto py-6">

          {!conversation ? (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-center text-sm text-[#9298AD]">
                Select a conversation or create a new one to get started.
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="max-w-xs text-center">
                <p className="text-base font-medium text-[#E5E7F0]">
                  Start a conversation
                </p>

                <p className="mt-2 text-sm text-[#9298AD]">
                  Send your first message to get started.
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => {
              const isUser = message.role === 'user'

              return (
                <div
                  key={message.id}
                  className={`flex w-full flex-col ${
                    isUser ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap break-words rounded-xl px-4 py-3 text-sm leading-relaxed sm:max-w-[75%] ${
                      isUser
                        ? 'rounded-br-sm bg-[#F53659] text-white'
                        : 'rounded-bl-sm bg-[#303347] text-[#E5E7F0]'
                    }`}
                  >
                    {message.content}
                  </div>

                  <span
                    className={`mt-1 px-1 text-[10px] text-[#777E95] ${
                      isUser ? 'text-right' : 'text-left'
                    }`}
                  >
                    {message.time}
                    {isUser && (
                      <span className="ml-1 text-[#F53659]">✓</span>
                    )}
                  </span>
                </div>
              )
            })
          )}

          {isSending && (
            <div className="flex justify-start">
              <div className="rounded-xl bg-[#303347] px-4 py-3 text-sm text-[#9298AD]">
                Vectra is thinking...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* COMPOSER */}
        <footer className="shrink-0 pb-4 pt-2">
          {error && (
            <p className="mb-2 text-xs text-red-400">
              {error}
            </p>
          )}

          <div className="flex items-end gap-3 rounded-2xl border border-white/[0.04] bg-[#303347] px-3 py-2">

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={!conversation}
              aria-label="Attach a file"
              className="mb-1 shrink-0 text-[#9298AD] transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Paperclip size={19} />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleAttachment}
            />

            <textarea
              rows={1}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!conversation || isSending}
              placeholder={
                conversation
                  ? 'Type your message...'
                  : 'Select a conversation first...'
              }
              className="max-h-32 min-h-8 min-w-0 flex-1 resize-y bg-transparent py-1.5 text-sm text-white outline-none placeholder:text-[#9298AD] disabled:cursor-not-allowed"
            />

            <button
              type="button"
              onClick={handleSendMessage}
              disabled={!conversation || !draft.trim() || isSending}
              aria-label="Send message"
              className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F53659] text-white transition hover:bg-[#FF4969] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send size={17} className="translate-x-[-1px]" />
            </button>

          </div>

          <p className="mt-2 text-center text-[10px] text-[#777E95]">
            Enter to send · Shift + Enter for a new line
          </p>
        </footer>
      </div>
    </section>
  )
}

export default ChatFlow
