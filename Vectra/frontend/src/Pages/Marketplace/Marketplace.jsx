import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  Search,
  Zap,
  ChevronRight,
  ExternalLink,
  BrainCircuit,
  ArrowRight,
} from 'lucide-react'

// Provider and model data — matches what the backend supports
const PROVIDERS = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'Industry-leading language models for text, code, and reasoning.',
    color: 'emerald',
    dot: 'bg-emerald-400',
    badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    docsUrl: 'https://platform.openai.com/api-keys',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', desc: 'Most capable multimodal model', tags: ['Multimodal', 'Latest'] },
      { id: 'gpt-4o-mini', name: 'GPT-4o mini', desc: 'Fast and affordable GPT-4o', tags: ['Fast', 'Affordable'] },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', desc: 'High performance with large context', tags: ['128k context'] },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', desc: 'Efficient for simple tasks', tags: ['Legacy'] },
    ],
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: "Google's most capable AI family, optimized for multimodal reasoning.",
    color: 'blue',
    dot: 'bg-blue-400',
    badge: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    docsUrl: 'https://aistudio.google.com/app/apikey',
    models: [
      { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', desc: 'Fastest next-gen model', tags: ['Latest', 'Fast'] },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', desc: 'Complex reasoning with 2M token context', tags: ['2M context'] },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', desc: 'Speed-optimised version', tags: ['Fast'] },
      { id: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro', desc: 'Production-ready baseline', tags: ['Stable'] },
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude — safety-focused AI for nuanced reasoning and long documents.',
    color: 'orange',
    dot: 'bg-orange-400',
    badge: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
    docsUrl: 'https://console.anthropic.com/keys',
    models: [
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', desc: 'Best balance of speed and intelligence', tags: ['Latest', 'Recommended'] },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', desc: 'Fastest Claude model', tags: ['Fast'] },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', desc: 'Most powerful for complex tasks', tags: ['Powerful'] },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', desc: 'Lightweight and affordable', tags: ['Affordable'] },
    ],
  },
  {
    id: 'groq',
    name: 'Groq',
    description: 'Ultra-fast inference for open source models via dedicated LPU hardware.',
    color: 'purple',
    dot: 'bg-purple-400',
    badge: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
    docsUrl: 'https://console.groq.com/keys',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', desc: 'Latest Llama for general use', tags: ['Latest', 'Open source'] },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', desc: 'Ultra-fast lightweight model', tags: ['Ultra-fast'] },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', desc: 'Expert mixture model, 32k context', tags: ['32k context'] },
      { id: 'gemma2-9b-it', name: 'Gemma 2 9B', desc: "Google's efficient open model", tags: ['Efficient'] },
    ],
  },
]

const TAG_COLORS = {
  Latest: 'bg-indigo-500/15 text-indigo-300',
  Fast: 'bg-emerald-500/15 text-emerald-300',
  'Ultra-fast': 'bg-emerald-500/15 text-emerald-300',
  Recommended: 'bg-amber-500/15 text-amber-300',
  Multimodal: 'bg-blue-500/15 text-blue-300',
  Affordable: 'bg-cyan-500/15 text-cyan-300',
  Powerful: 'bg-purple-500/15 text-purple-300',
  'Open source': 'bg-white/10 text-white/50',
  default: 'bg-white/[0.06] text-white/40',
}

