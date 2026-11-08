import { ArrowUpRight, Bot, KeyRound, Sparkles, Workflow } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from './Components/Navbar'
import { useAuth } from '../../context/AuthContext'

const signalRows = [
  ['OpenAI', 'Connected', 'bg-white'],
  ['Groq', 'Ready', 'bg-white/70'],
  ['Gemini', 'Available', 'bg-white/45'],
]

const Home = () => {
  const { user } = useAuth()
  const primaryRoute = user ? '/chat' : '/login'

  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      <div className="home-shell relative min-h-screen overflow-hidden bg-black">
        <div className="home-grid absolute inset-0 opacity-25" />
        <Navbar />

        <section className="relative grid min-h-[72vh] gap-10 px-6 pb-8 pt-30 lg:grid-cols-[1.05fr_.95fr] lg:px-16 lg:pb-14 lg:pt-36">
          <div className="flex max-w-2xl flex-col justify-center">
            <div className="mb-7 flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              AI workspace online
            </div>
            <h1 className="max-w-xl text-5xl font-medium leading-[.95] tracking-[-.06em] text-white sm:text-7xl lg:text-8xl">
              Think wider.<br />
              <span className="text-white/55">Build faster.</span><br />
              Stay in flow.
            </h1>
            <p className="mt-7 max-w-md text-sm leading-7 text-slate-300/70 sm:text-base">
              Vectra brings your models, conversations, and encrypted provider keys into one calm command center.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to={primaryRoute} className="group inline-flex items-center gap-3 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/85">
                {user ? 'Open workspace' : 'Start with Vectra'}
                <ArrowUpRight size={16} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link to="/credentials" className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.03] px-5 py-3 text-sm font-medium text-white/80 transition hover:bg-white/[0.08]">
                <KeyRound size={16} /> Manage API keys
              </Link>
            </div>
          </div>

          <div className="relative flex min-h-105 items-center lg:min-h-125">
            <div className="absolute inset-x-3 inset-y-8 border border-white/[0.09] bg-white/[0.015]" />
            <div className="relative mx-auto w-[82%] border border-white/[0.12] bg-black p-5 sm:p-7">
              <div className="flex items-center justify-between border-b border-white/[0.09] pb-4 text-[10px] uppercase tracking-[.2em] text-white/35"><span>Vectra workspace</span><span className="text-white/80">Live</span></div>
              <div className="py-9 sm:py-13"><p className="text-[10px] uppercase tracking-[.2em] text-white/35">One prompt, many possibilities</p><p className="mt-4 max-w-sm text-3xl font-medium leading-tight tracking-[-.045em] text-white sm:text-4xl">Choose a model. Keep your context. Move ideas forward.</p></div>
              <div className="grid grid-cols-2 gap-3 border-t border-white/[0.09] pt-5 text-xs"><div><p className="text-white/35">Conversations</p><p className="mt-1 text-xl text-white">Persistent</p></div><div><p className="text-white/35">Credentials</p><p className="mt-1 text-xl text-white">Encrypted</p></div></div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 grid grid-cols-3 gap-3 px-2 sm:px-6">
              <div className="home-mini-card"><Bot size={17} /><span>Multi-model</span></div>
              <div className="home-mini-card"><Workflow size={17} /><span>Context aware</span></div>
              <div className="home-mini-card"><Sparkles size={17} /><span>BYOK secure</span></div>
            </div>
          </div>
        </section>

        <section className="relative grid gap-3 px-6 pb-8 sm:grid-cols-3 lg:px-16 lg:pb-12">
          <div className="home-status-card sm:col-span-2">
            <div className="flex items-center justify-between"><div><p className="home-kicker">Provider signal</p><p className="mt-1 text-lg font-medium">Your AI control plane</p></div><span className="h-2 w-2 rounded-full bg-white" /></div>
            <div className="mt-5 grid gap-2 sm:grid-cols-3">{signalRows.map(([name, status, color]) => <div className="rounded-xl border border-white/7 bg-black/15 px-3 py-3" key={name}><div className="flex items-center gap-2 text-xs text-white/80"><span className={`h-2 w-2 rounded-full ${color}`} />{name}</div><p className="mt-1 text-[11px] text-slate-400">{status}</p></div>)}</div>
          </div>
          <div className="home-status-card flex flex-col justify-between"><p className="home-kicker">Private by design</p><p className="text-lg font-medium">Your keys stay yours.</p><p className="text-sm leading-6 text-slate-400">Encrypted credentials and owner-scoped conversations, without the clutter.</p></div>
        </section>
      </div>
    </main>
  )
}

export default Home
