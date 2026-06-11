/**
 * pages/surveys/SurveyList.jsx
 * Real API integration with share link, delete, and copy link button.
 */
import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getSurveys, deleteSurvey, duplicateSurvey } from '../../services/api'
import Badge   from '../../components/ui/Badge'
import Button  from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import { useSubscription } from '../../hooks/useSubscription'
import UpgradeModal from '../../components/billing/UpgradeModal'

const TABS = ['All', 'Active', 'Draft']
const BASE_URL = window.location.origin

function statusFromSurvey(s) {
  if (s.status === 'published') return 'Active'
  if (s.status === 'draft') return 'Draft'
  if (!s.question_count || s.question_count === 0) return 'Draft'
  return 'Active'
}

function ShareButton({ survey }) {
  const [copied, setCopied] = useState(false)

  if (!survey.share_token) return null

  const shareUrl = `${BASE_URL}/survey/${survey.share_token}`

  const handleCopy = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const el = document.createElement('textarea')
      el.value = shareUrl
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleCopy}
      title={shareUrl}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl transition-all
        ${copied
          ? 'bg-green-100 text-green-700 border border-green-300'
          : 'bg-primary-50 text-primary-600 hover:bg-primary-100 border border-primary-200'}`}
    >
      {copied ? (
        <><span>✅</span> Copied!</>
      ) : (
        <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg> Copy Link</>
      )}
    </button>
  )
}

function QRButton({ survey }) {
  if (!survey.share_token) return null
  const shareUrl = `${BASE_URL}/survey/${survey.share_token}`
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(shareUrl)}`
  return (
    <a
      href={qrUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl transition-all bg-white text-primary-600 hover:bg-primary-50 border border-primary-200"
      title="Open QR code"
    >
      <span>▦</span> QR
    </a>
  )
}

