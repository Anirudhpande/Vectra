import React, { useState } from 'react'

import {
  PlusSquare,
  MessageSquare,
  BrainCircuit,
  KeyIcon,
  GitGraphIcon,
  Settings,
  MoreHorizontal,
} from 'lucide-react'

import chutmali from '../../../assets/chutmali.jpg'

export const AccountDetails = ({ className = '' }) => {
  const [activeItem, setActiveItem] = useState('Messages')

  const navItems = [
    { label: 'New Chat', icon: PlusSquare },
    { label: 'Messages', icon: MessageSquare },
    { label: 'Models', icon: BrainCircuit },
    { label: 'API Credentials', icon: KeyIcon },
    { label: 'Analytics', icon: GitGraphIcon },
    { label: 'Settings', icon: Settings },
  ]

  const activeIndex = navItems.findIndex(
    (item) => item.label === activeItem
  )

  const beforeItems = navItems.slice(0, activeIndex)
  const afterItems = navItems.slice(activeIndex + 1)

  const ActiveIcon = navItems[activeIndex].icon

  // Normal navigation buttons
  const renderNavItem = (item) => {
    const Icon = item.icon

    return (
      <button
        key={item.label}
        onClick={() => setActiveItem(item.label)}
        className="flex w-full items-center gap-3 rounded-lg px-2 py-3 text-left text-white/80 transition-colors hover:bg-white/10"
      >
        <Icon size={20} />
        <span>{item.label}</span>
      </button>
    )
  }

  return (
    <aside
      className={`h-screen shrink-0 overflow-hidden bg-[#242433] text-white ${
        className || 'w-1/8'
      }`}
    >
      <div className="flex h-full min-h-0 flex-col">

        {/* TOP RED SECTION */}
        <div className=" rounded-br-3xl bg-[#ed2448] p-4">

          {/* Profile */}
          <div className="relative flex flex-col items-center gap-3 py-2">

            <button
              type="button"
              className="absolute right-0 top-0"
              aria-label="More options"
            >
              <MoreHorizontal size={22} />
            </button>

            <img
              src={chutmali}
              alt="Profile"
              className="h-40 w-40 rounded-full object-cover mt-5 mb-3"
            />

            <p className="text-xl font-medium">
              Hello, Randy
            </p>
          </div>

          {/* Items before the selected button */}
          <nav className="mt-3 flex flex-col">
            {beforeItems.map(renderNavItem)}
          </nav>
        </div>

        {/* ACTIVE DARK STRIP */}
        <button
          onClick={() => setActiveItem(activeItem)}
          className="-mx-3 flex w-[calc(100%+1.5rem)] shrink-0 items-center gap-3 bg-[#242433] px-6 py-3 text-left text-white"
          aria-current="page"
        >
          <ActiveIcon size={20} />
          <span>{activeItem}</span>
        </button>

        {/* BOTTOM RED SECTION */}
        <div className="flex min-h-0 flex-1 flex-col rounded-tr-3xl bg-[#ed2448] p-4">

          <nav className="flex flex-col">
            {afterItems.map(renderNavItem)}
          </nav>

        </div>
      </div>
    </aside>
  )
}