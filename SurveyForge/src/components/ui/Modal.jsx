/**
 * components/ui/Modal.jsx — Animated modal with dark mode
 */
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Modal({
  open,
  onClose,
  title,
  children,
  size      = 'md',
  hideClose = false,
}) {
  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={`relative w-full ${widths[size]} card card-gradient-border z-10`}
          >
            {/* Header */}
            {(title || !hideClose) && (
              <div className="flex items-center justify-between mb-5 pb-4
                border-b border-[var(--sf-border)]">
                {title && (
                  <h3 id="modal-title"
                    className="font-bold text-[var(--sf-text)] text-base font-display">
                    {title}
                  </h3>
                )}
                {!hideClose && (
                  <button
                    onClick={onClose}
                    aria-label="Close modal"
                    className="ml-auto p-1.5 rounded-lg text-gray-400 hover:text-gray-600
                      hover:bg-gray-100 dark:hover:bg-white/10 dark:hover:text-white
                      transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )}

            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
