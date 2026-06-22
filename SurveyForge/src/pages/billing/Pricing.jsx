import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getBillingPlans } from '../../services/api'
import Button from '../../components/ui/Button'
import survexaLogo from '../../assets/survexa_logo.png'

export default function Pricing() {
  const [plans, setPlans] = useState([])

  useEffect(() => {
    getBillingPlans()
      .then((res) => setPlans(res.plans ?? []))
      .catch(() => setPlans([]))
  }, [])

  return (
    <div className="min-h-screen bg-[var(--sf-bg-subtle)] py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-10">
          <img src={survexaLogo} alt="Survexa" className="w-10 h-10 object-contain" />
          <span className="font-bold text-2xl font-display text-[var(--sf-text)]">Survexa</span>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--sf-text)] font-display mb-3">
            Simple, transparent pricing
          </h1>
          <p className="text-[var(--sf-text-muted)] max-w-xl mx-auto">
            UPI, cards, and net banking via Razorpay. Upgrade anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`card p-8 flex flex-col ${
                p.id === 'starter' ? 'ring-2 ring-[var(--sf-primary)] shadow-lg' : ''
              }`}
            >
              {p.id === 'starter' && (
                <span className="text-xs font-bold text-[var(--sf-primary)] uppercase tracking-wider mb-2">
                  Popular
                </span>
              )}
              <h2 className="text-xl font-bold text-[var(--sf-text)]">{p.name}</h2>
              <p className="text-3xl font-extrabold mt-3 text-[var(--sf-text)]">
                {p.price_inr === 0 ? 'Free' : `₹${p.price_inr}`}
                {p.price_inr > 0 && <span className="text-sm font-medium text-[var(--sf-text-muted)]">/mo</span>}
              </p>
              <ul className="mt-6 space-y-2 flex-1">
                {(p.features || []).map((f) => (
                  <li key={f} className="text-sm text-[var(--sf-text-secondary)] flex gap-2">
                    <span className="text-emerald-500">✓</span> {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                {p.id === 'free' ? (
                  <Link to="/signup">
                    <Button data-testid="Button-elt-92" fullWidth variant="secondary">Get started</Button>
                  </Link>
                ) : (
                  <Link to="/upgrade">
                    <Button data-testid="Button-elt-93" fullWidth>{p.id === 'professional' ? 'Go Professional' : 'Choose Starter'}</Button>
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <p className="text-center mt-10 text-sm text-[var(--sf-text-muted)]">
          <Link to="/login" className="text-[var(--sf-primary)] font-semibold hover:underline">Sign in</Link>
          {' · '}
          <Link to="/dashboard" className="hover:underline">Dashboard</Link>
        </p>
      </div>
    </div>
  )
}
