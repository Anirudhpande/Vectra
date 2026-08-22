import React from 'react'
import Hero from './Components/Hero'
import AboutUs from './Components/AboutUs'

const Home = () => {
  return (
    <div className='h-screen bg-cover bg-center' style={{backgroundImage:" linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,1)), url('https://flare.io/wp-content/uploads/149-1030x579.png')"}}>
        <Hero />
        <AboutUs />
    </div>
  )
}

export default Home