const Tag = ({ label }) => (
  <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${TAG_COLORS[label] || TAG_COLORS.default}`}>
    {label}
  </span>
)

const ProviderCard = ({ provider, expanded, onToggle }) => (
  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden transition hover:border-white/[0.1]">
    {/* Provider header */}
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center gap-4 px-5 py-4 text-left"
    >
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04]`}>
        <BrainCircuit size={18} className="text-white/50" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={`inline-block h-2 w-2 rounded-full ${provider.dot}`} />
          <h3 className="text-sm font-semibold text-white/90">{provider.name}</h3>
          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${provider.badge}`}>
            <Zap size={9} />
            {provider.models.length} models
          </span>
        </div>
        <p className="mt-0.5 text-xs text-white/35 truncate pr-6">{provider.description}</p>
      </div>

      <ChevronRight
        size={16}
        className={`shrink-0 text-white/25 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
      />
    </button>

    {/* Model list */}
    {expanded && (
      <div className="border-t border-white/[0.05] px-5 pb-5 pt-3">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] font-medium uppercase tracking-widest text-white/25">Available models</p>
          <a
            href={provider.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 transition"
          >
            Get API key <ExternalLink size={10} />
          </a>
        </div>

        <div className="grid gap-2">
          {provider.models.map((model) => (
            <div
              key={model.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-white/80">{model.name}</p>
                <p className="mt-0.5 text-[11px] text-white/35">{model.desc}</p>
              </div>
              <div className="flex shrink-0 flex-wrap justify-end gap-1">
                {model.tags.map((tag) => <Tag key={tag} label={tag} />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
)

const Marketplace = () => {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState('openai')

  const filtered = PROVIDERS.filter((p) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.models.some((m) => m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q))
    )
  })

  const handleToggle = (id) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="min-h-screen bg-[#09090E]">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#09090E]/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-xl font-bold tracking-tight text-white hover:opacity-80 transition">
            Vectra
          </Link>

          <div className="flex items-center gap-6 text-sm text-white/50">
            <Link to="/" className="hover:text-white transition">Home</Link>
            <Link to="/marketplace" className="text-white font-medium">Models</Link>
            {user ? (
              <>
                <Link to="/chat" className="hover:text-white transition">Chat</Link>
                <Link to="/account" className="hover:text-white transition">Account</Link>
              </>
            ) : (
              <Link
                to="/login"
                className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 transition"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-6 py-12">

        {/* Hero */}
        <div className="mb-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-400">
            Supported Providers
          </p>
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-white">
            AI Model Explorer
          </h1>
          <p className="mb-8 max-w-xl text-sm leading-relaxed text-white/40">
            Vectra supports these AI providers via BYOK. Bring your own API key and access
            any model directly from chat — no subscriptions, no lock-in.
          </p>

          {/* Stats */}
          <div className="mb-10 flex gap-8">
            {[
              { value: `${PROVIDERS.length}`, label: 'Providers' },
              { value: `${PROVIDERS.reduce((n, p) => n + p.models.length, 0)}+`, label: 'Models' },
              { value: 'BYOK', label: 'Model' },
              { value: '100%', label: 'Your data' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-white/30">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* CTA row */}
          <div className="flex flex-wrap items-center gap-3">
            {user ? (
              <Link
                to="/credentials"
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 transition active:scale-95"
              >
                Add an API Key <ArrowRight size={15} />
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 transition active:scale-95"
              >
                Sign in to get started <ArrowRight size={15} />
              </Link>
            )}
            {user && (
              <Link
                to="/chat"
                className="flex items-center gap-2 rounded-xl border border-white/[0.08] px-5 py-2.5 text-sm text-white/60 hover:border-white/20 hover:text-white transition"
              >
                Go to Chat
              </Link>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-2.5">
          <Search size={16} className="shrink-0 text-white/30" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search providers or models…"
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25"
          />
        </div>

        {/* Provider cards */}
        <div className="flex flex-col gap-3">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <BrainCircuit size={28} className="mx-auto mb-3 text-white/15" />
              <p className="text-sm text-white/30">No providers match your search.</p>
            </div>
          ) : (
            filtered.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                expanded={expandedId === provider.id}
                onToggle={() => handleToggle(provider.id)}
              />
            ))
          )}
        </div>

        {/* BYOK callout */}
        <div className="mt-10 rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.04] px-6 py-5">
          <h3 className="mb-1.5 text-sm font-semibold text-indigo-300">How BYOK works</h3>
          <p className="text-xs leading-relaxed text-white/35">
            Bring Your Own Key means you use your own API credentials from each provider.
            Vectra encrypts your keys at rest and uses them only to forward your chat requests.
            You pay providers directly at their rates — Vectra doesn't add any markup.
          </p>
          {!user && (
            <Link to="/login" className="mt-3 inline-block text-xs text-indigo-400 hover:text-indigo-300 transition">
              Sign in to add your first key →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default Marketplace