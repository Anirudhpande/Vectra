import React, { useEffect, useRef, useState } from 'react'
import {
  Send,
  ChevronDown,
  Bot,
  Copy,
  Check,
  Sparkles,
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

const CodeBlock = ({ language, value }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard access may be unavailable.
    }
  }

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-white/[0.08]">
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.035] px-4 py-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">
          {language || 'code'}
        </span>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] text-white/40 transition hover:bg-white/[0.07] hover:text-white"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <SyntaxHighlighter
        language={language || 'text'}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          background: '#0B0B0B',
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

const AssistantMessage = ({ content }) => (
  <div className="max-w-none text-sm leading-7 text-white/75">
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
              className="rounded-md border border-white/[0.06] bg-white/[0.07] px-1.5 py-0.5 font-mono text-[0.85em] text-white/90"
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
          return <p className="mb-3 last:mb-0">{children}</p>
        },

        ul({ children }) {
          return <ul className="mb-3 list-disc space-y-1 pl-5">{children}</ul>
        },

        ol({ children }) {
          return <ol className="mb-3 list-decimal space-y-1 pl-5">{children}</ol>
        },

        blockquote({ children }) {
          return (
            <blockquote className="my-3 border-l-2 border-white/25 pl-4 text-white/50">
              {children}
            </blockquote>
          )
        },

        a({ href, children }) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline decoration-white/30 underline-offset-4 hover:decoration-white"
            >
              {children}
            </a>
          )
        },

        h1({ children }) {
          return <h1 className="mb-3 mt-5 text-xl font-semibold text-white">{children}</h1>
        },

        h2({ children }) {
          return <h2 className="mb-2 mt-4 text-lg font-semibold text-white/90">{children}</h2>
        },

        h3({ children }) {
          return <h3 className="mb-2 mt-3 text-base font-medium text-white/85">{children}</h3>
        },

        strong({ children }) {
          return <strong className="font-semibold text-white/95">{children}</strong>
        },
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
    <p className="mb-2 text-right text-[10px] text-white/30">
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

  useEffect(() => {
    const element = textareaRef.current
    if (!element) return

    element.style.height = 'auto'
    element.style.height = `${Math.min(element.scrollHeight, 160)}px`
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
    <section className={`flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-black ${className}`}>
      {/* HEADER */}
      <header className="flex min-h-[76px] shrink-0 flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] px-5 py-4 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.09] bg-white/[0.04] text-white/75">
            <Bot size={17} />
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-sm font-medium text-white/90">
              {conversation?.title || 'New conversation'}
            </h2>

            <p className="mt-1 truncate text-[10px] text-white/35">
              {conversation
                ? `${currentCredential?.providerName || conversation.subtitle?.split(' · ')[0] || 'AI'}${modelId ? ` · ${modelId}` : ''}`
                : 'Select a model and start a conversation'}
            </p>
          </div>
        </div>

        {/* PROVIDER AND MODEL */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 py-2 transition hover:border-white/20">
            <span className="text-[10px] text-white/35">Provider</span>

            <select
              value={credentialId || ''}
              onChange={(event) => onCredentialChange(event.target.value)}
              disabled={loadingCredentials || credentials.length === 0}
              className="max-w-32 cursor-pointer bg-transparent text-xs text-white/80 outline-none disabled:opacity-40"
            >
              <option value="" className="bg-[#111111]">
                {loadingCredentials
                  ? 'Loading...'
                  : credentials.length === 0
                    ? 'No keys'
                    : 'Select'}
              </option>

              {credentials.map((credential) => (
                <option
                  key={credential.id}
                  value={credential.id}
                  className="bg-[#111111]"
                >
                  {credential.providerName}
                </option>
              ))}
            </select>

            <ChevronDown size={12} className="text-white/30" />
          </label>

          <label className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 py-2 transition hover:border-white/20">
            <span className="text-[10px] text-white/35">Model</span>

            <select
              value={modelId || ''}
              onChange={(event) => onModelChange(event.target.value)}
              disabled={loadingModels || models.length === 0}
              className="max-w-40 cursor-pointer bg-transparent text-xs text-white/80 outline-none disabled:opacity-40"
            >
              <option value="" className="bg-[#111111]">
                {loadingModels
                  ? 'Loading...'
                  : models.length === 0
                    ? 'Select provider first'
                    : 'Select model'}
              </option>

              {models.map((model) => {
                const id = getModelId(model)
                if (!id) return null

                return (
                  <option key={id} value={id} className="bg-[#111111]">
                    {typeof model === 'string' ? model : model.name || id}
                  </option>
                )
              })}
            </select>

            <ChevronDown size={12} className="text-white/30" />
          </label>
        </div>
      </header>

      {/* MESSAGE HISTORY */}
      <div className="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto px-5 py-8 sm:px-8 lg:px-12">
        {!conversation ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="max-w-lg text-center">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.1] bg-white/[0.035] text-white/70">
                <Sparkles size={23} />
              </div>

              <h2 className="text-3xl font-medium tracking-[-0.045em] text-white/90">
                Think wider.
                <br />
                Build faster.
              </h2>

              <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-white/35">
                Start a conversation with any of your connected models. Your
                workspace is ready.
              </p>
            </div>
          </div>
        ) : isLoadingMessages ? (
          <div className="flex flex-1 items-center justify-center gap-3 text-xs text-white/35">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/10 border-t-white/70" />
            Loading conversation
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="max-w-sm text-center">
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/60">
                <Bot size={22} />
              </div>

              <h3 className="text-lg font-medium tracking-tight text-white/85">
                {conversation.title || 'New conversation'}
              </h3>

              <p className="mt-2 text-xs leading-5 text-white/35">
                Your next idea starts here. Send a message to begin.
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
                {!isUser && (
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04]">
                      <Bot size={13} className="text-white/65" />
                    </div>

                    <span className="text-[10px] font-medium tracking-wide text-white/40">
                      VECTRA
                    </span>
                  </div>
                )}

                <div
                  className={`max-w-[92%] break-words sm:max-w-[82%] lg:max-w-[75%] ${
                    isUser
                      ? 'rounded-2xl rounded-br-sm bg-white px-4 py-3 text-black'
                      : 'min-w-0 text-white/80'
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap text-sm leading-6">
                      {message.content}
                    </p>
                  ) : (
                    <AssistantMessage content={message.content} />
                  )}
                </div>

                {message.time && (
                  <span className="mt-2 px-1 text-[10px] text-white/20">
                    {message.time}
                  </span>
                )}
              </div>
            )
          })
        )}

        {isSending && (
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04]">
              <Bot size={13} className="text-white/65" />
            </div>

            <div className="flex items-center gap-1 rounded-xl border border-white/[0.07] bg-white/[0.035] px-4 py-3">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40 [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40 [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40 [animation-delay:300ms]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* COMPOSER */}
      <footer className="shrink-0 px-4 pb-4 pt-2 sm:px-8 lg:px-12">
        {(error || parentError) && (
          <div className="mb-3 rounded-lg border border-red-500/20 bg-red-500/[0.07] px-4 py-2.5 text-xs text-red-400">
            {error || parentError}
          </div>
        )}

        <UsageDisplay usage={usage} />

        <div className="rounded-xl border border-white/[0.12] bg-[#0B0B0B] px-4 py-3 transition focus-within:border-white/30">
          <div className="flex items-end gap-3">
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
                    ? 'Message Vectra...'
                    : 'Select a provider and model first...'
                  : 'Start a new conversation first...'
              }
              className="max-h-40 min-h-7 min-w-0 flex-1 resize-none bg-transparent py-1 text-sm leading-6 text-white outline-none placeholder:text-white/25 disabled:cursor-not-allowed"
            />

            <button
              type="button"
              onClick={handleSendMessage}
              disabled={!conversation || !draft.trim() || isSending}
              aria-label="Send message"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-black transition hover:bg-white/85 active:scale-95 disabled:cursor-not-allowed disabled:opacity-25"
            >
              <Send size={15} />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-3">
            <div className="flex items-center gap-2 text-[10px] text-white/30">
              <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
              <span>Enter to send</span>
              <span className="text-white/15">·</span>
              <span>Shift + Enter for new line</span>
            </div>

            <span className="text-[10px] text-white/25">
              Vectra workspace
            </span>
          </div>
        </div>
      </footer>
    </section>
  )
}

export default ChatFlow