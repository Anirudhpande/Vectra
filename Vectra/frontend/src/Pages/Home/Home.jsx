
import { ArrowUpRight, KeyRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from './Components/Navbar'
import { useAuth } from '../../context/AuthContext'
import HomePageLogo from '../../assets/Home.png'
import AboutUs from './Components/AboutUs'

const signalRows = [
  ['OpenAI', 'Connected', 'bg-white'],
  ['Groq', 'Ready', 'bg-white/70'],
  ['Gemini', 'Available', 'bg-white/45'],
]

const Home = () => {
  const { user } = useAuth()
  const primaryRoute = user ? '/chat' : '/login'

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-black text-white"
      style={{
  backgroundImage: `
    linear-gradient(
      to bottom,
      rgba(0,0,0,0.4),
      rgba(0,0,0,0),
      rgba(0,0,0,0.65),
      #000
    ),
    url("${HomePageLogo}")
  `,
  backgroundSize: '100% auto',
  backgroundPosition: 'center top',
  backgroundRepeat: 'no-repeat',
  backgroundAttachment: 'fixed',
}}
    >

      <div className="relative z-10 min-h-screen">

        {/* Navbar */}
        <Navbar />

        {/* Hero Section */}
        <section className="grid min-h-[85vh] items-center gap-10 px-6 py-24 lg:grid-cols-[1.05fr_.95fr] lg:px-16 lg:py-32">

          <div className="flex max-w-2xl flex-col justify-center">

            <div className="mb-7 flex w-fit items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3 py-1.5 backdrop-blur-md">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70">
                AI workspace online
              </span>
            </div>

            <h1 className="max-w-xl text-5xl font-medium leading-[0.98] tracking-[-0.06em] sm:text-7xl lg:text-8xl">
              Think wider.
              <br />
              <span className="text-white/60">
                Build faster.
              </span>
              <br />
              Stay in flow.
            </h1>

            <p className="mt-8 max-w-md text-sm leading-7 text-white/70 sm:text-base">
              Vectra brings your models, conversations, and
              encrypted provider keys into one calm command center.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">

              <Link
                to={primaryRoute}
                className="group inline-flex items-center gap-3 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition-all duration-300 hover:bg-white/85"
              >
                {user ? 'Open workspace' : 'Start with Vectra'}

                <ArrowUpRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>

              <Link
                to={user ? '/credentials' : '/login'}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-black/30 px-6 py-3 text-sm font-medium text-white/90 backdrop-blur-md transition-all duration-300 hover:bg-white/10"
              >
                <KeyRound size={16} />
                Manage API keys
              </Link>

            </div>
          </div>
        </section>

        <AboutUs />

        {/* Provider Section */}
        <section className="grid gap-4 px-6 pb-12 sm:grid-cols-3 lg:px-16 lg:pb-16">

          <div className="rounded-2xl border border-white/10 bg-black/50 p-6 backdrop-blur-xl sm:col-span-2">

            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
                  Provider signal
                </p>

                <p className="mt-2 text-lg font-medium">
                  Your AI control plane
                </p>
              </div>

              <span className="h-2 w-2 rounded-full bg-white" />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">

              {signalRows.map(([name, status, color]) => (
                <div
                  key={name}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4"
                >
                  <div className="flex items-center gap-2 text-xs text-white/80">
                    <span className={`h-2 w-2 rounded-full ${color}`} />
                    {name}
                  </div>

                  <p className="mt-2 text-[11px] text-white/50">
                    {status}
                  </p>
                </div>
              ))}

            </div>
          </div>

          {/* Privacy Card */}
          <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-black/50 p-6 backdrop-blur-xl">

            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
              Private by design
            </p>

            <p className="text-lg font-medium">
              Your keys stay yours.
            </p>

            <p className="text-sm leading-6 text-white/60">
              Encrypted credentials and owner-scoped conversations,
              without the clutter.
            </p>

          </div>

        </section>

      </div>
    </main>
  )
}

export default Home