export default function SurveyList() {
  const [surveys,  setSurveys]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [tab,      setTab]      = useState('All')
  const [search,   setSearch]   = useState('')
  const [view,     setView]     = useState('grid')
  const [deleting, setDeleting] = useState(null)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const { isAtLimit } = useSubscription()
  const surveyLimitReached = isAtLimit('surveys')

  const fetchSurveys = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await getSurveys()
      setSurveys(res.data ?? [])
    } catch {
      setError('Could not load surveys. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchSurveys() }, [fetchSurveys])

  const handleDuplicate = async (id) => {
    try {
      const res = await duplicateSurvey(id)
      const copy = res.data
      if (copy?.id) {
        setSurveys((prev) => [copy, ...prev])
        toast.success('Survey duplicated')
      }
    } catch {
      toast.error('Duplicate failed')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Move this survey to trash? You can restore it within 30 days.')) return
    setDeleting(id)
    try {
      await deleteSurvey(id)
      setSurveys((prev) => prev.filter((s) => s.id !== id))
      toast.success('Moved to trash')
    } catch {
      toast.error('Failed to delete survey')
    } finally {
      setDeleting(null)
    }
  }

  const filtered = surveys.filter((s) => {
    const status = statusFromSurvey(s)
    const matchTab    = tab === 'All' || status === tab
    const matchSearch = (s.title ?? '').toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Spinner size="lg" />
        <p className="text-sm text-gray-400">Loading surveys…</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">My Surveys</h2>
          <p className="text-sm text-gray-500 mt-1">
            {surveys.length} survey{surveys.length !== 1 ? 's' : ''}
            {filtered.length !== surveys.length && ` · ${filtered.length} shown`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={fetchSurveys}>↻ Refresh</Button>
          {surveyLimitReached ? (
            <Button onClick={() => setUpgradeOpen(true)}>＋ New Survey</Button>
          ) : (
            <Link to="/create"><Button>＋ New Survey</Button></Link>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-600 font-medium">
          ⚠️ {error}
        </div>
      )}

      {/* Share info banner */}
      {surveys.some((s) => s.share_token) && (
        <div className="bg-primary-50 border border-primary-200 rounded-xl px-5 py-3 text-sm text-primary-700 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Click <strong>Copy Link</strong> on any survey to get a shareable URL — no login required for respondents.
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all
                ${tab === t ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <input
            placeholder="Search surveys…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-52 px-4 py-2 border border-gray-200 rounded-xl text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
          <div className="flex gap-1 border border-gray-200 rounded-xl p-1">
            {['grid', 'list'].map((v) => (
              <button key={v} onClick={() => setView(v)}
                className={`p-1.5 rounded-lg transition-colors
                  ${view === v ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}>
                {v === 'grid'
                  ? <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><path d="M1 2.5A1.5 1.5 0 012.5 1h3A1.5 1.5 0 017 2.5v3A1.5 1.5 0 015.5 7h-3A1.5 1.5 0 011 5.5v-3zm8 0A1.5 1.5 0 0110.5 1h3A1.5 1.5 0 0115 2.5v3A1.5 1.5 0 0113.5 7h-3A1.5 1.5 0 019 5.5v-3zm-8 8A1.5 1.5 0 012.5 9h3A1.5 1.5 0 017 10.5v3A1.5 1.5 0 015.5 15h-3A1.5 1.5 0 011 13.5v-3zm8 0A1.5 1.5 0 0110.5 9h3A1.5 1.5 0 0115 10.5v3A1.5 1.5 0 0113.5 15h-3A1.5 1.5 0 019 13.5v-3z"/></svg>
                  : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
                }
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          {surveys.length === 0 ? (
            <>
              <p className="text-5xl mb-4">📋</p>
              <p className="font-semibold text-gray-600">No surveys yet</p>
              <p className="text-sm mt-1 mb-5">Create your first survey to get started</p>
              <Link to="/create"><Button>＋ Create Survey</Button></Link>
            </>
          ) : (
            <>
              <p className="text-4xl mb-3">🔍</p>
              <p className="font-medium">No surveys match your filter</p>
            </>
          )}
        </div>
      ) : view === 'grid' ? (
        /* Grid view */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((s) => {
            const status = statusFromSurvey(s)
            return (
              <div key={s.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5
                           hover:shadow-md hover:border-primary-100 transition-all duration-200 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <Badge status={status} />
                  <span className="text-xs text-gray-400">
                    {s.created_at ? new Date(s.created_at).toLocaleDateString() : ''}
                  </span>
                </div>
                <h4 className="font-bold text-gray-800 text-sm leading-snug flex-1">{s.title}</h4>
                {s.description && (
                  <p className="text-xs text-gray-400 mt-1 line-clamp-1">{s.description}</p>
                )}
                <div className="flex gap-3 mt-2 text-xs text-gray-400">
                  <span>📋 {s.question_count ?? 0} questions</span>
                  <span>💬 {s.response_count ?? 0} responses</span>
                </div>

                {/* Share link input */}
                {s.share_token && (
                  <div className="mt-3 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-400 mb-1">Share link</p>
                    <p className="text-xs text-primary-600 font-mono truncate">
                      {BASE_URL}/survey/{s.share_token.slice(0, 12)}…
                    </p>
                  </div>
                )}

                <div className="mt-4 flex gap-2 flex-wrap">
                  <Link to={`/surveys/builder/${s.id}`}><Button size="sm">Edit</Button></Link>
                  <Link to={`/surveys/${s.id}/share`}><Button size="sm" variant="secondary">Share hub</Button></Link>
                  <button type="button" onClick={() => handleDuplicate(s.id)} className="px-3 py-1.5 text-xs font-medium rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50">Duplicate</button>
                  <ShareButton survey={s} />
                  <QRButton survey={s} />
                  <Link to="/responses"><Button size="sm" variant="secondary">Responses</Button></Link>
                  <button
                    onClick={() => handleDelete(s.id)}
                    disabled={deleting === s.id}
                    className="px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-600
                               hover:bg-red-50 rounded-xl transition-all disabled:opacity-50">
                    {deleting === s.id ? '…' : 'Delete'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* List view */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-left text-gray-500">
                <th className="px-6 py-3 font-medium">Survey Name</th>
                <th className="px-6 py-3 font-medium">Questions</th>
                <th className="px-6 py-3 font-medium">Responses</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Created</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((s) => {
                const status = statusFromSurvey(s)
                return (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-800">{s.title}</td>
                    <td className="px-6 py-4 text-gray-600">{s.question_count ?? 0}</td>
                    <td className="px-6 py-4 text-gray-600">{s.response_count ?? 0}</td>
                    <td className="px-6 py-4"><Badge status={status} /></td>
                    <td className="px-6 py-4 text-gray-400">
                      {s.created_at ? new Date(s.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 flex-wrap">
                        <Link to={`/surveys/builder/${s.id}`}><Button size="sm">Edit</Button></Link>
                        <Link to={`/surveys/${s.id}/share`}><Button size="sm" variant="secondary">Share</Button></Link>
                        <button type="button" onClick={() => handleDuplicate(s.id)} className="text-xs text-gray-500 hover:text-primary-600 font-medium px-2">Duplicate</button>
                        <ShareButton survey={s} />
                        <QRButton survey={s} />
                        <button onClick={() => handleDelete(s.id)} disabled={deleting === s.id}
                          className="text-xs text-red-400 hover:text-red-600 font-medium px-2 disabled:opacity-50">
                          {deleting === s.id ? '…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        title="Survey limit reached"
        message="Upgrade your plan to create more surveys."
        code="SURVEY_LIMIT"
      />
    </div>
  )
}
