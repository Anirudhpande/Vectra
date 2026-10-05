import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    
    <nav className='absolute top-0 left-0 z-50 w-full'>
      <div className='flex flex-col'>
      <div className='w-full flex flex-row justify-between items-center py-2 px-10 text-gray-400'>
        <div>
          <h2 className='text-5xl'>Vectra</h2>
        </div>

        <div className='flex flex-row gap-5 pr-10'>
          <Link to="/">Home</Link>
          <Link to="/marketplace">Marketplace</Link>
          <Link to="/models">Models</Link>
          <Link to="/account">Account</Link>
        </div>      
      </div>
      <div className='h-px bg-white/20 w-full'></div>
    </div>
    </nav>
  )
}

export default Navbar