import React from 'react'

const ShopCard = () => {
  return (
    <div className='px-10 py-5'>
        <div className='flex flex-row justify-between items-center mb-5'>

            <div>
                <p className='text-white text-2xl font-bold'>
                    Popular APIs
                </p>
                <p className='text-slate-500 text-sm'>
                    Most popular APIs used by developers
                </p>
            </div>

            <button className='text-indigo-400 font-semibold'>
                view all
            </button>
        </div>

    </div>
  )
}

export default ShopCard