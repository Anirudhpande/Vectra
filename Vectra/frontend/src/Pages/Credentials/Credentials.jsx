import React, { useCallback, useEffect, useState } from 'react'
import { API_BASE } from '../../config'
import { Key, Plus, AlertCircle, CheckCircle, Loader2, ChevronDown, Zap, BrainCircuit } from 'lucide-react'

const PROVIDERS = [
  { id: 'openai', label: 'OpenAI', description: 'GPT-4o, GPT-4, GPT-3.5', placeholder: 'sk-...' },
  { id: 'gemini', label: 'Google Gemini', description: 'Gemini 2.0, 1.5 Pro, Flash', placeholder: 'AIza...' },
  { id: 'anthropic', label: 'Anthropic', description: 'Claude 3.5 Sonnet, Haiku, Opus', placeholder: 'sk-ant-...' },
  { id: 'groq', label: 'Groq', description: 'Llama, Mixtral, Gemma (fast inference)', placeholder: 'gsk_...' },
]

const ProviderDot = ({ name }) => {
  const colors = {
    openai: 'bg-emerald-400',
    gemini: 'bg-blue-400',
    anthropic: 'bg-orange-400',
    groq: 'bg-purple-400',
  }
  const key = name?.toLowerCase() || ''
  const matched = Object.keys(colors).find((k) => key.includes(k))
  return (
    <span className={`inline-block h-2 w-2 rounded-full ${colors[matched] || 'bg-white/30'}`} />
  )
}

const Credentials = () => {
  const [credentials, setCredentials] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')

  // Add form state
  const [formOpen, setFormOpen] = useState(false)
  const [provider, setProvider] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState('')

  const loadCredentials = useCallback(async () => {
    setLoading(true)
    setFetchError('')
    try {
      const res = await fetch(`${API_BASE}/api/credentials`, {
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || data.error || 'Failed to load credentials.')
      setCredentials(Array.isArray(data) ? data : [])
    } catch (err) {
      setFetchError(err.message || 'Could not connect to backend.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCredentials()
  }, [loadCredentials])

  const handleAddCredential = async (e) => {
    e.preventDefault()
    if (!provider.trim() || !apiKey.trim()) {
      setSubmitError('Provider and API key are required.')
      return
    }

    setSubmitting(true)
    setSubmitError('')
    setSubmitSuccess('')

    try {
      const res = await fetch(`${API_BASE}/api/credentials`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider_name: provider.trim(), API: apiKey.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || data.error || 'Failed to add credential.')

      setSubmitSuccess(`${data.providerName || provider} credential added successfully.`)
      setProvider('')
      setApiKey('')
      setFormOpen(false)
      await loadCredentials()
    } catch (err) {
      setSubmitError(err.message || 'Could not add credential.')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedProvider = PROVIDERS.find((p) => p.id === provider)

  return (
    <div className="min-h-screen bg-[#09090E] pt-16">
      <div className="mx-auto max-w-2xl px-6 py-12">

        {/* Page header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">API Keys</h1>
            <p className="mt-1 text-sm text-white/40">
              Connect your provider API keys to unlock AI models in chat.
            </p>
          </div>
          <button
            id="add-credential-btn"
            onClick={() => { setFormOpen((o) => !o); setSubmitError(''); setSubmitSuccess('') }}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 active:scale-95"
          >
            <Plus size={15} />
            Add key
          </button>
        </div>

        {/* Success banner */}
        {submitSuccess && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            <CheckCircle size={15} className="shrink-0" />
            {submitSuccess}
          </div>
        )}

        {/* Add credential form */}
        {formOpen && (
          <form
            onSubmit={handleAddCredential}
            className="mb-6 rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.03] p-5"
          >
            <h2 className="mb-4 text-sm font-semibold text-white/80">New API credential</h2>

            {/* Provider select */}
            <div className="mb-3">
              <label className="mb-1.5 block text-xs font-medium text-white/40">
                Provider
              </label>
              <div className="relative">
                <select
                  id="provider-select"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  required
                  className="w-full appearance-none rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 pr-10 text-sm text-white outline-none transition focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
                >
                  <option value="" className="bg-[#0E0F17]">Select a provider…</option>
                  {PROVIDERS.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#0E0F17]">
                      {p.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/30" />
              </div>
              {selectedProvider && (
                <p className="mt-1.5 text-xs text-white/30">{selectedProvider.description}</p>
              )}
            </div>

            {/* API key input */}
            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-medium text-white/40">
                API Key
              </label>
              <input
                id="api-key-input"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={selectedProvider?.placeholder || 'Paste your API key…'}
                required
                autoComplete="off"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
              />
              <p className="mt-1.5 text-xs text-white/25">
                Your key is encrypted before storage and never exposed in responses.
              </p>
            </div>

            {submitError && (
              <div className="mb-3 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                <AlertCircle size={13} className="shrink-0" />
                {submitError}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="rounded-xl border border-white/[0.06] px-4 py-2 text-sm text-white/50 transition hover:text-white"
              >
                Cancel
              </button>
              <button
                id="submit-credential"
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-60"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                {submitting ? 'Adding…' : 'Add credential'}
              </button>
            </div>
          </form>
        )}

        {/* Credential list */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/30">
            Registered credentials
          </h2>

          {fetchError && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <AlertCircle size={15} className="shrink-0" />
              {fetchError}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={22} className="animate-spin text-white/20" />
            </div>
          ) : credentials.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/[0.08] py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] text-white/20">
                <Key size={22} />
              </div>
              <p className="text-sm font-medium text-white/40">No credentials yet</p>
              <p className="mt-1 text-xs text-white/20">Add an API key above to start chatting.</p>
              <button
                onClick={() => setFormOpen(true)}
                className="mt-4 flex items-center gap-1.5 rounded-lg bg-indigo-600/20 px-4 py-2 text-xs font-medium text-indigo-400 transition hover:bg-indigo-600/30"
              >
                <Plus size={13} />
                Add your first key
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {credentials.map((cred) => (
                <div
                  key={cred.id}
                  className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5 transition hover:border-white/[0.1] hover:bg-white/[0.03]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15">
                    <BrainCircuit size={16} className="text-indigo-400" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <ProviderDot name={cred.providerName} />
                      <span className="text-sm font-medium text-white/90">{cred.providerName}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-white/30 font-mono">
                      {cred.id ? `ID: ${cred.id.slice(0, 8)}…` : 'Credential ID unavailable'}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                    <Zap size={10} />
                    Active
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Info box */}
        <div className="mt-8 rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-4">
          <p className="text-xs text-white/30 leading-relaxed">
            <span className="font-medium text-white/50">BYOK — Bring Your Own Key.</span>{' '}
            Vectra never shares your keys with other users. Each key is AES-encrypted at rest.
            Delete credentials by removing them from your provider's dashboard.
          </p>
        </div>

      </div>
    </div>
  )
}

export default Credentials
