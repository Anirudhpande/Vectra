
import React, { useEffect, useRef, useState } from 'react'
import {
  Paperclip,
  Send,
  ChevronDown,
  Bot,
  MoreHorizontal,
} from 'lucide-react'
// export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
import { API_BASE } from '../../../config'

const getCurrentTime = () =>
  new Date().toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
  })

const getModelId = (model) =>
  typeof model === 'string'
    ? model
    : model?.id ?? model?.modelId ?? model?.model_id ?? model?.name ?? ''

export const ChatFlow = ({
  className = '',
  conversation = null,
  credentials = [],
  credentialId,
  onCredentialChange,
  models = [],
  modelId,
  onModelChange,
  loadingCredentials = false,
  loadingModels = false,
  error: parentError = '',
  onSendMessage,
  onConversationSaved,
}) => {
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [error, setError] = useState('')
  const [usage, setUsage] = useState(null)

  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    setError('')
    setUsage(null)

    if (!conversation?.id || !conversation.persisted) {
      setMessages([])
      setIsLoadingMessages(false)
      return
    }

    const controller = new AbortController()

    const loadMessages = async () => {
      setIsLoadingMessages(true)

      try {
        const response = await fetch(
          `${API_BASE}/api/chats/${encodeURIComponent(conversation.id)}/messages`,
          { signal: controller.signal },
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || data.error || 'Failed to load messages.')
        }

        setMessages(
          (Array.isArray(data) ? data : []).map((message, index) => ({
            id: `${conversation.id}-${index}`,
            role: message.role,
            content: message.content,
            time: '',
          })),
        )
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Could not load conversation messages.')
          setMessages([])
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingMessages(false)
        }
      }
    }

    loadMessages()
    return () => controller.abort()
  }, [conversation?.id, conversation?.persisted])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    })
  }, [messages, isSending, isLoadingMessages])

  const handleSendMessage = async () => {
    const text = draft.trim()

    if (!text || !conversation || isSending) return

    if (!credentialId || !modelId) {
      setError('Select an API credential and model first.')
      return
    }

    const originalConversation = conversation

    const userMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      content: text,
      time: getCurrentTime(),
    }

    setMessages((previous) => [...previous, userMessage])
    setDraft('')
    setError('')
    setIsSending(true)

    try {
      const result = await onSendMessage(text, originalConversation)

      const savedConversation = result?.conversation

      if (savedConversation) {
        onConversationSaved?.(savedConversation)
      }

      const reply =
        typeof result === 'string'
          ? result
          : result?.reply ?? result?.content ?? ''

      if (typeof reply !== 'string' || !reply.trim()) {
        throw new Error('The provider returned an empty response.')
      }

      setMessages((previous) => [
        ...previous,
        {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          content: reply,
          time: getCurrentTime(),
        },
      ])

      if (result?.providerResponse?.usage) {
        setUsage(result.providerResponse.usage)
      }
    } catch (err) {
      setError(err.message || 'Message could not be sent. Please try again.')
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
      setError(`Selected "${file.name}". File upload is not connected yet.`)
    }

    event.target.value = ''
  }

  const currentCredential = credentials.find(
    (credential) => credential.id === credentialId,
  )

  return (
    <section
      className={`flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-[#1D1F2B] p-3 ${className}`}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/[0.04] bg-[#242635]">

        {/* HEADER: conversation title + model controls */}
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#303347] text-[#F53659]">
              <Bot size={21} />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-[#F1F2F8]">
                {conversation?.title || 'New conversation'}
              </h2>

              <p className="mt-1 truncate text-xs text-[#9298AD]">
                {conversation
                  ? `${currentCredential?.providerName || conversation.subtitle?.split(' · ')[0] || 'AI'}${modelId ? ` · ${modelId}` : ''}`
                  : 'Select a model and start a conversation'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-[#303347] px-3 py-2">
              <span className="text-[11px] text-[#9298AD]">Provider</span>

              <select
                value={credentialId || ''}
                onChange={(event) => onCredentialChange(event.target.value)}
                disabled={loadingCredentials || credentials.length === 0}
                className="max-w-36 min-w-0 bg-transparent text-xs text-white outline-none disabled:opacity-50"
              >
                <option value="">
                  {loadingCredentials ? 'Loading...' : 'Select'}
                </option>

                {credentials.map((credential) => (
                  <option key={credential.id} value={credential.id}>
                    {credential.providerName}
                  </option>
                ))}
              </select>

              <ChevronDown size={13} className="shrink-0 text-[#9298AD]" />
            </label>

            <label className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-[#303347] px-3 py-2">
              <span className="text-[11px] text-[#9298AD]">Model</span>

              <select
                value={modelId || ''}
                onChange={(event) => onModelChange(event.target.value)}
                disabled={loadingModels || models.length === 0}
                className="max-w-48 min-w-0 bg-[#303347 text-xs text-black outline-none disabled:opacity-50"
              >
                <option value="">
                  {loadingModels ? 'Loading...' : 'Select model'}
                </option>

                {models.map((model) => {
                  const id = getModelId(model)
                  if (!id) return null

                  return (
                    <option key={id} value={id}>
                      {typeof model === 'string'
                        ? model
                        : model.name || id}
                    </option>
                  )
                })}
              </select>

              <ChevronDown size={13} className="shrink-0 text-[#9298AD]" />
            </label>

            <button
              type="button"
              title="Conversation options"
              aria-label="Conversation options"
              className="rounded-lg p-2 text-[#9298AD] hover:bg-white/5 hover:text-white"
            >
              <MoreHorizontal size={19} />
            </button>
          </div>
        </header>

        {/* MESSAGE HISTORY */}
        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-6">
          {!conversation ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="max-w-sm text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#303347] text-[#F53659]">
                  <Bot size={28} />
                </div>
                <p className="text-base font-medium text-[#E5E7F0]">
                  Start a conversation
                </p>
                <p className="mt-2 text-sm text-[#9298AD]">
                  Click the + button in the sidebar, then send your first message.
                </p>
              </div>
            </div>
          ) : isLoadingMessages ? (
            <div className="flex flex-1 items-center justify-center text-sm text-[#9298AD]">
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <p className="text-base font-medium text-[#E5E7F0]">
                  {conversation.title || 'New conversation'}
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
                    className={`max-w-[90%] whitespace-pre-wrap break-words rounded-xl px-4 py-3 text-sm leading-relaxed sm:max-w-[80%] ${
                      isUser
                        ? 'rounded-br-sm bg-[#F53659] text-white'
                        : 'rounded-bl-sm bg-[#303347] text-[#E5E7F0]'
                    }`}
                  >
                    {message.content}
                  </div>

                  {message.time && (
                    <span className="mt-1 px-1 text-[10px] text-[#777E95]">
                      {message.time}
                    </span>
                  )}
                </div>
              )
            })
          )}

          {isSending && (
            <div className="flex justify-start">
              <div className="rounded-xl bg-[#303347] px-4 py-3 text-sm text-[#9298AD]">
                VECTRA is thinking...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* COMPOSER */}
        <footer className="shrink-0 px-5 pb-4 pt-2">
          {(error || parentError) && (
            <p role="alert" className="mb-2 text-xs text-red-400">
              {error || parentError}
            </p>
          )}

          {usage && (
            <p className="mb-2 text-right text-[10px] text-[#777E95]">
              Usage: {JSON.stringify(usage)}
            </p>
          )}

          <div className="flex items-end gap-3 rounded-2xl border border-white/[0.05] bg-[#303347] px-3 py-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={!conversation || isSending}
              aria-label="Attach a file"
              className="mb-1 shrink-0 text-[#9298AD] hover:text-white disabled:opacity-40"
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
                conversation ? 'Type your message...' : 'Start a new chat first...'
              }
              className="max-h-36 min-h-8 min-w-0 flex-1 resize-y bg-transparent py-1.5 text-sm text-white outline-none placeholder:text-[#9298AD] disabled:cursor-not-allowed"
            />

            <button
              type="button"
              onClick={handleSendMessage}
              disabled={!conversation || !draft.trim() || isSending}
              aria-label="Send message"
              className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F53659] text-white transition hover:bg-[#FF4969] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send size={17} className="-translate-x-px" />
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
