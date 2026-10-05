import React from "react";
import { Link } from "react-router-dom";

const AboutUs = () => {
  return (
    <section className="bg-black px-10 py-24 text-white">

      {/* Heading */}
      <h2 className="mb-16 text-center text-4xl font-bold uppercase tracking-widest">
        About Vectra
      </h2>

      {/* First Row */}
      <div className="mx-auto flex max-w-6xl items-center gap-10 ">

        {/* Main Card */}
        <div className="flex flex-1 items-center gap-8 rounded-4xl border border-white/10 p-6 backdrop-blur-sm bg-purple-950">

          <div className="h-68 w-1/3 overflow-hidden rounded-xl">
            <img
              src="YOUR_IMAGE_URL"
              alt="Vectra workspace"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex-1">
            <p className="mb-3 text-xs tracking-[0.3em] text-white/40">
              01 / THE IDEA
            </p>

            <h3 className="text-2xl font-bold uppercase">
              Why Vectra?
            </h3>

            <p className="mt-4 text-sm leading-relaxed text-white/60">
              Vectra brings your AI tools into one workspace.
              Use the models you already rely on without rebuilding
              your workflow every time.
            </p>
          </div>

        </div>

        {/* Right Text */}
        <div className="w-52 text-center">

          <p className="text-sm font-medium text-white">
            Your AI, your way.
          </p>

          <p className="mt-3 text-xs leading-relaxed text-white/40">
            Connect your own keys and keep your workflow under
            your control.
          </p>

          <Link to="/Chat" className="mt-5 inline-block border bg-green-800 border-white/20 px-5 py-2 text-xs tracking-widest text-white/70 transition hover:border-white hover:bg-white hover:text-black">
            GET STARTED →
            </Link>

        </div>

      </div>

      {/* Second Row */}
      <div className="mx-auto mt-10 flex max-w-6xl items-center gap-10">

        {/* Left Text */}
        <div className="w-52 text-center">

          <p className="text-sm font-medium text-white">
            Built for flexibility.
          </p>

          <p className="mt-3 text-xs leading-relaxed text-white/40">
            Choose your provider, bring your key, and work your way.
          </p>

          <button className="mt-5 border border-white/20 px-5 py-2 text-xs bg-green-800 tracking-widest text-white/70 transition hover:border-white hover:bg-white hover:text-black">
            LEARN MORE →
          </button>

        </div>

        {/* Second Card */}
        <div className="flex flex-1 items-center gap-8 rounded-4xl border border-white/10 p-6 backdrop-blur-sm bg-rose-950">

          <div className="flex-1">
            <p className="mb-3 text-xs tracking-[0.3em] text-white/40">
              02 / BYOK
            </p>

            <h3 className="text-2xl font-bold uppercase">
              Your Keys. Your Control.
            </h3>

            <p className="mt-4 text-sm leading-relaxed text-white/60">
              Bring your own API keys and use the AI services
              you already trust without being locked into one ecosystem.
            </p>
          </div>

          <div className="h-68 w-1/3 overflow-hidden rounded-xl">
            <img
              src="YOUR_IMAGE_URL"
              alt="AI interface"
              className="h-full w-full object-cover"
            />
          </div>

        </div>

      </div>

    </section>
  );
};

export default AboutUs;