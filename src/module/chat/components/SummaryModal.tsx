import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX } from 'react-icons/fi'
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
          className="fixed inset-0 z-[500] bg-black/70 backdrop-blur-sm flex items-start sm:items-center justify-center p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.96, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="relative w-full max-w-lg bg-[#0F1017] border border-white/10 rounded-2xl shadow-2xl p-5 overflow-hidden max-h-[80vh] flex flex-col my-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-slate-300">
                  <HiOutlineSparkles className="text-base" />
                </div>
                <div>
                  <h3 className="text-white text-sm font-semibold tracking-tight">Conversation Summary</h3>
                  <p className="text-[11px] text-slate-400">Key highlights and context</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer" title="Close">
                <FiX className="text-lg" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
              {isLoading ? (
                <div className="py-12 flex items-center justify-center">
                  <CustomLoader type="default" message="Reading conversation & summarizing..." />
                </div>
              ) : summary ? (
                <div className="space-y-3 text-slate-200 leading-relaxed text-xs sm:text-sm font-normal whitespace-pre-wrap">{summary}</div>
              ) : (
                <div className="text-center py-8 text-slate-500 text-xs">No summary available.</div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/[0.08] pt-3 mt-3 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white text-black hover:bg-slate-100 text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default SummaryModal
