import React from 'react'
import VectraLogo from '../../../assets/VectraLogo.png'
import Library from '../../../assets/book.png'

const Sidebar = () => {
  return (
    <div className="bg-black w-100 flex flex-col items-start p-3">

      <div className='h-20 flex flex-row justify-center items-center'>
        <img src={VectraLogo} alt="Vectra" className='h-24' />
        <p className='text-4xl'>ectra</p>
      </div>


      <div className='flex flex-col mt-5'>
        <input type="text" placeholder='Search' id="" className='bg-gray-800 outline-none rounded-4xl px-3 h-8 w-80 mb-4' />
        <button className='bg-cyan-400/40 h-8 w-80 rounded-4xl'>New Chat</button>
      </div>

      <div className='flex flex-col gap-3 mt-15 text-2xl font-semibold'>
        <button className=''>Library</button>
        <button>Projects</button>
        <button>Scheduled</button>
        <button>Plugins</button>
        <button>Models</button>
      </div>

      <div className='flex flex-row items-center justify-around mt-15 text-gray-400'>
        <p>Recents</p>
        <p className='ml-60'>...</p>
      </div>

      <div className='flex flex-col gap-3 items-start mt-5 text-xl'>

        <button>Two Pointer Revision</button>
        <button>Vectra UI</button>
        <button>Spring-Boot</button>
      </div>



      <div className='absolute bottom-11 bg-blue-950 h-20 w-80 rounded-4xl' >'
        <div className='flex flex-row gap-10'>
          <img src="yet to be decided" alt="error" />
          <p className='font-semibold text-xm'>Anirudh Pandey</p>
        </div>
        
      </div>

    </div>
  )
}

export default Sidebar