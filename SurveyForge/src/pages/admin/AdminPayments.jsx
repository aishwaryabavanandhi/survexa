import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  getAdminPaymentRequests,
  approvePaymentRequest,
  rejectPaymentRequest
} from '../../services/api'
import api from '../../services/api'
import Button from '../../components/ui/Button'

export default function AdminPayments() {
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState([])
  const [activeTab, setActiveTab] = useState('pending') // 'pending', 'approved', 'rejected'
  
  // Modal for screenshot zoom
  const [zoomImage, setZoomImage] = useState(null)
  
  // State for rejection dialog
  const [rejectId, setRejectId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [submittingReject, setSubmittingReject] = useState(false)
  const [submittingApprove, setSubmittingApprove] = useState(null)

  const backendUrl = api.defaults.baseURL

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const res = await getAdminPaymentRequests(activeTab)
      if (res.success) {
        setRequests(res.data || [])
      } else {
        toast.error(res.error || 'Failed to load requests')
      }
    } catch (err) {
      console.error('[AdminPayments] Fetch error:', err)
      toast.error('Could not connect to backend payments service')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [activeTab])

  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to APPROVE this payment request and ACTIVATE their subscription?')) {
      return
    }

    setSubmittingApprove(id)
    try {
      const res = await approvePaymentRequest(id)
      if (res.success) {
        toast.success(res.message || 'Payment request approved successfully!')
        setRequests(prev => prev.filter(r => r.id !== id))
      } else {
        toast.error(res.error || 'Approval failed')
      }
    } catch (err) {
      toast.error('An error occurred during approval')
    } finally {
      setSubmittingApprove(null)
    }
  }

  const handleRejectSubmit = async (e) => {
    e.preventDefault()
    if (!rejectReason.trim()) {
      toast.error('Please specify a reason for rejection')
      return
    }

    setSubmittingReject(true)
    try {
      const res = await rejectPaymentRequest(rejectId, rejectReason.trim())
      if (res.success) {
        toast.success(res.message || 'Payment request rejected.')
        setRequests(prev => prev.filter(r => r.id !== rejectId))
        setRejectId(null)
        setRejectReason('')
      } else {
        toast.error(res.error || 'Rejection failed')
      }
    } catch (err) {
      toast.error('An error occurred during rejection')
    } finally {
      setSubmittingReject(false)
    }
  }

  const getFullImageUrl = (relativeUrl) => {
    if (!relativeUrl) return ''
    if (relativeUrl.startsWith('http')) return relativeUrl
    return `${backendUrl}${relativeUrl}`
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-violet-500/20">
            💳
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">UPI Payment Verification</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Review screenshot proofs, verify transaction IDs, and activate user subscription plans.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-white/2 p-1 rounded-2xl max-w-md">
        {['pending', 'approved', 'rejected'].map((tab) => (
          <button data-testid="button-elt-31"
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-xs font-bold capitalize rounded-xl transition-all ${
              activeTab === tab
                ? 'bg-white dark:bg-gray-800 text-violet-600 dark:text-violet-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab} Requests
          </button>
        ))}
      </div>

      {/* Content List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
          <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading {activeTab} payment requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="card p-12 text-center text-gray-400 dark:text-gray-500 text-sm font-medium">
          🎉 No {activeTab} payment requests found.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((r) => (
            <motion.div
              layout
              key={r.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-5 flex flex-col justify-between space-y-5 relative overflow-hidden"
            >
              <div className="space-y-4">
                {/* User info */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-indigo-600 flex items-center justify-center text-white font-bold text-sm select-none">
                    {r.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800 dark:text-gray-200 truncate text-sm">{r.name || 'Anonymous'}</p>
                    <p className="text-xs text-gray-400 truncate">{r.email || 'N/A'}</p>
                  </div>
                </div>

                {/* Plan details */}
                <div className="grid grid-cols-2 gap-4 py-2 px-3.5 bg-gray-50 dark:bg-white/3 rounded-xl text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase font-bold">Plan Details</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200 capitalize">{r.plan_name || r.plan_id}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block uppercase font-bold">Amount Paid</span>
                    <span className="font-extrabold text-violet-600 dark:text-violet-400">₹{r.amount}</span>
                  </div>
                </div>

                {/* Transaction Reference & Date */}
                <div className="space-y-1 text-xs">
                  <div>
                    <span className="text-gray-400 font-semibold mr-1.5">UPI Ref:</span>
                    <span className="font-mono text-gray-800 dark:text-gray-200 font-semibold select-all bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded text-[11px]">{r.payment_reference}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold mr-1.5">Submitted:</span>
                    <span className="text-gray-600 dark:text-gray-400">{new Date(r.created_at).toLocaleDateString()} {new Date(r.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  {activeTab === 'rejected' && r.rejection_reason && (
                    <div className="mt-2.5 p-2.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-red-700 dark:text-red-400 text-xs">
                      <strong>Rejection Reason:</strong> {r.rejection_reason}
                    </div>
                  )}
                </div>

                {/* Proof screenshot thumbnail */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Payment Proof Receipt</span>
                  <div
                    onClick={() => setZoomImage(getFullImageUrl(r.screenshot_url))}
                    className="relative h-44 rounded-xl overflow-hidden cursor-zoom-in border border-gray-150 dark:border-gray-800 group bg-black shadow-sm"
                  >
                    <img
                      src={getFullImageUrl(r.screenshot_url)}
                      alt="Payment proof screenshot"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                      🔎 Click to Zoom
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions for Pending */}
              {activeTab === 'pending' && (
                <div className="flex gap-2.5 pt-2 border-t border-gray-100 dark:border-gray-800/80">
                  <Button data-testid="Button-elt-32"
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 font-bold border border-red-200/50 dark:border-red-900/30"
                    onClick={() => setRejectId(r.id)}
                    disabled={submittingApprove !== null}
                  >
                    Reject
                  </Button>
                  <Button data-testid="Button-elt-33"
                    size="sm"
                    className="flex-1 font-bold"
                    onClick={() => handleApprove(r.id)}
                    loading={submittingApprove === r.id}
                    disabled={submittingApprove !== null}
                  >
                    Approve
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Lightbox Screenshot zoom modal */}
      <AnimatePresence>
        {zoomImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomImage(null)}
            className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 p-2 rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={zoomImage}
                alt="Receipt proof zoom"
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
              />
              <button data-testid="button-elt-34"
                onClick={() => setZoomImage(null)}
                className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white w-9 h-9 rounded-full flex items-center justify-center font-bold font-sans text-sm shadow transition-colors"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rejection input dialog modal */}
      <AnimatePresence>
        {rejectId !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.96, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 10 }}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <h3 className="text-base font-bold text-gray-900 dark:text-white font-display">Reject Payment Verification</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Provide a clear reason for rejecting this payment request. The reason will be stored in history and sent to the customer.
              </p>
              <form data-testid="form-elt-35" onSubmit={handleRejectSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Reason for Rejection</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="e.g. Screenshot blurry, Transaction reference ID mismatch, or Payment amount not received in account..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="input text-xs py-2.5 mt-1 border-[var(--sf-border)] resize-none"
                  />
                </div>
                <div className="flex gap-2.5 justify-end">
                  <Button data-testid="Button-elt-36"
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setRejectId(null)
                      setRejectReason('')
                    }}
                    disabled={submittingReject}
                  >
                    Cancel
                  </Button>
                  <Button data-testid="Button-elt-37"
                    type="submit"
                    className="bg-red-600 hover:bg-red-700 text-white font-bold"
                    loading={submittingReject}
                    disabled={submittingReject}
                  >
                    Confirm Rejection
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
