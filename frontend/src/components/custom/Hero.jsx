import React from 'react'
import { Button } from '../ui/button'
import { Link } from 'react-router-dom'
function Hero() {
  return (
    <div className='flex flex-col items-center mx-56 gap-12'>

        <h1 className="font-extrabold text-[60px] text-center mt-16">Have your <span className="text-red-400">AI Personalized</span> itineraries at your fingertips</h1>
        <Link to={'/calculate'}>
        <Button>Get Started,Its free</Button>
        </Link>
    </div>
  )
}

export default Hero