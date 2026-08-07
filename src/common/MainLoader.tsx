import { motion } from 'framer-motion'

const MainLoader = () => {
  return (
    <div className="fixed inset-0 bg-[#08080C] flex flex-col items-center justify-center z-50 overflow-hidden select-none">
      {/* Soft Luxury Radial Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.06) 0%, transparent 65%)',
        }}
      />

      {/* Sleek SVG Minimalist Logo with soft breath pulse */}
      <div className="relative mb-8 flex flex-col items-center justify-center">
        <motion.div
          animate={{
            scale: [0.97, 1.03, 0.97],
            opacity: [0.7, 0.95, 0.7],
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative z-10 w-16 h-16 flex items-center justify-center rounded-2xl bg-white/[0.02] border border-white/10 shadow-[0_0_24px_rgba(99,102,241,0.1)]"
        >
          {/* Minimalist SVG Vector Logo representing BaatCheet */}
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-400">
            <path
              d="M16 26C21.5228 26 26 21.5228 26 16C26 10.4772 21.5228 6 16 6C10.4772 6 6 10.4772 6 16C6 18.3263 6.79328 20.4674 8.12519 22.1704L7 25L9.82958 23.8752C11.5326 25.2071 13.6737 26 16 26Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M12 13H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 17H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </motion.div>

        {/* Soft background aura */}
        <div className="absolute w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full pointer-events-none" />
      </div>

      {/* Tiny Elegant Loader Track */}
      <div className="w-24 h-[1px] bg-white/10 rounded-full overflow-hidden relative mb-6">
        <motion.div
          initial={{ left: '-100%' }}
          animate={{ left: '100%' }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-indigo-400/80 to-transparent"
        />
      </div>

      {/* Luxury Typography */}
      <div className="flex flex-col items-center">
        <h2 className="text-[12px] font-medium tracking-[0.25em] text-white/80 uppercase font-sans">BaatCheet</h2>
        <p className="text-[8px] tracking-[0.2em] text-white/35 uppercase mt-1.5 font-light font-sans">Establishing Secure Connection</p>
      </div>
    </div>
  )
}

export default MainLoader
