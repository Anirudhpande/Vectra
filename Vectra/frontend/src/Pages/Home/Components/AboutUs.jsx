
import React from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  KeyRound,
  Layers3,
  ShieldCheck,
  Workflow,
  Zap,
} from 'lucide-react'

const AboutUs = () => {
  return (
    <section className="relative overflow-hidden px-6 py-28 text-white lg:px-16 mt-10">

      {/* Subtle background detail */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(255,255,255,0.045),transparent_65%)]" />

      <div className="relative z-10 mx-auto max-w-[1400px]">

        {/* Section Heading */}
        <div className="mb-16">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.35em] text-white/40">
            Beyond a single model
          </p>

          <h2 className="max-w-3xl text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
            One workspace.
            <span className="text-white/40"> Infinite possibilities.</span>
          </h2>

          <p className="mt-5 max-w-xl text-sm leading-7 text-white/50">
            Everything you need to work with AI, without being tied
            down to a single provider or ecosystem.
          </p>
        </div>

        {/* Feature 01 */}
        <div className="group grid overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a] lg:grid-cols-[1.1fr_0.9fr]">

          {/* Visual Panel */}
          <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden border-b border-white/10 bg-[#101010] p-8 lg:border-b-0 lg:border-r">

            <div className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: 'radial-gradient(#ffffff 0.7px, transparent 0.7px)',
                backgroundSize: '24px 24px',
              }}
            />

            <div className="relative w-full max-w-lg">

              <div className="mb-4 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                  Vectra / Workspace
                </span>
                <span className="flex items-center gap-2 text-[10px] text-white/40">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  Connected
                </span>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/80 p-5 shadow-2xl backdrop-blur-xl">

                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers3 size={16} className="text-white/70" />
                    <span className="text-sm font-medium">Model selection</span>
                  </div>
                  <span className="text-[10px] text-white/30">03 providers</span>
                </div>

                <div className="space-y-2">
                  {[
                    ['OpenAI', 'GPT models'],
                    ['Anthropic', 'Claude models'],
                    ['Google', 'Gemini models'],
                  ].map(([name, model], index) => (
                    <div
                      key={name}
                      className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                        index === 0
                          ? 'border-white/25 bg-white/[0.07]'
                          : 'border-white/5 bg-white/[0.02]'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-medium text-white/90">{name}</p>
                        <p className="mt-1 text-[10px] text-white/35">{model}</p>
                      </div>

                      <span className={`h-2 w-2 rounded-full ${
                        index === 0 ? 'bg-white' : 'bg-white/20'
                      }`} />
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-[10px] text-white/35">Unified AI workspace</span>
                  <Zap size={15} className="text-white/60" />
                </div>

              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">

            <p className="mb-5 text-[10px] uppercase tracking-[0.3em] text-white/35">
              01 / THE IDEA
            </p>

            <h3 className="max-w-md text-3xl font-medium tracking-tight sm:text-4xl">
              Why settle for one AI?
            </h3>

            <p className="mt-6 max-w-lg text-sm leading-7 text-white/50">
              Your workflow shouldn't be limited by the AI provider
              you choose. Vectra brings multiple models into one
              unified workspace, making it easier to switch,
              experiment and get things done.
            </p>

            <div className="mt-8 flex items-center gap-3 text-xs text-white/50">
              <Workflow size={16} />
              <span>One interface. Multiple providers.</span>
            </div>

            <Link
              to="/chat"
              className="mt-10 flex w-fit items-center gap-3 rounded-xl bg-white px-5 py-3 text-xs font-semibold text-black transition hover:bg-white/85"
            >
              Explore workspace
              <ArrowUpRight size={15} />
            </Link>

          </div>
        </div>

        {/* Feature 02 */}
        <div className="mt-6 grid overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a] lg:grid-cols-[0.9fr_1.1fr]">

          {/* Content */}
          <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">

            <p className="mb-5 text-[10px] uppercase tracking-[0.3em] text-white/35">
              02 / BYOK
            </p>

            <h3 className="max-w-md text-3xl font-medium tracking-tight sm:text-4xl">
              Your keys. Your control.
            </h3>

            <p className="mt-6 max-w-lg text-sm leading-7 text-white/50">
              Bring your own API keys and connect the providers
              you already use. Keep control over your credentials
              while accessing different AI models through Vectra.
            </p>

            <div className="mt-8 flex items-center gap-3 text-xs text-white/50">
              <ShieldCheck size={16} />
              <span>Encrypted credentials. Your ownership.</span>
            </div>

            <Link
              to="/credentials"
              className="mt-10 flex w-fit items-center gap-3 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3 text-xs font-semibold text-white transition hover:bg-white hover:text-black"
            >
              Manage credentials
              <ArrowUpRight size={15} />
            </Link>

          </div>

          {/* Visual Panel */}
          <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden border-t border-white/10 bg-[#101010] p-8 lg:border-l lg:border-t-0">

            <div className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: 'radial-gradient(#ffffff 0.7px, transparent 0.7px)',
                backgroundSize: '24px 24px',
              }}
            />

            <div className="relative w-full max-w-lg">

              <div className="mb-4 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                  Vectra / Credentials
                </span>
                <ShieldCheck size={15} className="text-white/50" />
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/80 p-6 shadow-2xl backdrop-blur-xl">

                <div className="mb-8 flex items-center gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/[0.06] p-3">
                    <KeyRound size={21} className="text-white/80" />
                  </div>

                  <div>
                    <p className="text-sm font-medium">API credentials</p>
                    <p className="mt-1 text-[10px] text-white/35">
                      Your connected providers
                    </p>
                  </div>
                </div>

                <div className="space-y-4">

                  {['OpenAI API Key', 'Groq API Key', 'Gemini API Key'].map((name) => (
                    <div key={name} className="border-b border-white/10 pb-4 last:border-0 last:pb-0">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs text-white/70">{name}</span>
                        <span className="text-[9px] uppercase tracking-wider text-white/40">
                          Configured
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                        <span className="text-xs tracking-[0.25em] text-white/30">
                          ••••••••••••••••
                        </span>
                        <KeyRound size={12} className="text-white/30" />
                      </div>
                    </div>
                  ))}

                </div>

                <div className="mt-5 flex items-center gap-2 border-t border-white/10 pt-4">
                  <ShieldCheck size={13} className="text-white/50" />
                  <span className="text-[10px] text-white/35">
                    Credentials protected by encryption
                  </span>
                </div>

              </div>
            </div>
          </div>

        </div>

        {/* Closing Statement */}
        <div className="mt-16 flex flex-col items-start justify-between gap-6 border-t border-white/10 pt-10 sm:flex-row sm:items-center">

          <div>
            <p className="text-2xl font-medium tracking-tight">
              Your AI ecosystem, unified.
            </p>
            <p className="mt-2 text-sm text-white/40">
              Less switching. More building.
            </p>
          </div>

          <Link
            to="/chat"
            className="group flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-white/70 transition hover:text-white"
          >
            Get started
            <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </Link>

        </div>

      </div>
    </section>
  )
}

export default AboutUs
