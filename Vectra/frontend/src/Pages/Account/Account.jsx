
import React from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  User,
  Mail,
  Shield,
  Hash,
  ExternalLink,
  ArrowLeft,
  KeyRound,
  MessageSquare,
  LogOut,
  CalendarDays,
  CircleUserRound,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

const ProviderBadge = ({ provider }) => {
  const providers = {
    github: 'GitHub',
    google: 'Google',
  }

  const label = providers[provider?.toLowerCase()] || provider || 'Unknown'

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.05] px-3 py-1 text-[11px] font-medium text-white/65">
      <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
      {label}
    </span>
  )
}

const Field = ({ icon: Icon, label, value }) => (
  <div className="group flex items-center gap-4 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-4 transition hover:border-white/[0.14] hover:bg-white/[0.04]">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.035] text-white/45 transition group-hover:text-white/80">
      <Icon size={17} strokeWidth={1.7} />
    </div>

    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">
        {label}
      </p>

      <p className="mt-1.5 truncate text-sm font-medium text-white/80">
        {value || (
          <span className="font-normal italic text-white/25">
            Not available
          </span>
        )}
      </p>
    </div>
  </div>
)

const ActionCard = ({ to, icon: Icon, title, description }) => (
  <Link
    to={to}
    className="group flex items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.025] p-4 transition hover:border-white/20 hover:bg-white/[0.05]"
  >
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/55 transition group-hover:bg-white/[0.09] group-hover:text-white">
      <Icon size={18} strokeWidth={1.7} />
    </div>

    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium text-white/85">
        {title}
      </p>

      <p className="mt-1 text-xs text-white/35">
        {description}
      </p>
    </div>

    <ExternalLink
      size={15}
      className="shrink-0 text-white/25 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white/70"
    />
  </Link>
)

const Account = () => {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()

  const displayName = user?.name || user?.username || 'User'
  const displayInitial = displayName.charAt(0).toUpperCase()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-white" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black">
        <CircleUserRound size={32} className="text-white/30" />

        <p className="text-sm text-white/50">
          You are not authenticated.
        </p>

        <Link
          to="/login"
          className="rounded-lg bg-white px-5 py-2.5 text-xs font-semibold text-black transition hover:bg-white/85"
        >
          Sign in
        </Link>
      </div>
    )
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

        {/* PAGE INTRO */}
        <div className="mb-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
            Workspace settings
          </p>

          <h1 className="mt-3 text-3xl font-medium tracking-[-0.045em] text-white sm:text-4xl">
            Your account.
          </h1>

          <p className="mt-3 max-w-md text-sm leading-6 text-white/40">
            Manage your profile and authentication details associated with your Vectra account.
          </p>
        </div>

        {/* PROFILE HERO */}
        <section className="mb-10 overflow-hidden rounded-2xl border border-white/[0.09] bg-[#090909]">

          <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">

            <div className="flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-2xl border border-white/[0.12] bg-white/[0.055] text-3xl font-medium text-white">
              {displayInitial}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-medium tracking-tight text-white">
                  {displayName}
                </h2>

                <ProviderBadge provider={user.provider} />
              </div>

              <p className="mt-2 truncate text-sm text-white/40">
                {user.email || 'No email available'}
              </p>

              {/* <p className="mt-3 text-[11px] text-white/25">
                Authenticated through OAuth2
              </p> */}
            </div>

            {/* <div className="hidden shrink-0 items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2 sm:flex">
              <Shield size={14} className="text-white/45" />
              <span className="text-[11px] text-white/45">
                OAuth protected
              </span>
            </div> */}

          </div>

         
        </section>

        {/* PROFILE INFORMATION */}
        <section className="mb-10">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-white/85">
              Personal information
            </h3>

            <p className="mt-1 text-xs text-white/35">
              Information associated with your account.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field
              icon={User}
              label="Display name"
              value={user.name}
            />

            <Field
              icon={Mail}
              label="Email address"
              value={user.email}
            />

            <Field
              icon={Hash}
              label="Username"
              value={user.username}
            />

            <Field
              icon={CircleUserRound}
              label="Account identity"
              value={user.provider}
            />
          </div>
        </section>

        {/* AUTHENTICATION */}
        <section className="mb-10">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-white/85">
              Authentication
            </h3>

            <p className="mt-1 text-xs text-white/35">
              Details about how you access Vectra.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field
              icon={Shield}
              label="Authentication provider"
              value={user.provider}
            />

            <Field
              icon={Hash}
              label="Provider ID"
              value={user.providerID}
            />
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="mb-10">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-white/85">
              Quick access
            </h3>

            <p className="mt-1 text-xs text-white/35">
              Get back to the things you use most.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <ActionCard
              to="/credentials"
              icon={KeyRound}
              title="API credentials"
              description="Manage your connected provider keys."
            />

            <ActionCard
              to="/chat"
              icon={MessageSquare}
              title="Chat workspace"
              description="Continue your conversations."
            />
          </div>
        </section>

        {/* ACCOUNT FOOTER */}
        <section className="flex flex-col gap-4 border-t border-white/[0.08] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium text-white/65">
              Your account, your control.
            </p>

            <p className="mt-1 text-[11px] text-white/30">
              Manage your connected services from your workspace.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 rounded-lg border border-white/[0.1] px-4 py-2.5 text-xs font-medium text-white/55 transition hover:border-red-500/30 hover:bg-red-500/[0.06] hover:text-red-400"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </section>

        <p className="mt-10 text-center text-[10px] tracking-wide text-white/20">
          VECTRA · YOUR MODELS. YOUR WORKFLOW. YOUR CONTROL.
        </p>

      </main>
    </div>
  )
}

export default Account
