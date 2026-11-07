
import React, { useEffect, useRef, useState } from 'react'
import {
  Send,
  ChevronDown,
  Bot,
  MoreHorizontal,
  Copy,
  Check,
} from 'lucide-react'
import { API_BASE } from '../../../config'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

const getCurrentTime = () =>
  new Date().toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
  })

const getModelId = (model) =>
  typeof model === 'string'
    ? model
    : model?.id ?? model?.modelId ?? model?.model_id ?? model?.name ?? ''

// Copy-to-clipboard code block component
const CodeBlock = ({ language, value }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <div className="relative my-3 rounded-xl overflow-hidden border border-white/[0.06]">
      <div className="flex items-center justify-between bg-white/[0.04] px-4 py-1.5">
        <span className="text-[11px] font-mono text-white/30">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] text-white/40 transition hover:bg-white/10 hover:text-white/80"
        >
          {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          background: 'rgba(255,255,255,0.02)',
          fontSize: '0.78rem',
          padding: '1rem',
        }}
        wrapLongLines
      >
        {value}
      </SyntaxHighlighter>
    </div>
  )
}

// Render assistant message as Markdown
const AssistantMessage = ({ content }) => (
  <div className="prose-sm prose-invert max-w-none text-sm leading-relaxed text-[#D8DCF0]">
    <ReactMarkdown
      components={{
      code({ inline, className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || '')
        const value = String(children).replace(/\n$/, '')
        if (!inline && match) {
          return <CodeBlock language={match[1]} value={value} />
        }
        return (
          <code
            className="rounded-md bg-white/[0.08] px-1.5 py-0.5 font-mono text-[0.8em] text-indigo-300"
            {...props}
          >
            {children}
          </code>
        )
      },
      pre({ children }) {
        return <>{children}</>
      },
      p({ children }) {
        return <p className="mb-2 last:mb-0">{children}</p>
      },
      ul({ children }) {
        return <ul className="mb-2 list-disc pl-5 space-y-1">{children}</ul>
      },
      ol({ children }) {
        return <ol className="mb-2 list-decimal pl-5 space-y-1">{children}</ol>
      },
      blockquote({ children }) {
        return (
          <blockquote className="border-l-2 border-indigo-500/50 pl-3 text-white/50 italic">
            {children}
          </blockquote>
        )
      },
      a({ href, children }) {
        return (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline hover:text-indigo-300">
            {children}
          </a>
        )
      },
      h1({ children }) { return <h1 className="mb-2 mt-4 text-base font-semibold text-white/90">{children}</h1> },
      h2({ children }) { return <h2 className="mb-2 mt-3 text-sm font-semibold text-white/80">{children}</h2> },
      h3({ children }) { return <h3 className="mb-1 mt-2 text-sm font-medium text-white/70">{children}</h3> },
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
)

const UsageDisplay = ({ usage }) => {
  if (!usage) return null
  const parts = []
  if (usage.prompt_tokens != null) parts.push(`${usage.prompt_tokens} in`)
  if (usage.completion_tokens != null) parts.push(`${usage.completion_tokens} out`)
  if (usage.total_tokens != null) parts.push(`${usage.total_tokens} total`)
  if (parts.length === 0) return null
  return (
    <p className="mb-2 text-right text-[10px] text-[#555C78]">
      Tokens: {parts.join(' · ')}
    </p>
  )
}

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
  const textareaRef = useRef(null)

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
          {
            credentials: 'include',
            signal: controller.signal,
          },
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

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [draft])

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
      setMessages((previous) =>
        previous.filter((message) => message.id !== userMessage.id),
      )
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

  const currentCredential = credentials.find(
    (credential) => credential.id === credentialId,
  )

  return (
    <section
      className={`flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-[#09090E] p-3 ${className}`}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/[0.05] bg-[#0E0F17]">

        {/* HEADER */}
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-white/[0.05] px-5 py-3.5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
              <Bot size={18} />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-white/90">
                {conversation?.title || 'New conversation'}
              </h2>

              <p className="mt-0.5 truncate text-[11px] text-white/35">
                {conversation
                  ? `${currentCredential?.providerName || conversation.subtitle?.split(' · ')[0] || 'AI'}${modelId ? ` · ${modelId}` : ''}`
                  : 'Select a model and start a conversation'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Provider select */}
            <label className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 cursor-pointer hover:border-white/[0.1]">
              <span className="text-[11px] text-white/35">Provider</span>

              <select
                value={credentialId || ''}
                onChange={(event) => onCredentialChange(event.target.value)}
                disabled={loadingCredentials || credentials.length === 0}
                className="max-w-36 min-w-0 bg-transparent text-xs text-white/80 outline-none disabled:opacity-40 cursor-pointer"
              >
                <option value="" className="bg-[#0E0F17]">
                  {loadingCredentials ? 'Loading...' : credentials.length === 0 ? 'No keys' : 'Select'}
                </option>

                {credentials.map((credential) => (
                  <option key={credential.id} value={credential.id} className="bg-[#0E0F17]">
                    {credential.providerName}
                  </option>
                ))}
              </select>

              <ChevronDown size={12} className="shrink-0 text-white/30" />
            </label>

            {/* Model select */}
            <label className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 cursor-pointer hover:border-white/[0.1]">
              <span className="text-[11px] text-white/35">Model</span>

              <select
                value={modelId || ''}
                onChange={(event) => onModelChange(event.target.value)}
                disabled={loadingModels || models.length === 0}
                className="max-w-48 min-w-0 bg-transparent text-xs text-white/80 outline-none disabled:opacity-40 cursor-pointer"
              >
                <option value="" className="bg-[#0E0F17]">
                  {loadingModels ? 'Loading...' : models.length === 0 ? 'Select provider first' : 'Select model'}
                </option>

                {models.map((model) => {
                  const id = getModelId(model)
                  if (!id) return null

                  return (
                    <option key={id} value={id} className="bg-[#0E0F17]">
                      {typeof model === 'string'
                        ? model
                        : model.name || id}
                    </option>
                  )
                })}
              </select>

              <ChevronDown size={12} className="shrink-0 text-white/30" />
            </label>

            <button
              type="button"
              title="Conversation options"
              aria-label="Conversation options"
              className="rounded-lg p-1.5 text-white/30 hover:bg-white/[0.05] hover:text-white/70"
            >
              <MoreHorizontal size={17} />
            </button>
          </div>
        </header>

        {/* MESSAGE HISTORY */}
        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-5 py-6">
          {!conversation ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="max-w-sm text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-400">
                  <Bot size={26} />
                </div>
                <p className="text-base font-medium text-white/70">
                  Start a conversation
                </p>
                <p className="mt-2 text-sm text-white/30">
                  Click the + button in the sidebar, then send your first message.
                </p>
              </div>
            </div>
          ) : isLoadingMessages ? (
            <div className="flex flex-1 items-center justify-center gap-2 text-sm text-white/30">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/10 border-t-indigo-500" />
              Loading messages…
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="max-w-xs text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-400">
                  <Bot size={26} />
                </div>
                <p className="text-sm font-medium text-white/60">
                  {conversation.title || 'New conversation'}
                </p>
                <p className="mt-2 text-xs text-white/25">
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
                  className={`flex w-full flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  {!isUser && (
                    <div className="mb-1.5 flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/15">
                        <Bot size={13} className="text-indigo-400" />
                      </div>
                      <span className="text-[11px] font-medium text-white/35">Vectra</span>
                    </div>
                  )}

                  <div
                    className={`max-w-[88%] break-words rounded-2xl px-4 py-3 sm:max-w-[75%] ${
                      isUser
                        ? 'rounded-br-sm bg-indigo-600 text-white text-sm leading-relaxed'
                        : 'rounded-bl-sm bg-white/[0.04] border border-white/[0.05]'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                    ) : (
                      <AssistantMessage content={message.content} />
                    )}
                  </div>

                  {message.time && (
                    <span className="mt-1 px-1 text-[10px] text-white/20">
                      {message.time}
                    </span>
                  )}
                </div>
              )
            })
          )}

          {isSending && (
            <div className="flex items-start gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/15">
                <Bot size={13} className="text-indigo-400" />
              </div>
              <div className="rounded-2xl rounded-bl-sm border border-white/[0.05] bg-white/[0.04] px-4 py-3">
                <div className="flex gap-1">
                  <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-white/30 [animation-delay:0ms]" />
                  <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-white/30 [animation-delay:150ms]" />
                  <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-white/30 [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* COMPOSER */}
        <footer className="shrink-0 px-4 pb-4 pt-2">
          {(error || parentError) && (
            <div className="mb-2 flex items-center gap-2 rounded-xl bg-red-500/10 px-3 py-2 text-xs text-red-400">
              <span className="shrink-0">⚠</span>
              {error || parentError}
            </div>
          )}

          <UsageDisplay usage={usage} />

          <div className="flex items-end gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 transition focus-within:border-indigo-500/40">
            <textarea
              ref={textareaRef}
              rows={1}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!conversation || isSending}
              placeholder={
                conversation
                  ? credentialId && modelId
                    ? 'Type your message…'
                    : 'Select a provider and model above first…'
                  : 'Start a new chat first…'
              }
              className="max-h-40 min-h-6 min-w-0 flex-1 resize-none bg-transparent py-0.5 text-sm text-white outline-none placeholder:text-white/20 disabled:cursor-not-allowed"
            />

            <button
              type="button"
              onClick={handleSendMessage}
              disabled={!conversation || !draft.trim() || isSending}
              aria-label="Send message"
              className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Send size={15} className="-translate-x-px" />
            </button>
          </div>

          <p className="mt-2 text-center text-[10px] text-white/20">
            Enter to send · Shift + Enter for a new line
          </p>
        </footer>
      </div>
    </section>
  )
}

export default ChatFlow
