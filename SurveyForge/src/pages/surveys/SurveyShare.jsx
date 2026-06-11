import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getSurveyById } from '../../services/api'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'

const BASE_URL = typeof window !== 'undefined' ? window.location.origin : ''

export default function SurveyShare() {
  const { surveyId } = useParams()
  const [survey, setSurvey] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await getSurveyById(surveyId)
        if (!cancelled) setSurvey(res?.data ?? null)
      } catch {
        if (!cancelled) {
          setSurvey(null)
          toast.error('Could not load survey')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [surveyId])

  const shareUrl =
    survey?.share_token ? `${BASE_URL}/survey/${survey.share_token}` : ''
  const qrUrl = shareUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`
    : ''

  const embedSnippet = shareUrl
    ? `<iframe src="${shareUrl}" width="100%" height="560" frameborder="0"></iframe>`
    : ''

  const copy = async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success('Link copied')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Copy failed')
    }
  }

  const copyEmbed = async () => {
    if (!embedSnippet) return
    try {
      await navigator.clipboard.writeText(embedSnippet)
      toast.success('Embed code copied')
    } catch {
      toast.error('Copy failed')
    }
  }

  const whatsappUrl = shareUrl
    ? `https://wa.me/?text=${encodeURIComponent(`Please take my survey: ${shareUrl}`)}`
    : ''
  const twitterUrl = shareUrl
    ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Take my survey: ${shareUrl}`)}`
    : ''
  const linkedInUrl = shareUrl
    ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    : ''
  const emailShareUrl = shareUrl
    ? `mailto:?subject=${encodeURIComponent(`Survey: ${survey.title}`)}&body=${encodeURIComponent(`Hi,\n\nPlease complete this survey:\n${shareUrl}\n\nThank you!`)}`
    : ''

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-gray-400">Loading publish settings…</p>
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="max-w-lg mx-auto card p-8 text-center">
        <p className="text-gray-600 dark:text-gray-300">Survey not found.</p>
        <Link to="/surveys" className="inline-block mt-4 text-primary-600 font-semibold hover:underline">
          Back to surveys
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Share & publish</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{survey.title}</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/surveys/builder/${surveyId}`}>
            <Button variant="secondary" size="sm">Edit survey</Button>
          </Link>
          <Link to={`/distribution?survey=${surveyId}`}>
            <Button size="sm">Distribution Hub</Button>
          </Link>
          <Link to="/surveys">
            <Button variant="secondary" size="sm">All surveys</Button>
          </Link>
        </div>
      </div>

      {!survey.share_token ? (
        <div className="card p-6 border border-amber-200 bg-amber-50/80 dark:bg-amber-900/20 dark:border-amber-800 text-sm text-amber-900 dark:text-amber-100">
          This survey does not have a public link yet. Open the builder and publish to generate a share token.
        </div>
      ) : (
        <>
          <div className="card p-6 space-y-4 border border-gray-100 dark:border-[#2a2a3a] dark:bg-[#16161f]">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Public link</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Anyone with the link can respond without logging in.</p>
            <div className="flex flex-wrap gap-2 items-center">
              <code className="flex-1 min-w-0 text-xs bg-gray-50 dark:bg-[#1e1e2e] px-3 py-2 rounded-xl border border-gray-100 dark:border-[#2a2a3a] truncate">
                {shareUrl}
              </code>
              <Button size="sm" onClick={copy}>
                {copied ? 'Copied' : 'Copy'}
              </Button>
              <a href={qrUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary text-sm py-2 px-3">
                Open QR
              </a>
            </div>
          </div>

          <div className="card p-5 border border-gray-100 dark:border-[#2a2a3a] dark:bg-[#16161f]">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3">Share on social & email</h3>
            <div className="flex flex-wrap gap-2">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary text-sm py-2 px-3">
                WhatsApp
              </a>
              <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary text-sm py-2 px-3">
                X / Twitter
              </a>
              <a href={linkedInUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary text-sm py-2 px-3">
                LinkedIn
              </a>
              <a href={emailShareUrl} className="btn btn-secondary text-sm py-2 px-3">
                Email share
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="card p-5 flex flex-col items-center border border-gray-100 dark:border-[#2a2a3a] dark:bg-[#16161f]">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">QR preview</p>
              {qrUrl && <img src={qrUrl} alt="" className="w-40 h-40 rounded-xl border border-gray-100 dark:border-[#2a2a3a]" />}
            </div>
            <div className="card p-5 border border-gray-100 dark:border-[#2a2a3a] dark:bg-[#16161f] flex flex-col">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Embed</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-3">Paste into your site or LMS.</p>
              <textarea
                readOnly
                rows={5}
                value={embedSnippet}
                className="w-full text-xs font-mono rounded-xl border border-gray-200 dark:border-[#2a2a3a] bg-gray-50 dark:bg-[#1e1e2e] p-3 flex-1"
              />
              <Button size="sm" className="mt-3 self-end" variant="secondary" onClick={copyEmbed}>
                Copy embed
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
