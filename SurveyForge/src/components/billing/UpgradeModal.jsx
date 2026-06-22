import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../ui/Button'

export default function UpgradeModal({ open, onClose, title, message, code }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card card-gradient-border p-8 max-w-md w-full text-center"
      >
        <div className="text-5xl mb-4">🚀</div>
        <h2 className="text-xl font-bold text-[var(--sf-text)] mb-2">
          {title || 'Upgrade your plan'}
        </h2>
        <p className="text-sm text-[var(--sf-text-muted)] mb-6">
          {message || 'You have reached your current plan limit. Upgrade to continue.'}
        </p>
        {code && (
          <p className="text-xs text-[var(--sf-text-muted)] mb-4 font-mono">{code}</p>
        )}
        <div className="flex flex-col gap-3">
          <Link to="/upgrade" onClick={onClose}>
            <Button data-testid="Button-elt-8" fullWidth size="lg">View plans & upgrade</Button>
          </Link>
          <Link to="/pricing" onClick={onClose} className="text-sm text-[var(--sf-primary)] font-semibold hover:underline">
            Compare all plans
          </Link>
          <button data-testid="button-elt-9" type="button" onClick={onClose} className="text-sm text-[var(--sf-text-muted)] hover:underline mt-2">
            Maybe later
          </button>
        </div>
      </motion.div>
    </div>
  )
}
