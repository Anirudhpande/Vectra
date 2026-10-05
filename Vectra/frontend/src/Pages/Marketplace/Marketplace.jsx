import React from "react";
import ShopCard from "./components/ViewAll";
import Cards from "./components/Cards";

const Marketplace = () => {
  return (
    <div className="min-h-screen bg-[#08090D] flex flex-col">

      {/* Navbar */}
      <div className="h-20 bg-[#0D0F16] border-b border-[#252A36] flex flex-row p-10 items-center gap-10">
        <p className="text-4xl text-white font-bold">Vectra</p>

        <input
          type="search"
          placeholder="Search APIs, categories, or keywords"
          className="bg-[#161A24] border border-[#252A36] text-white placeholder:text-slate-500 rounded-4xl px-4 h-10 ml-36 mr-130 w-110 outline-none"
        />

        <div className="flex flex-row gap-6 text-slate-300 font-semibold">
          <button className="hover:text-white">Explore</button>
          <button className="hover:text-white">My Rentals</button>
          <button className="hover:text-white">Dashboard</button>
          <button className="hover:text-white">Docs</button>
        </div>

        <button className="h-10 w-30 bg-indigo-500 hover:bg-indigo-400 text-white rounded-3xl font-semibold">
          + Publish API
        </button>
      </div>


      {/* Main Layout */}
      <div className="flex flex-row gap-10">

        {/* Left Sidebar */}
        <div className="bg-[#0D0F16] border-r border-[#252A36] h-221 w-60">

          <div className="flex flex-col justify-start items-start mx-10 text-slate-300 text-xl m-10 gap-5">

            <button className="text-white">Home</button>
            <button className="hover:text-white">Browse APIs</button>
            <button className="hover:text-white">Categories</button>
            <button className="hover:text-white">Providers</button>
            <button className="hover:text-white">My Rentals</button>
            <button className="hover:text-white">Favourites</button>
            <button className="hover:text-white">Usage</button>
            <button className="hover:text-white">Billing</button>
            <button className="hover:text-white">Settings</button>

          </div>


          {/* Provider CTA */}
          <div className="bg-[#161A24] border border-[#252A36] mx-4 mt-50 h-50 rounded-4xl p-5 gap-5 flex flex-col items-center justify-start">

            <p className="text-sm text-cyan-400">
              Become a Provider
            </p>

            <p className="text-sm text-slate-400 text-center">
              Publish your API and start earning from developers worldwide
            </p>

            <button className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-4xl w-30 py-2">
              Get Started
            </button>

          </div>

        </div>


        {/* Main Content */}
        <div className="px-5 py-5 w-320">

          {/* Hero */}
          <div className="h-86 bg-gradient-to-br from-indigo-950 via-[#11141C] to-[#08090D] border border-[#252A36] px-10 py-5 rounded-4xl">

            <p className="text-cyan-400 text-sm font-semibold my-2">
              RENT. INTEGRATE. INNOVATE
            </p>

            <p className="text-white text-3xl font-bold mb-2">
              Rent Powerful APIs <br />
              Built by Developers Like You
            </p>

            <p className="text-slate-400 text-sm">
              Explore, rent, and integrate APIs to supercharge <br />
              your projects in minutes.
            </p>

            <input
              type="search"
              placeholder="Search APIs"
              className="text-white placeholder:text-slate-500 bg-[#161A24] border border-[#252A36] mt-10 h-8 w-130 rounded-3xl outline-none px-4 py-1"
            />


            {/* Stats */}
            <div className="flex flex-row mt-5 gap-10">

              <div className="flex flex-col">
                <p className="text-white text-xl font-bold">
                  1,250+
                </p>
                <p className="text-slate-500 text-sm">
                  APIs
                </p>
              </div>

              <div className="flex flex-col">
                <p className="text-white text-xl font-bold">
                  850+
                </p>
                <p className="text-slate-500 text-sm">
                  Providers
                </p>
              </div>

              <div className="flex flex-col">
                <p className="text-white text-xl font-bold">
                  12k+
                </p>
                <p className="text-slate-500 text-sm">
                  Developers
                </p>
              </div>

              <div className="flex flex-col">
                <p className="text-white text-xl font-bold">
                  99.9%
                </p>
                <p className="text-slate-500 text-sm">
                  Uptime
                </p>
              </div>

            </div>

          </div>


          {/* Categories Header */}
          <div className="flex flex-row justify-between items-start px-10 py-5">

            <p className="text-white text-xl font-bold">
              Explore Categories
            </p>

            <button className="text-indigo-400 font-semibold">
              View all
            </button>

          </div>


          {/* Categories */}
          <div className="flex flex-row h-16 w-310 gap-6 items-center px-5 overflow-x-auto scrollbar-none">

            <button className="w-32 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white shrink-0">
              AI/ML
            </button>

            <button className="w-32 h-12 rounded-2xl bg-[#161A24] border border-[#252A36] hover:border-indigo-500 text-slate-300 shrink-0">
              Finance
            </button>

            <button className="w-32 h-12 rounded-2xl bg-[#161A24] border border-[#252A36] hover:border-indigo-500 text-slate-300 shrink-0">
              Social
            </button>

            <button className="w-32 h-12 rounded-2xl bg-[#161A24] border border-[#252A36] hover:border-indigo-500 text-slate-300 shrink-0">
              Data
            </button>

            <button className="w-32 h-12 rounded-2xl bg-[#161A24] border border-[#252A36] hover:border-indigo-500 text-slate-300 shrink-0">
              Developer Tools
            </button>

            <button className="w-32 h-12 rounded-2xl bg-[#161A24] border border-[#252A36] hover:border-indigo-500 text-slate-300 shrink-0">
              E-commerce
            </button>

            <button className="w-32 h-12 rounded-2xl bg-[#161A24] border border-[#252A36] hover:border-indigo-500 text-slate-300 shrink-0">
              Communication
            </button>

            <button className="w-32 h-12 rounded-2xl bg-[#161A24] border border-[#252A36] hover:border-indigo-500 text-slate-300 shrink-0">
              LLMs
            </button>

            <button className="w-32 h-12 rounded-2xl bg-[#161A24] border border-[#252A36] hover:border-indigo-500 text-slate-300 shrink-0">
              ChatGPT
            </button>

            <button className="w-32 h-12 rounded-2xl bg-[#161A24] border border-[#252A36] hover:border-indigo-500 text-slate-300 shrink-0">
              Claude
            </button>

            <button className="w-32 h-12 rounded-2xl bg-[#161A24] border border-[#252A36] hover:border-indigo-500 text-slate-300 shrink-0">
              Opus
            </button>

          </div>


          {/* API Cards */}
          <ShopCard />

          {/*Card*/}
          <Cards /> 
          

        </div>


        {/* Right Sidebar */}
        <div className="w-80 bg-[#08090D]">

          <div className="w-80 p-6">

            <div className="bg-[#11141C] border border-[#252A36] rounded-3xl p-6">

              <div className="flex flex-row justify-between items-center mb-6">

                <p className="text-white text-xl font-bold">
                  Filters
                </p>

                <button className="text-sm text-indigo-400 font-semibold">
                  Reset
                </button>

              </div>


              {/* Category */}
              <div className="mb-6">

                <p className="text-white font-semibold text-sm mb-3">
                  Category
                </p>

                <div className="flex flex-col gap-3 text-sm text-slate-400">

                  <label className="flex items-center gap-3">
                    <input type="checkbox" />
                    AI / ML
                  </label>

                  <label className="flex items-center gap-3">
                    <input type="checkbox" />
                    Finance
                  </label>

                  <label className="flex items-center gap-3">
                    <input type="checkbox" />
                    Data
                  </label>

                  <label className="flex items-center gap-3">
                    <input type="checkbox" />
                    Developer Tools
                  </label>

                  <label className="flex items-center gap-3">
                    <input type="checkbox" />
                    E-commerce
                  </label>

                </div>

              </div>


              {/* Price */}
              <div className="mb-6">

                <p className="text-white font-semibold text-sm mb-3">
                  Price per request
                </p>

                <div className="flex flex-col gap-3 text-sm text-slate-400">

                  <label className="flex items-center gap-3">
                    <input type="checkbox" />
                    Free
                  </label>

                  <label className="flex items-center gap-3">
                    <input type="checkbox" />
                    Under $0.01
                  </label>

                  <label className="flex items-center gap-3">
                    <input type="checkbox" />
                    $0.01 – $0.10
                  </label>

                  <label className="flex items-center gap-3">
                    <input type="checkbox" />
                    $0.10+
                  </label>

                </div>

              </div>


              {/* Rating */}
              <div className="mb-6">

                <p className="text-white font-semibold text-sm mb-3">
                  Minimum Rating
                </p>

                <select className="w-full bg-[#161A24] border border-[#252A36] text-slate-300 rounded-xl px-3 py-2 text-sm outline-none">

                  <option>
                    Any rating
                  </option>

                  <option>
                    4.5+ ⭐
                  </option>

                  <option>
                    4.0+ ⭐
                  </option>

                  <option>
                    3.5+ ⭐
                  </option>

                </select>

              </div>


              {/* Sort */}
              <div className="mb-6">

                <p className="text-white font-semibold text-sm mb-3">
                  Sort By
                </p>

                <select className="w-full bg-[#161A24] border border-[#252A36] text-slate-300 rounded-xl px-3 py-2 text-sm outline-none">

                  <option>
                    Most Popular
                  </option>

                  <option>
                    Highest Rated
                  </option>

                  <option>
                    Lowest Price
                  </option>

                  <option>
                    Newest
                  </option>

                </select>

              </div>


              <button className="w-full bg-indigo-500 hover:bg-indigo-400 text-white py-3 rounded-2xl font-semibold">
                Apply Filters
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Marketplace;