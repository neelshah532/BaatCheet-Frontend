// src/components/error/NotFound.tsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import Lottie from 'react-lottie'
import notFoundAnimation from '../../assets/404-page-not-found.json'
import { IoHomeOutline } from 'react-icons/io5'

export const NotFound: React.FC = () => {
  const navigate = useNavigate()

  const lottieOptions = {
    loop: true,
    autoplay: true,
    animationData: notFoundAnimation,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  }

  return (
    <div className="min-h-screen bg-[#13131A] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <div className="w-96 h-96 mx-auto mb-8">
          <Lottie options={lottieOptions} isClickToPauseDisabled={true} />
        </div>

        <h1 className="text-5xl font-bold text-white mb-4">404 - Page Not Found</h1>

        <p className="text-gray-400 text-lg mb-8">The page you're looking for doesn't exist or has been moved.</p>

        <button
          onClick={() => navigate('/')}
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 
                   text-white rounded-lg flex items-center gap-2 
                   hover:opacity-90 transition-all duration-300 mx-auto"
        >
          <IoHomeOutline size={20} />
          Return Home
        </button>
      </div>
    </div>
  )
}
