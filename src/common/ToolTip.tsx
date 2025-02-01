import React, { useState, useRef } from 'react'

interface ToolTipProps {
  content: string
  direction?: 'top' | 'right' | 'bottom' | 'left'
  delay?: number
  children: React.ReactNode
}

const ToolTip: React.FC<ToolTipProps> = ({ content, direction = 'top', delay = 400, children }) => {
  const [active, setActive] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  const showTip = () => {
    timeoutRef.current = setTimeout(() => {
      setActive(true)
    }, delay)
  }

  const hideTip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setActive(false)
  }

  return (
    <div className="relative inline-block" onMouseEnter={showTip} onMouseLeave={hideTip}>
      {children}
      {active && (
        <div
          className={`absolute bg-[#1c1b1e] border-none text-white text-sm px-2 py-1 rounded shadow-lg whitespace-nowrap z-50 ${
            direction === 'top' ? 'bottom-full left-1/2 transform -translate-x-1/2 mb-2' : ''
          } ${direction === 'right' ? 'left-full top-1/2 transform -translate-y-1/2 ml-2' : ''} ${
            direction === 'bottom' ? 'top-full left-1/2 transform -translate-x-1/2 mt-2' : ''
          } ${direction === 'left' ? 'right-full top-1/2 transform -translate-y-1/2 mr-2' : ''}`}
        >
          {content}
          <div
            className={`absolute w-0 h-0 border-transparent border-solid ${direction === 'top' ? 'border-t-black border-t-4 left-1/2 transform -translate-x-1/2 top-full' : ''} ${
              direction === 'right' ? 'border-r-black border-r-4 top-1/2 transform -translate-y-1/2 left-0' : ''
            } ${direction === 'bottom' ? 'border-b-black border-b-4 left-1/2 transform -translate-x-1/2 bottom-full' : ''} ${
              direction === 'left' ? 'border-l-black border-l-4 top-1/2 transform -translate-y-1/2 right-0' : ''
            }`}
          ></div>
        </div>
      )}
    </div>
  )
}

export default ToolTip
