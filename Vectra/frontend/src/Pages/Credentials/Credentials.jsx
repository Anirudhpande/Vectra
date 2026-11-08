
import React, { useCallback, useEffect, useState } from 'react'
import { API_BASE } from '../../config'
import { getCsrfHeaders } from '../../lib/csrf'
import {
  Key,
  Plus,
  AlertCircle,
  CheckCircle,
  Loader2,
  ChevronDown,
  Zap,
  Trash2,
  ShieldCheck,
  ArrowLeft,
  ExternalLink,
  LockKeyhole,
  X,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'

const PROVIDERS = [
  {
    id: 'openai',
    label: 'OpenAI',
    description: 'GPT models and multimodal AI',
    placeholder: 'sk-...',
  },
  {
    id: 'gemini',
    label: 'Google Gemini',
    description: 'Gemini Pro, Flash and more',
    placeholder: 'AIza...',
  },
  {
    id: 'anthropic',
    label: 'Anthropic',
    description: 'Claude models and reasoning',
    placeholder: 'sk-ant-...',
  },
  {
    id: 'groq',
    label: 'Groq',
    description: 'Fast inference for open models',
    placeholder: 'gsk_...',
  },
]

const ProviderDot = ({ name }) => {
  const colors = {
    openai: 'bg-emerald-400',
    gemini: 'bg-blue-400',
    anthropic: 'bg-orange-400',
    groq: 'bg-purple-400',
  }

  const key = name?.toLowerCase() || ''
  const matched = Object.keys(colors).find((item) => key.includes(item))

  return (
    <span
      className={`inline-block h-2 w-2 shrink-0 rounded-full ${
        colors[matched] || 'bg-white/40'
      }`}
    />
  )
}

const StatusMessage = ({ type, children, onClose }) => {
  const success = type === 'success'

  return (
    <div
      className={`mb-4 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
        success
          ? 'border-emerald-500/20 bg-emerald-500/[0.07] text-emerald-300'
          : 'border-red-500/20 bg-red-500/[0.07] text-red-400'
      }`}
    >
      {success ? (
        <CheckCircle size={16} className="mt-0.5 shrink-0" />
      ) : (
        <AlertCircle size={16} className="mt-0.5 shrink-0" />
      )}

      <span className="min-w-0 flex-1">{children}</span>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 opacity-50 transition hover:opacity-100"
        >
          <X size={15} />
        </button>
      )}
    </div>
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
  const [deletingId, setDeletingId] = useState('')

  const { refetch } = useAuth()

  const selectedProvider = PROVIDERS.find((item) => item.id === provider)

  // Load credentials
  const loadCredentials = useCallback(async () => {
    setLoading(true)
    setFetchError('')

    try {
      const response = await fetch(`${API_BASE}/api/credentials`, {
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || data.error || 'Failed to load credentials.',
        )
      }

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

  // Add credential
  const handleAddCredential = async (event) => {
    event.preventDefault()

    if (!provider.trim() || !apiKey.trim()) {
      setSubmitError('Provider and API key are required.')
      return
    }

    setSubmitting(true)
    setSubmitError('')
    setSubmitSuccess('')

    try {
      const csrfHeaders = await getCsrfHeaders()

      const response = await fetch(`${API_BASE}/api/credentials`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...csrfHeaders,
        },
        body: JSON.stringify({
          provider_name: provider.trim(),
          API: apiKey.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || data.error || 'Failed to add credential.',
        )
      }

      setSubmitSuccess(
        `${data.providerName || selectedProvider?.label || provider} credential added successfully.`,
      )

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

  // Delete credential
  const handleDeleteCredential = async (credential) => {
    if (!credential?.id || deletingId) return

    const confirmed = window.confirm(
      `Delete the ${credential.providerName} credential? This cannot be undone.`,
    )

    if (!confirmed) return

    setDeletingId(credential.id)
    setSubmitError('')
    setSubmitSuccess('')

    try {
      const csrfHeaders = await getCsrfHeaders()

      const response = await fetch(
        `${API_BASE}/api/credentials/${encodeURIComponent(credential.id)}`,
        {
          method: 'DELETE',
          credentials: 'include',
          headers: csrfHeaders,
        },
      )

      if (response.status === 401 || response.status === 403) {
        await refetch()
        throw new Error(
          'Your session has expired or this action is not authorized. Please sign in again.',
        )
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))

        throw new Error(
          data.message || data.error || 'Failed to delete credential.',
        )
      }

      setCredentials((current) =>
        current.filter((item) => item.id !== credential.id),
      )

      setSubmitSuccess(`${credential.providerName} credential deleted.`)
    } catch (err) {
      setSubmitError(err.message || 'Could not delete credential.')
    } finally {
      setDeletingId('')
    }
  }

  const openForm = () => {
    setFormOpen(true)
    setSubmitError('')
    setSubmitSuccess('')
  }

  const closeForm = () => {
    if (submitting) return

    setFormOpen(false)
    setProvider('')
    setApiKey('')
    setSubmitError('')
  }

  return (
    <div className="min-h-screen bg-black text-white">

      {/* TOP NAVIGATION */}
      <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-white/[0.08] bg-black/90 px-6 backdrop-blur-xl sm:px-10">
        <Link
          to="/chat"
          className="text-lg font-semibold tracking-[0.16em] text-white"
        >
          VECTRA
        </Link>

        <Link
          to="/chat"
          className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3.5 py-2 text-xs text-white/55 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
        >
          <ArrowLeft size={14} />
          Back to workspace
        </Link>
      </header>

      {/* MAIN CONTENT */}
      <main className="mx-auto max-w-5xl px-5 py-12 sm:px-8 lg:py-16">

        {/* PAGE HEADER */}
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
              Workspace settings
            </p>

            <h1 className="mt-3 text-3xl font-medium tracking-[-0.045em] text-white sm:text-4xl">
              Your API keys.
            </h1>

            <p className="mt-3 max-w-md text-sm leading-6 text-white/40">
              Connect your AI providers and bring your own models into Vectra.
              Your credentials stay under your control.
            </p>
          </div>

          <button
            id="add-credential-btn"
            type="button"
            onClick={formOpen ? closeForm : openForm}
            className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-xs font-semibold text-black transition hover:bg-white/85 active:scale-[0.98]"
          >
            {formOpen ? <X size={15} /> : <Plus size={15} />}
            {formOpen ? 'Close form' : 'Add API key'}
          </button>
        </div>

        {/* SUCCESS / ERROR MESSAGES */}
        {submitSuccess && (
          <StatusMessage
            type="success"
            onClose={() => setSubmitSuccess('')}
          >
            {submitSuccess}
          </StatusMessage>
        )}

        {submitError && !formOpen && (
          <StatusMessage
            type="error"
            onClose={() => setSubmitError('')}
          >
            {submitError}
          </StatusMessage>
        )}

        {/* SECURITY OVERVIEW */}
        <section className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/[0.08] bg-[#090909] p-5">
            <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.035] text-white/60">
              <Key size={17} />
            </div>

            <p className="text-2xl font-medium tracking-tight text-white">
              {credentials.length}
            </p>

            <p className="mt-1 text-xs text-white/35">
              Connected credentials
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-[#090909] p-5">
            <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.035] text-white/60">
              <Zap size={17} />
            </div>

            <p className="text-2xl font-medium tracking-tight text-white">
              {new Set(credentials.map((item) => item.providerName)).size}
            </p>

            <p className="mt-1 text-xs text-white/35">
              Provider types
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-[#090909] p-5">
            <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.035] text-white/60">
              <ShieldCheck size={17} />
            </div>

            <p className="text-sm font-medium text-white/85">
              BYOK enabled
            </p>

            <p className="mt-1 text-xs text-white/35">
              Bring your own keys
            </p>
          </div>
        </section>

        {/* ADD CREDENTIAL FORM */}
        {formOpen && (
          <section className="mb-10 overflow-hidden rounded-2xl border border-white/[0.1] bg-[#090909]">
            <div className="border-b border-white/[0.07] px-6 py-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">
                New connection
              </p>

              <h2 className="mt-2 text-lg font-medium text-white/90">
                Add an API credential
              </h2>

              <p className="mt-1 text-xs text-white/35">
                Choose a provider and enter your API key.
              </p>
            </div>

            <form onSubmit={handleAddCredential} className="p-6">

              {/* PROVIDER SELECT */}
              <div className="mb-5">
                <label
                  htmlFor="provider-select"
                  className="mb-2 block text-xs font-medium text-white/55"
                >
                  AI provider
                </label>

                <div className="relative">
                  <select
                    id="provider-select"
                    value={provider}
                    onChange={(event) => setProvider(event.target.value)}
                    required
                    className="w-full appearance-none rounded-lg border border-white/[0.09] bg-white/[0.035] px-4 py-3 pr-10 text-sm text-white outline-none transition focus:border-white/30"
                  >
                    <option value="" className="bg-[#111111]">
                      Select a provider
                    </option>

                    {PROVIDERS.map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                        className="bg-[#111111]"
                      >
                        {item.label}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/35"
                  />
                </div>

                {selectedProvider && (
                  <p className="mt-2 text-xs text-white/35">
                    {selectedProvider.description}
                  </p>
                )}
              </div>

              {/* API KEY INPUT */}
              <div className="mb-5">
                <label
                  htmlFor="api-key-input"
                  className="mb-2 block text-xs font-medium text-white/55"
                >
                  API key
                </label>

                <input
                  id="api-key-input"
                  type="password"
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value)}
                  placeholder={
                    selectedProvider?.placeholder || 'Paste your API key...'
                  }
                  required
                  autoComplete="off"
                  className="w-full rounded-lg border border-white/[0.09] bg-white/[0.035] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
                />

                <div className="mt-2 flex items-start gap-2">
                  <LockKeyhole
                    size={12}
                    className="mt-0.5 shrink-0 text-white/30"
                  />

                  <p className="text-[11px] leading-5 text-white/35">
                    Your key is sent securely to Vectra for encrypted storage.
                    Never share your API key with anyone.
                  </p>
                </div>
              </div>

              {submitError && (
                <StatusMessage
                  type="error"
                  onClose={() => setSubmitError('')}
                >
                  {submitError}
                </StatusMessage>
              )}

              {/* FORM ACTIONS */}
              <div className="flex flex-col-reverse gap-2 border-t border-white/[0.07] pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={submitting}
                  className="rounded-lg border border-white/[0.09] px-5 py-2.5 text-xs font-medium text-white/55 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
                >
                  Cancel
                </button>

                <button
                  id="submit-credential"
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-xs font-semibold text-black transition hover:bg-white/85 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Plus size={14} />
                  )}

                  {submitting ? 'Connecting...' : 'Connect provider'}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* REGISTERED CREDENTIALS */}
        <section>
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">
                Connections
              </p>

              <h2 className="mt-2 text-lg font-medium text-white/90">
                Registered credentials
              </h2>

              <p className="mt-1 text-xs text-white/35">
                Manage your connected AI providers.
              </p>
            </div>

            <button
              type="button"
              onClick={loadCredentials}
              disabled={loading}
              className="rounded-lg border border-white/[0.08] p-2.5 text-white/35 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
              title="Refresh credentials"
            >
              <Loader2
                size={15}
                className={loading ? 'animate-spin' : ''}
              />
            </button>
          </div>

          {fetchError && (
            <StatusMessage type="error">
              {fetchError}
            </StatusMessage>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.07] bg-[#090909] py-16">
              <Loader2 size={22} className="animate-spin text-white/35" />
              <p className="mt-3 text-xs text-white/30">
                Loading credentials...
              </p>
            </div>
          ) : credentials.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.015] px-5 py-16 text-center">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.035] text-white/50">
                <Key size={22} strokeWidth={1.5} />
              </div>

              <h3 className="text-sm font-medium text-white/80">
                No credentials connected
              </h3>

              <p className="mt-2 max-w-xs text-xs leading-5 text-white/35">
                Connect your first AI provider to start using its models
                inside the Vectra workspace.
              </p>

              <button
                type="button"
                onClick={openForm}
                className="mt-5 flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-xs font-semibold text-black transition hover:bg-white/85"
              >
                <Plus size={14} />
                Add your first key
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {credentials.map((credential) => (
                <div
                  key={credential.id}
                  className="group flex flex-col gap-4 rounded-xl border border-white/[0.08] bg-[#090909] p-4 transition hover:border-white/[0.15] sm:flex-row sm:items-center sm:px-5"
                >
                  {/* PROVIDER ICON */}
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035]">
                    <Key size={18} className="text-white/60" />
                  </div>

                  {/* PROVIDER DETAILS */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <ProviderDot name={credential.providerName} />

                      <p className="truncate text-sm font-medium text-white/85">
                        {credential.providerName}
                      </p>
                    </div>

                    <p className="mt-1 font-mono text-[10px] text-white/30">
                      {credential.id
                        ? `ID: ${credential.id.slice(0, 8)}...`
                        : 'Credential ID unavailable'}
                    </p>
                  </div>

                  {/* STATUS */}
                  <div className="flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.035] px-3 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                    <span className="text-[10px] font-medium text-white/55">
                      Connected
                    </span>
                  </div>

                  {/* DELETE */}
                  <button
                    type="button"
                    onClick={() => handleDeleteCredential(credential)}
                    disabled={Boolean(deletingId)}
                    title="Delete credential"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/30 transition hover:bg-red-500/[0.08] hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {deletingId === credential.id ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Trash2 size={15} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SECURITY INFORMATION */}
        <section className="mt-10 rounded-2xl border border-white/[0.08] bg-[#090909] p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-white/55">
              <ShieldCheck size={19} />
            </div>

            <div>
              <h3 className="text-sm font-medium text-white/80">
                Bring Your Own Key
              </h3>

              <p className="mt-2 text-xs leading-6 text-white/40">
                Vectra uses your own provider credentials to access AI models.
                According to the platform's credential-storage design, keys
                are encrypted at rest and are not exposed in normal credential
                responses. You can remove a credential whenever you choose.
              </p>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/[0.07] pt-6 sm:flex-row">
          <p className="text-[10px] tracking-wide text-white/25">
            VECTRA · YOUR MODELS. YOUR WORKFLOW. YOUR CONTROL.
          </p>

          <Link
            to="/account"
            className="flex items-center gap-2 text-xs text-white/35 transition hover:text-white/75"
          >
            Account settings
            <ExternalLink size={12} />
          </Link>
        </div>

      </main>
    </div>
  )
}

export default Credentials
  