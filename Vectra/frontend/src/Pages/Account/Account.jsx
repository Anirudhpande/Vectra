import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { User, Mail, Shield, Hash, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

const ProviderBadge = ({ provider }) => {
  const badges = {
    github: { label: 'GitHub', color: 'bg-white/10 text-white/70' },
    google: { label: 'Google', color: 'bg-blue-500/15 text-blue-300' },
  }
  const badge = badges[provider?.toLowerCase()] || {
    label: provider || 'Unknown',
    color: 'bg-white/10 text-white/50',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.color}`}>
      {badge.label}
    </span>
  )
}

const Field = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5">
    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400">
      <Icon size={15} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-medium uppercase tracking-widest text-white/30">{label}</p>
      <p className="mt-1 truncate text-sm text-white/80">
        {value || <span className="text-white/20 italic">Not available</span>}
      </p>
    </div>
  </div>
)

const Account = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#09090E]">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-indigo-500" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#09090E]">
        <p className="text-sm text-white/40">Not authenticated</p>
      </div>
    )
  }

  const displayName = user.name || user.username || 'User'
  const displayInitial = displayName.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-[#09090E] pt-16">
      <div className="mx-auto max-w-2xl px-6 py-12">

        {/* Header */}
        <div className="mb-8 flex items-center gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-600/20 text-2xl font-bold text-indigo-300">
            {displayInitial}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">{displayName}</h1>
            <div className="mt-1 flex items-center gap-2">
              <ProviderBadge provider={user.provider} />
              <span className="text-xs text-white/30">OAuth2 account</span>
            </div>
          </div>
        </div>

        {/* Profile info section */}
        <section className="mb-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/30">
            Profile
          </h2>
          <div className="flex flex-col gap-2">
            <Field icon={User} label="Display name" value={user.name} />
            <Field icon={Mail} label="Email" value={user.email} />
            <Field icon={Hash} label="Username" value={user.username} />
          </div>
        </section>

        {/* Auth info section */}
        <section className="mb-8">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/30">
            Authentication
          </h2>
          <div className="flex flex-col gap-2">
            <Field icon={Shield} label="Provider" value={user.provider} />
            <Field icon={Hash} label="Provider ID" value={user.providerID} />
          </div>
        </section>

        {/* Quick actions */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/30">
            Quick actions
          </h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Link
              to="/credentials"
              className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5 text-sm text-white/70 transition hover:border-white/[0.1] hover:bg-white/[0.04] hover:text-white"
            >
              Manage API Keys
              <ExternalLink size={14} className="text-white/30" />
            </Link>
            <Link
              to="/chat"
              className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5 text-sm text-white/70 transition hover:border-white/[0.1] hover:bg-white/[0.04] hover:text-white"
            >
              Go to Chat
              <ExternalLink size={14} className="text-white/30" />
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}

export default Account