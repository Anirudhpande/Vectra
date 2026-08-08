import React from 'react'
import Hero from './Components/Hero'

const Home = () => {
  return (
    <div className='min-h-screen bg-cover bg-center' style={{backgroundImage:  "url('https://flare.io/wp-content/uploads/149-1030x579.png')"}}>
        <Hero />
    </div>
  )
}

export default Home