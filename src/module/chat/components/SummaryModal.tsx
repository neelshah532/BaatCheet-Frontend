import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { IoCloseCircleSharp } from 'react-icons/io5'
import { HiOutlineSparkles } from 'react-icons/hi'
import CustomLoader from '../../../common/CustomLoader'

interface SummaryModalProps {
  isOpen: boolean
  onClose: () => void
  summary: string | null
  isLoading: boolean
}

const SummaryModal = ({ isOpen, onClose, summary, isLoading }: SummaryModalProps) => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[500] bg-black/70 backdrop-blur-xl flex items-start sm:items-center justify-center p-4 overflow-y-auto"
        >
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-purple-500/10 pointer-events-none" />

          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative w-full max-w-lg bg-[#0F1015]/90 border border-white/10 rounded-[28px] shadow-2xl p-6 overflow-hidden max-h-[80vh] flex flex-col my-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <HiOutlineSparkles className="text-xl" />
                </div>
                <div>
                  <h3 className="text-white text-lg font-semibold tracking-wide">AI "Catch Me Up"</h3>
                  <p className="text-xs text-white/50">Smart conversation summary</p>
                </div>
              </div>
              <button onClick={onClose} className="text-white/40 hover:text-white transition-colors" title="Close">
                <IoCloseCircleSharp className="text-2xl" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
              {isLoading ? (
                <div className="py-12 flex items-center justify-center">
                  <CustomLoader type="default" message="Reading conversation & summarizing..." />
                </div>
              ) : summary ? (
                <div className="space-y-4 text-white/95 leading-relaxed text-sm tracking-wide font-light whitespace-pre-wrap font-sans">{summary}</div>
              ) : (
                <div className="text-center py-8 text-white/40 text-sm">No summary available or failed to generate.</div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/[0.08] pt-4 mt-4 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-xs tracking-wider uppercase transition-all shadow-lg shadow-indigo-500/20"
              >
                Got it
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default SummaryModal
