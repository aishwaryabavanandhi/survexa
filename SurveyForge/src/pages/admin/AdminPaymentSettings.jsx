import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { getAdminPaymentSettings, saveAdminPaymentSettings } from '../../services/api'
import api from '../../services/api'
import Button from '../../components/ui/Button'

export default function AdminPaymentSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [upiId, setUpiId] = useState('')
  const [upiAccountName, setUpiAccountName] = useState('')
  const [currentQrUrl, setCurrentQrUrl] = useState('')
  const [plans, setPlans] = useState([])
  
  // Selected new QR screenshot to upload
  const [qrBase64, setQrBase64] = useState('')
  const [qrFileName, setQrFileName] = useState('')
  const [qrPreview, setQrPreview] = useState('')

  const backendUrl = api.defaults.baseURL

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const res = await getAdminPaymentSettings()
      if (res.success) {
        setUpiId(res.settings.upi_id || '')
        setUpiAccountName(res.settings.upi_account_name || '')
        setCurrentQrUrl(res.settings.upi_qr_code || '')
        setPlans(res.plans || [])
      } else {
        toast.error(res.error || 'Failed to load settings')
      }
    } catch (err) {
      console.error('[AdminPaymentSettings] Load error:', err)
      toast.error('Could not load payment settings')
    } finally {
      setLoading(true) // wait, loading should be set to false! Yes, typo. We'll fix it below.
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size exceeds 10 MB limit.')
      return
    }

    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      toast.error('Only JPG, JPEG, and PNG images are supported.')
      return
    }

    setQrFileName(file.name)
    const reader = new FileReader()
    reader.onloadend = () => {
      setQrBase64(reader.result)
      setQrPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handlePlanPriceChange = (planId, price) => {
    setPlans(prev =>
      prev.map(p => (p.id === planId ? { ...p, price_inr: Math.max(0, Number(price)) } : p))
    )
  }

  const handlePlanToggleActive = (planId) => {
    setPlans(prev =>
      prev.map(p => (p.id === planId ? { ...p, is_active: !p.is_active } : p))
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!upiId.trim()) {
      toast.error('UPI ID is required')
      return
    }
    if (!upiAccountName.trim()) {
      toast.error('Account Holder Name is required')
      return
    }

    setSaving(true)
    try {
      const payload = {
        upi_id: upiId.trim(),
        upi_account_name: upiAccountName.trim(),
        qr_image_base64: qrBase64 || null,
        plans: plans.map(p => ({
          id: p.id,
          price_inr: p.price_inr,
          is_active: p.is_active
        }))
      }

      const res = await saveAdminPaymentSettings(payload)
      if (res.success) {
        toast.success(res.message || 'Payment settings updated!')
        setQrBase64('')
        setQrFileName('')
        fetchSettings()
      } else {
        toast.error(res.error || 'Failed to save settings')
      }
    } catch (err) {
      toast.error('Could not save settings')
    } finally {
      setSaving(false)
    }
  }

  const getQRImageUrl = () => {
    if (qrPreview) return qrPreview
    if (!currentQrUrl) return ''
    if (currentQrUrl.startsWith('http')) return currentQrUrl
    return `${backendUrl}${currentQrUrl}`
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-violet-500/20">
            ⚙️
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">Admin Payment Settings</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Configure UPI payment details, upload QR codes, customize plan prices, and enable/disable plans.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-6">
        {/* UPI ID and details block */}
        <div className="card p-6 md:col-span-2 space-y-6">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider">UPI Accounts & Info</h3>
          
          <div className="space-y-4">
            {/* UPI ID */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Admin UPI ID</label>
              <input
                type="text"
                required
                placeholder="e.g. name@upi or aishubavan2@okicici"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="input py-2.5 text-sm"
              />
            </div>

            {/* Account holder name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Account Holder Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Aishwarya Bavan"
                value={upiAccountName}
                onChange={(e) => setUpiAccountName(e.target.value)}
                className="input py-2.5 text-sm"
              />
            </div>
          </div>

          {/* Pricing Config Section */}
          <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider">Plan Pricing & Visibilities</h3>
            
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {plans.map((p) => {
                const isFree = p.id === 'free'
                return (
                  <div key={p.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-bold text-gray-800 dark:text-gray-200 capitalize text-sm">{p.name} Plan</p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">
                        Limit: {p.survey_limit || 'Unlimited'} surveys · {p.response_limit || 'Unlimited'} responses
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      {/* Price in INR */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-400 font-bold">₹</span>
                        <input
                          type="number"
                          disabled={isFree}
                          min={0}
                          value={p.price_inr}
                          onChange={(e) => handlePlanPriceChange(p.id, e.target.value)}
                          className="input py-1 px-2.5 w-20 text-center text-xs font-bold shadow-sm"
                        />
                      </div>

                      {/* Active status toggle switch */}
                      <button
                        type="button"
                        disabled={isFree}
                        onClick={() => handlePlanToggleActive(p.id)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shrink-0 ${
                          isFree ? 'opacity-50 cursor-not-allowed bg-emerald-500' : p.is_active ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                      >
                        <motion.div
                          layout
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="bg-white w-4 h-4 rounded-full shadow-md"
                          style={{ marginLeft: isFree || p.is_active ? '20px' : '0px' }}
                        />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* QR Code Upload Block */}
        <div className="card p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider">UPI QR Code</h3>
            
            <div className="flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-white/3 rounded-xl border border-dashed border-[var(--sf-border)]">
              {getQRImageUrl() ? (
                <img
                  src={getQRImageUrl()}
                  alt="UPI QR Preview"
                  className="w-36 h-36 object-contain rounded-lg bg-white p-2.5 border border-gray-150 shadow-sm"
                />
              ) : (
                <div className="w-36 h-36 bg-gray-250 dark:bg-gray-800 rounded-lg flex items-center justify-center text-xs text-gray-400">
                  No QR Code
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="cursor-pointer bg-gray-100 dark:bg-white/5 border border-[var(--sf-border)] rounded-xl py-2 px-4 text-xs font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors shadow-sm block text-center">
                Upload New QR Image
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <p className="text-[10px] text-gray-400 text-center truncate">
                {qrFileName || 'Supports JPG, JPEG, PNG (max 10MB)'}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2">
            <Button
              type="submit"
              fullWidth
              loading={saving}
              disabled={saving}
            >
              Save Configuration
            </Button>
            {qrPreview && (
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => {
                  setQrBase64('')
                  setQrFileName('')
                  setQrPreview('')
                }}
                disabled={saving}
              >
                Reset Image Choice
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
