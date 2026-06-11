/**
 * pages/reports/Reports.jsx — Dark mode, toast, skeleton loading, animated cards
 */
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { getSurveys, downloadReport, sendReport } from '../../services/api'
import Badge  from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal  from '../../components/ui/Modal'
import { Skeleton } from '../../components/ui/Skeleton'
import { Capacitor } from '@capacitor/core'
import { Filesystem, Directory } from '@capacitor/filesystem'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const item      = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } }

/** Backend returns JSON errors as application/json blobs when PDF generation fails */
async function ensurePdfBlob(blob) {
  if (!(blob instanceof Blob)) return blob
  if (blob.type && blob.type.includes('application/json')) {
    const text = await blob.text()
    try {
      const j = JSON.parse(text)
      throw new Error(j.error || 'PDF generation failed')
    } catch (e) {
      if (e instanceof SyntaxError) throw new Error(text.slice(0, 280))
      throw e
    }
  }
  return blob
}

const convertBlobToBase64 = (blob) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onerror = reject
  reader.onload = () => {
    resolve(reader.result)
  }
  reader.readAsDataURL(blob)
})

export default function Reports() {
  const [surveys,     setSurveys]  = useState([])
  const [loading,     setLoading]  = useState(true)
  const [sending,     setSending]  = useState(false)
  const [downloading, setDL]       = useState(null)
  const [modalOpen,   setModal]    = useState(false)
  const [selected,    setSelected] = useState(null)
  const [email,       setEmail]    = useState('')
  const [result,      setResult]   = useState(null)

  useEffect(() => {
    getSurveys()
      .then((res) => setSurveys(res.data ?? []))
      .catch(() => { setSurveys([]); toast.error('Could not load surveys') })
      .finally(() => setLoading(false))
  }, [])

  const handleDownload = async (survey) => {
    setDL(survey.id)
    const id = toast.loading('Generating PDF…')
    try {
      const blob = await ensurePdfBlob(await downloadReport(survey.id))
      const fileName = `Survexa-${survey.title.replace(/[^a-z0-9]/gi, '_')}.pdf`

      if (Capacitor.isNativePlatform()) {
        const base64Data = await convertBlobToBase64(blob)
        const base64String = base64Data.split(',')[1]
        
        await Filesystem.writeFile({
          path: fileName,
          data: base64String,
          directory: Directory.Documents,
        })
        toast.success(`PDF saved to Documents: ${fileName}`, { id })
      } else {
        const url  = URL.createObjectURL(blob)
        const a    = Object.assign(document.createElement('a'), { href: url, download: fileName })
        a.click()
        URL.revokeObjectURL(url)
        toast.success('PDF downloaded!', { id })
      }
    } catch (err) {
      const msg = err.response?.data?.error ?? err.message ?? 'Unknown error'
      toast.error('PDF failed: ' + msg, { id })
    } finally {
      setDL(null)
    }
  }

  const openEmailModal = (survey) => {
    setSelected(survey); setEmail(''); setResult(null); setModal(true)
  }

  const handleSend = async () => {
    if (!email.trim()) return
    setSending(true)
    const id = toast.loading(`Sending report to ${email}…`)
    try {
      const res = await sendReport({ email: email.trim(), survey_id: selected.id })
      setResult({ success: true, message: res.message })
      toast.success('Report sent!', { id })
    } catch (err) {
      const msg = err.response?.data?.error ?? err.message
      setResult({ success: false, message: msg })
      toast.error(msg, { id })
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="card p-5 space-y-3">
              <div className="flex gap-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-28 rounded-xl" />
                <Skeleton className="h-8 w-28 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="page-title">Reports</h2>
        <p className="page-subtitle">Generate and email branded PDF reports for any survey</p>
      </div>

      {/* Info banner */}
      <div className="card px-5 py-4 bg-gradient-to-r from-primary-50 to-primary-100
        dark:from-primary-500/10 dark:to-primary-600/10 border-primary-200 dark:border-primary-800
        flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center text-lg shrink-0">📊</div>
        <div>
          <p className="text-sm font-bold text-primary-700 dark:text-primary-300">
            PDF reports include charts, insights, and response analytics
          </p>
          <p className="text-xs text-primary-600 dark:text-primary-400 mt-0.5">
            Reports are auto-emailed to you when someone submits a response. Configure EMAIL_USER in .env to enable.
          </p>
        </div>
      </div>

      {surveys.length === 0 ? (
        <div className="text-center py-24 text-gray-400 dark:text-gray-600">
          <div className="w-20 h-20 bg-gray-50 dark:bg-[#1e1e2e] rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4">📑</div>
          <p className="font-bold text-gray-600 dark:text-gray-400">No surveys yet</p>
          <p className="text-sm mt-1">Create a survey first to generate reports</p>
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {surveys.map((s) => (
            <motion.div key={s.id} variants={item}
              className="card card-hover p-5">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600
                  flex items-center justify-center text-xl shrink-0 shadow-md shadow-primary-500/30">
                  📊
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-800 dark:text-gray-100 truncate">{s.title}</h4>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {s.response_count ?? 0} responses · {s.question_count ?? 0} questions
                  </p>
                </div>
                <Badge status={(s.question_count ?? 0) > 0 ? 'Active' : 'Draft'} />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: 'Responses', value: s.response_count ?? 0 },
                  { label: 'Questions', value: s.question_count  ?? 0 },
                  { label: 'Completion', value: '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 dark:bg-[#1e1e2e] rounded-xl p-2.5 text-center">
                    <p className="text-lg font-extrabold text-gray-900 dark:text-white">{value}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-600">{label}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm" variant="secondary"
                  loading={downloading === s.id}
                  onClick={() => handleDownload(s)}
                  icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>}
                >
                  Download PDF
                </Button>
                <Button
                  size="sm"
                  onClick={() => openEmailModal(s)}
                  icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>}
                >
                  Email Report
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Email modal */}
      <Modal open={modalOpen} onClose={() => setModal(false)}
        title={`Email Report — ${selected?.title}`}>
        <div className="space-y-4">
          {!result ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Recipient email
                </label>
                <input
                  type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="recipient@company.com"
                  className="input"
                />
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-600">
                The full PDF report (with charts and insights) will be attached.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
                <Button onClick={handleSend} loading={sending} disabled={!email.trim()}>
                  Send Report
                </Button>
              </div>
            </>
          ) : (
            <div className={`rounded-xl p-4 text-sm font-medium
              ${result.success
                ? 'bg-green-50 dark:bg-green-500/10 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
              {result.success ? '✅ ' : '❌ '}{result.message}
              <div className="mt-3">
                <Button variant="secondary" size="sm" onClick={() => setModal(false)}>Close</Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
