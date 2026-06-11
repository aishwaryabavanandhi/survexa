import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  getBillingPlans,
  getActivePaymentRequest,
  getBillingPaymentDetails,
  submitPaymentRequest
} from '../../services/api'
import api from '../../services/api'
import { useApp } from '../../context/AppContext'
import Button from '../../components/ui/Button'
import { useSubscription } from '../../hooks/useSubscription'
import { motion, AnimatePresence } from 'framer-motion'

export default function Upgrade() {
  const { user } = useApp()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { data: usage, refresh } = useSubscription()
  
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(false)
  const [pendingRequest, setPendingRequest] = useState(null)
  const [paymentDetails, setPaymentDetails] = useState(null)
  
  // Selected plan to upgrade
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [reference, setReference] = useState('')
  const [screenshotBase64, setScreenshotBase64] = useState('')
  const [screenshotName, setScreenshotName] = useState('')
  
  const preselect = params.get('plan') || usage?.plan?.id || 'starter'
  const backendUrl = api.defaults.baseURL

  const loadPageData = async () => {
    setLoading(true)
    try {
      const plansRes = await getBillingPlans()
      setPlans((plansRes.plans ?? []).filter((p) => p.id !== 'free'))
      
      const detailsRes = await getBillingPaymentDetails()
      if (detailsRes.success) {
        setPaymentDetails(detailsRes.data)
      }

      const activeReqRes = await getActivePaymentRequest()
      if (activeReqRes.success && activeReqRes.data) {
        setPendingRequest(activeReqRes.data)
      }
    } catch (err) {
      console.error('[Upgrade] Load error:', err)
      toast.error('Failed to load page content')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPageData()
  }, [])

  const handleCopyUPI = () => {
    if (!paymentDetails?.upi_id) return
    navigator.clipboard.writeText(paymentDetails.upi_id)
    toast.success('UPI ID copied to clipboard!')
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    // Validate size (10 MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Screenshot size exceeds 10 MB limit.')
      return
    }

    // Validate type
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      toast.error('Only JPG, JPEG, and PNG images are supported.')
      return
    }

    setScreenshotName(file.name)
    const reader = new FileReader()
    reader.onloadend = () => {
      setScreenshotBase64(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmitRequest = async (e) => {
    e.preventDefault()
    if (!reference.trim()) {
      toast.error('Please enter payment reference transaction ID')
      return
    }
    if (!screenshotBase64) {
      toast.error('Please upload your payment screenshot proof')
      return
    }

    setLoading(true)
    try {
      const res = await submitPaymentRequest({
        planId: selectedPlan.id,
        amount: selectedPlan.price_inr,
        paymentReference: reference.trim(),
        screenshot: screenshotBase64
      })

      if (res.success) {
        toast.success('Payment request submitted successfully!')
        await refresh()
        navigate('/billing')
      } else {
        toast.error(res.error || 'Failed to submit request')
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Submission failed')
    } finally {
      setLoading(false)
    }
  }

  const getQRImageUrl = () => {
    if (!paymentDetails?.upi_qr_code) return ''
    if (paymentDetails.upi_qr_code.startsWith('http')) {
      return paymentDetails.upi_qr_code
    }
    return `${backendUrl}${paymentDetails.upi_qr_code}`
  }

  if (loading && plans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[var(--sf-text-muted)] font-medium">Loading details...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--sf-text)] font-display">Upgrade subscription plan</h1>
        <p className="text-sm text-[var(--sf-text-muted)] mt-1">
          Pay directly to Admin UPI and upload proof to activate your Starter or Professional limits.
        </p>
        {usage?.plan && (
          <p className="text-sm mt-2 text-[var(--sf-primary)] font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            Current Plan: <span className="capitalize font-bold">{usage.plan.name}</span>
          </p>
        )}
      </div>

      {/* Pending Request Alert banner */}
      {pendingRequest && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-start gap-3.5">
            <div className="text-2xl shrink-0">⏳</div>
            <div>
              <h3 className="font-bold text-amber-800 dark:text-amber-300 text-sm">Payment Verification in Progress</h3>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 max-w-xl">
                Your request to upgrade to the <span className="font-semibold">{pendingRequest.plan_name}</span> plan for ₹{pendingRequest.amount} is currently being verified. The Admin is reviewing your screenshot proof. We will notify you once activated!
              </p>
              <div className="mt-2 text-[10px] font-mono text-amber-600 dark:text-amber-500">
                Ref: {pendingRequest.payment_reference} · Date: {new Date(pendingRequest.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
          <Button variant="secondary" onClick={() => navigate('/billing')} size="sm" className="self-start md:self-center">
            View Billing Status
          </Button>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {!selectedPlan ? (
          /* PLAN SELECT VIEW */
          <motion.div
            key="plan-select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid md:grid-cols-2 gap-6"
          >
            {plans.map((p) => {
              const current = usage?.plan?.id === p.id
              return (
                <div
                  key={p.id}
                  className={`card p-6 flex flex-col justify-between border-2 transition-all relative overflow-hidden ${
                    preselect === p.id ? 'border-[var(--sf-primary)] shadow-md' : 'border-[var(--sf-border)]'
                  }`}
                >
                  {preselect === p.id && (
                    <div className="absolute top-0 right-0 bg-[var(--sf-primary)] text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                      Popular
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold font-display">{p.name}</h2>
                    <p className="text-3xl font-extrabold mt-3 font-display">
                      ₹{p.price_inr}
                      <span className="text-xs font-normal text-[var(--sf-text-muted)] ml-1">/month</span>
                    </p>
                    <ul className="mt-5 space-y-2.5 text-sm text-[var(--sf-text-secondary)]">
                      {(p.features || []).map((f) => (
                        <li key={f} className="flex items-center gap-2">
                          <span className="text-emerald-500 font-bold">✓</span> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    fullWidth
                    className="mt-8 shadow-sm"
                    disabled={!!pendingRequest || current}
                    onClick={() => setSelectedPlan(p)}
                  >
                    {current ? 'Your Current Plan' : pendingRequest ? 'Upgrade Blocked' : `Subscribe to ${p.name}`}
                  </Button>
                </div>
              )
            })}
          </motion.div>
        ) : (
          /* MANUAL UPI FORM VIEW */
          <motion.div
            key="upi-payment"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="card p-6 md:p-8 space-y-6 max-w-2xl mx-auto"
          >
            {/* selected plan header */}
            <div className="flex justify-between items-center pb-4 border-b border-[var(--sf-border)]">
              <div>
                <span className="text-xs uppercase tracking-wider text-[var(--sf-text-muted)] font-bold">Selected Subscription</span>
                <h2 className="text-xl font-bold">{selectedPlan.name} Plan</h2>
              </div>
              <div className="text-right">
                <span className="text-xs text-[var(--sf-text-muted)] block">Total Payable</span>
                <span className="text-2xl font-extrabold text-[var(--sf-primary)] font-display">₹{selectedPlan.price_inr}</span>
              </div>
            </div>

            {/* instructions and payment details */}
            <div className="grid md:grid-cols-2 gap-6 items-center">
              {/* QR display */}
              <div className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-[var(--sf-border)]">
                {paymentDetails?.upi_qr_code ? (
                  <img
                    src={getQRImageUrl()}
                    alt="UPI QR Code"
                    className="w-44 h-44 object-contain rounded-lg bg-white p-2 border border-gray-200"
                  />
                ) : (
                  <div className="w-44 h-44 bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-xs text-gray-500 rounded-lg">
                    Loading QR...
                  </div>
                )}
                <span className="text-[10px] text-[var(--sf-text-muted)] font-medium mt-3">Scan to pay using any UPI app</span>
              </div>

              {/* Text details */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-xs text-[var(--sf-text-muted)] font-bold uppercase tracking-wide">UPI ID</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={paymentDetails?.upi_id || 'aishubavan2@okicici'}
                      className="input py-2 text-sm font-mono text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border-[var(--sf-border)] flex-1"
                    />
                    <Button variant="secondary" onClick={handleCopyUPI} className="px-3 shrink-0 py-2.5">
                      Copy
                    </Button>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-xs text-[var(--sf-text-muted)] font-bold uppercase tracking-wide">Account Holder Name</span>
                  <p className="text-sm font-semibold text-[var(--sf-text)]">{paymentDetails?.upi_account_name || 'Aishwarya Bavan'}</p>
                </div>

                <div className="p-3.5 bg-violet-500/10 rounded-xl border border-violet-500/20 text-xs text-violet-700 dark:text-violet-300">
                  ⚡ <strong>Step 1:</strong> Pay via Google Pay, PhonePe, Paytm, or BHIM. <br />
                  📸 <strong>Step 2:</strong> Take a screenshot of the payment receipt. <br />
                  📝 <strong>Step 3:</strong> Fill transaction reference ID & upload screenshot below.
                </div>
              </div>
            </div>

            {/* Submission Form */}
            <form onSubmit={handleSubmitRequest} className="space-y-5 pt-4 border-t border-[var(--sf-border)]">
              {/* Payment reference */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--sf-text-secondary)] uppercase tracking-wide">
                  UPI Transaction ID / Ref Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 308945621458 or pay_XYZ"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="input text-sm py-2.5 shadow-sm"
                />
              </div>

              {/* Upload screenshot */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--sf-text-secondary)] uppercase tracking-wide">
                  Upload Payment Screenshot proof <span className="text-red-500">*</span>
                </label>
                
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer bg-gray-100 dark:bg-white/5 border border-dashed border-[var(--sf-border)] rounded-xl py-3 px-5 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors shadow-sm shrink-0">
                    Choose Receipt Image
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-[var(--sf-text-muted)] truncate max-w-sm">
                    {screenshotName || 'No file selected (JPG, JPEG, PNG, max 10MB)'}
                  </span>
                </div>

                {screenshotBase64 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-3 relative w-36 h-36 border border-[var(--sf-border)] rounded-xl overflow-hidden group shadow-sm bg-black"
                  >
                    <img src={screenshotBase64} alt="Receipt preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setScreenshotBase64('')
                        setScreenshotName('')
                      }}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold font-sans"
                    >
                      Remove
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setSelectedPlan(null)
                    setScreenshotBase64('')
                    setScreenshotName('')
                    setReference('')
                  }}
                  disabled={loading}
                >
                  Back to plans
                </Button>
                <Button type="submit" loading={loading} disabled={loading}>
                  Submit Payment Request
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
