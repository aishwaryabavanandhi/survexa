/**
 * Survey Distribution Hub — multi-channel campaigns, QR, email, analytics
 */
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { getSurveys, createCampaign, getCampaignDashboard, sendCampaignEmails } from '../../services/api'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

const PLATFORMS = [
  { id: 'whatsapp', label: 'WhatsApp', icon: '💬', color: 'from-green-400 to-emerald-600' },
  { id: 'instagram', label: 'Instagram', icon: '📸', color: 'from-pink-400 to-purple-600' },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼', color: 'from-blue-500 to-blue-700' },
  { id: 'facebook', label: 'Facebook', icon: '👥', color: 'from-blue-600 to-indigo-700' },
  { id: 'twitter', label: 'X (Twitter)', icon: '𝕏', color: 'from-gray-700 to-gray-900' },
  { id: 'email', label: 'Email', icon: '✉️', color: 'from-amber-400 to-orange-500' },
  { id: 'qr', label: 'QR Code', icon: '▦', color: 'from-primary-400 to-violet-600' },
]

const PLATFORM_LABELS = Object.fromEntries(PLATFORMS.map((p) => [p.id, p.label]))

export default function DistributionHub() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [surveys, setSurveys] = useState([])
  const [surveyId, setSurveyId] = useState(searchParams.get('survey') || '')
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activePlatform, setActivePlatform] = useState('whatsapp')
  const [sharePack, setSharePack] = useState(null)
  const [loadingShare, setLoadingShare] = useState(false)
  const [customMessage, setCustomMessage] = useState('')
  const [emailList, setEmailList] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [apiMissing, setApiMissing] = useState(false)
  const [needsPublish, setNeedsPublish] = useState(false)

  useEffect(() => {
    let cancelled = false
    getSurveys()
      .then((res) => {
        if (cancelled) return
        const all = res.data ?? []
        const list = all.filter((s) => {
          if (s.status === 'draft') return false
          return Boolean(s.share_token)
        })
        if (!list.length && all.length) {
          setSurveys(all)
          setNeedsPublish(true)
          const fromUrl = searchParams.get('survey')
          if (fromUrl && all.some((s) => String(s.id) === fromUrl)) {
            setSurveyId(fromUrl)
          } else {
            setSurveyId(String(all[0].id))
          }
          return
        }
        setNeedsPublish(false)
        setSurveys(list)
        const fromUrl = searchParams.get('survey')
        if (fromUrl && list.some((s) => String(s.id) === fromUrl)) {
          setSurveyId(fromUrl)
        } else if (list.length) {
          setSurveyId(String(list[0].id))
        }
      })
      .catch(() => {
        if (!cancelled) toast.error('Could not load surveys')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [searchParams])

  const loadDashboard = useCallback(async () => {
    if (!surveyId) return
    try {
      const res = await getCampaignDashboard(surveyId)
      setDashboard(res.data ?? null)
      setApiMissing(false)
    } catch (err) {
      setDashboard(null)
      if (err.response?.status === 404) setApiMissing(true)
    }
  }, [surveyId])

  useEffect(() => {
    if (!surveyId) return
    const current = searchParams.get('survey')
    if (current !== surveyId) {
      setSearchParams({ survey: surveyId }, { replace: true })
    }
    loadDashboard()
  }, [surveyId, loadDashboard, searchParams, setSearchParams])

  const ensureCampaign = async (platform) => {
    if (!surveyId) {
      toast.error('Select a published survey first')
      return null
    }
    setLoadingShare(true)
    try {
      const res = await createCampaign({
        survey_id: Number(surveyId),
        platform,
        share_message: customMessage,
      })
      setSharePack(res.data)
      await loadDashboard()
      return res.data
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not create campaign')
      return null
    } finally {
      setLoadingShare(false)
    }
  }

  const handlePlatformSelect = async (platform) => {
    setActivePlatform(platform)
    const existing = dashboard?.campaigns?.find((c) => c.platform === platform)
    if (existing) {
      setLoadingShare(true)
      try {
        const res = await createCampaign({
          survey_id: Number(surveyId),
          platform,
          share_message: customMessage,
        })
        setSharePack(res.data)
      } finally {
        setLoadingShare(false)
      }
    } else {
      await ensureCampaign(platform)
    }
  }

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard')
    } catch {
      toast.error('Copy failed')
    }
  }

  const openWhatsApp = () => {
    const text = sharePack?.share_content?.whatsapp
    if (!text) return
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  const shareFacebook = () => {
    const url = sharePack?.tracking_url
    if (!url) return
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
  }

  const shareTwitter = () => {
    const text = sharePack?.share_content?.twitter
    if (!text) return
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
  }

  const shareLinkedIn = () => {
    const url = sharePack?.tracking_url
    if (!url) return
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
  }

  const downloadQr = (url, filename) => {
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.target = '_blank'
    a.click()
  }

  const downloadStorySvg = () => {
    const svg = sharePack?.story_svg
    if (!svg) return
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'survexa-instagram-story.svg'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Story image downloaded')
  }

  const sendEmails = async () => {
    const recipients = emailList.split(/[\n,;]+/).map((e) => e.trim()).filter(Boolean)
    if (!recipients.length) {
      toast.error('Add at least one email')
      return
    }
    const pack = sharePack?.campaign?.platform === 'email'
      ? sharePack
      : await ensureCampaign('email')
    if (!pack?.campaign?.id) return
    try {
      const res = await sendCampaignEmails(pack.campaign.id, {
        recipients,
        subject: emailSubject || undefined,
        body: pack.share_content?.email?.body,
      })
      toast.success(`Sent ${res.data?.sent ?? 0} invitation(s)`)
      loadDashboard()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Email send failed')
    }
  }

  const totals = dashboard?.totals
  const best = dashboard?.bestChannel
  const chartLabels = (dashboard?.campaigns ?? []).map((c) => PLATFORM_LABELS[c.platform] || c.platform)
  const completionData = {
    labels: chartLabels.length ? chartLabels : ['No data'],
    datasets: [{
      label: 'Completions',
      data: (dashboard?.campaigns ?? []).map((c) => c.stats?.completions ?? 0),
      backgroundColor: '#B8A4E8',
      borderRadius: 8,
    }],
  }
  const funnelTotal = totals
    ? totals.views + totals.clicks + totals.starts + totals.completions
    : 0
  const funnelData =
    funnelTotal > 0
      ? {
          labels: ['Views', 'Clicks', 'Starts', 'Completions'],
          datasets: [{
            data: [totals.views, totals.clicks, totals.starts, totals.completions],
            backgroundColor: ['#D6C6FF', '#B8F2F5', '#CFF8E3', '#B8A4E8'],
          }],
        }
      : null

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            Survey Distribution Hub
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Launch campaigns across social, email, and QR — track every click and completion.
          </p>
        </div>
        {needsPublish && (
        <div className="rounded-xl border border-primary-200 bg-primary-50 dark:bg-primary-900/20 px-4 py-3 text-sm text-primary-800 dark:text-primary-200">
          This survey needs a public link. Open the{' '}
          <Link to={`/surveys/builder/${surveyId}`} className="font-bold underline">builder</Link>
          {' '}and click <strong>Publish</strong>, then return here.
        </div>
      )}

      {apiMissing && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
          Campaign API is not available — restart the backend (<code className="text-xs">cd SurveyForge/backend → npm run dev</code>) so Distribution Hub can load.
        </div>
      )}

      {surveys.length === 0 ? (
          <Link to="/surveys/builder">
            <Button data-testid="Button-elt-106">Publish a survey first</Button>
          </Link>
        ) : (
          <select
            value={surveyId}
            onChange={(e) => setSurveyId(e.target.value)}
            className="border border-gray-200 dark:border-[#2a2a3a] rounded-xl px-4 py-2.5 text-sm min-w-56 dark:bg-[#16161f]"
          >
            {surveys.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        )}
      </div>

      {/* Campaign analytics dashboard */}
      {dashboard && (
        <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Views', value: totals?.views ?? 0 },
            { label: 'Clicks', value: totals?.clicks ?? 0 },
            { label: 'Starts', value: totals?.starts ?? 0 },
            { label: 'Completions', value: totals?.completions ?? 0 },
            { label: 'Completion rate', value: `${totals?.completionRate ?? 0}%` },
          ].map((kpi) => (
            <div key={kpi.label} className="card p-4 text-center dark:bg-[#16161f]">
              <p className="text-2xl font-extrabold text-primary-600 dark:text-primary-400">{kpi.value}</p>
              <p className="text-xs text-gray-500 mt-1">{kpi.label}</p>
            </div>
          ))}
        </section>
      )}

      {best && (
        <div className="card p-4 flex flex-wrap items-center gap-3 bg-primary-50/50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-800">
          <span className="text-2xl">🏆</span>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">Best-performing channel</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {PLATFORM_LABELS[best.platform] || best.platform} — {best.completions} completions, {best.clicks} clicks
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-4 dark:bg-[#16161f]">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Custom share message</label>
            <textarea
              rows={2}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Optional message prepended to all platform shares…"
              className="mt-2 w-full rounded-xl border border-gray-200 dark:border-[#2a2a3a] px-3 py-2 text-sm dark:bg-[#1e1e2e]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <button data-testid="button-elt-107"
                key={p.id}
                type="button"
                onClick={() => handlePlatformSelect(p.id)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border
                  ${activePlatform === p.id
                    ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30'
                    : 'border-gray-200 dark:border-[#2a2a3a] hover:border-primary-300'}`}
              >
                {p.icon} {p.label}
              </button>
            ))}
          </div>

          {!sharePack && !loadingShare && (
            <div className="card p-8 text-center text-sm text-gray-500 dark:text-gray-400">
              Select a channel above to generate your tracked link and share assets.
            </div>
          )}

          {loadingShare ? (
            <div className="card p-12 flex justify-center"><Spinner /></div>
          ) : sharePack ? (
            <PlatformPanel
              platform={activePlatform}
              pack={sharePack}
              copyText={copyText}
              openWhatsApp={openWhatsApp}
              shareFacebook={shareFacebook}
              shareTwitter={shareTwitter}
              shareLinkedIn={shareLinkedIn}
              downloadQr={downloadQr}
              downloadStorySvg={downloadStorySvg}
              emailList={emailList}
              setEmailList={setEmailList}
              emailSubject={emailSubject}
              setEmailSubject={setEmailSubject}
              sendEmails={sendEmails}
            />
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="card p-5 dark:bg-[#16161f]">
            <h3 className="font-bold text-sm mb-4">Responses by platform</h3>
            {chartLabels.length > 0 ? (
              <Bar data={completionData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
            ) : (
              <p className="text-xs text-gray-400">Share via a channel to see data.</p>
            )}
          </div>
          {funnelData && (
            <div className="card p-5 dark:bg-[#16161f]">
              <h3 className="font-bold text-sm mb-4">Campaign funnel</h3>
              <Doughnut data={funnelData} options={{ responsive: true }} />
            </div>
          )}
          <div className="card p-5 dark:bg-[#16161f]">
            <h3 className="font-bold text-sm mb-3">Per-channel stats</h3>
            <ul className="space-y-2 text-xs">
              {(dashboard?.campaigns ?? []).map((c) => (
                <li key={c.id} className="flex justify-between py-2 border-b border-gray-50 dark:border-[#2a2a3a] last:border-0">
                  <span>{PLATFORM_LABELS[c.platform]}</span>
                  <span className="text-gray-500">
                    {c.stats?.completions ?? 0} done · {c.stats?.clicks ?? 0} clicks
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function PlatformPanel({
  platform,
  pack,
  copyText,
  openWhatsApp,
  shareFacebook,
  shareTwitter,
  shareLinkedIn,
  downloadQr,
  downloadStorySvg,
  emailList,
  setEmailList,
  emailSubject,
  setEmailSubject,
  sendEmails,
}) {
  const sc = pack.share_content || {}
  const tracking = pack.tracking_url || ''

  return (
    <div className="card p-6 space-y-4 dark:bg-[#16161f]">
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase">Tracked link</p>
        <div className="flex gap-2 mt-1">
          <code className="flex-1 text-xs bg-gray-50 dark:bg-[#1e1e2e] p-2 rounded-lg truncate">{tracking}</code>
          <Button data-testid="Button-elt-108" size="sm" variant="secondary" onClick={() => copyText(tracking)}>Copy</Button>
        </div>
      </div>

      {platform === 'whatsapp' && (
        <>
          <pre className="text-xs bg-gray-50 dark:bg-[#1e1e2e] p-3 rounded-xl whitespace-pre-wrap">{sc.whatsapp}</pre>
          <div className="flex gap-2">
            <Button data-testid="Button-elt-109" onClick={openWhatsApp}>Share on WhatsApp</Button>
            <Button data-testid="Button-elt-110" variant="secondary" onClick={() => copyText(sc.whatsapp)}>Copy message</Button>
          </div>
        </>
      )}

      {platform === 'instagram' && (
        <>
          <p className="text-sm text-gray-600 dark:text-gray-400">{sc.instagram?.caption}</p>
          <div className="flex flex-wrap gap-2">
            <Button data-testid="Button-elt-111" variant="secondary" onClick={downloadStorySvg}>Download Story image (SVG)</Button>
            <Button data-testid="Button-elt-112" variant="secondary" onClick={() => copyText(sc.instagram?.caption)}>Copy caption</Button>
          </div>
          {pack.reels && (
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#1e1e2e] text-xs">
              <p className="font-bold mb-1">Reels assets</p>
              <p>{pack.reels.caption}</p>
              <p className="text-primary-600 mt-1">{pack.reels.hashtags?.join(' ')}</p>
            </div>
          )}
          {pack.qr_url && (
            <img src={pack.qr_url} alt="QR" className="w-40 h-40 mx-auto rounded-xl border" />
          )}
        </>
      )}

      {platform === 'linkedin' && (
        <>
          <pre className="text-xs bg-gray-50 dark:bg-[#1e1e2e] p-3 rounded-xl whitespace-pre-wrap">{sc.linkedin}</pre>
          <div className="flex gap-2">
            <Button data-testid="Button-elt-113" onClick={shareLinkedIn}>Share on LinkedIn</Button>
            <Button data-testid="Button-elt-114" variant="secondary" onClick={() => copyText(sc.linkedin)}>Copy post</Button>
          </div>
        </>
      )}

      {platform === 'facebook' && (
        <>
          <pre className="text-xs bg-gray-50 dark:bg-[#1e1e2e] p-3 rounded-xl whitespace-pre-wrap">{sc.facebook}</pre>
          <Button data-testid="Button-elt-115" onClick={shareFacebook}>Share on Facebook</Button>
        </>
      )}

      {platform === 'twitter' && (
        <>
          <pre className="text-xs bg-gray-50 dark:bg-[#1e1e2e] p-3 rounded-xl whitespace-pre-wrap">{sc.twitter}</pre>
          <div className="flex gap-2">
            <Button data-testid="Button-elt-116" onClick={shareTwitter}>Post on X</Button>
            <Button data-testid="Button-elt-117" variant="secondary" onClick={() => copyText(sc.twitter)}>Copy post</Button>
          </div>
        </>
      )}

      {platform === 'email' && (
        <div className="space-y-3">
          <input data-testid="input-elt-118"
            type="text"
            placeholder="Email subject"
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm dark:bg-[#1e1e2e] dark:border-[#2a2a3a]"
          />
          <textarea
            rows={4}
            placeholder="Recipients (one per line or comma-separated)"
            value={emailList}
            onChange={(e) => setEmailList(e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm dark:bg-[#1e1e2e] dark:border-[#2a2a3a]"
          />
          <Button data-testid="Button-elt-119" onClick={sendEmails}>Send invitations</Button>
          <p className="text-xs text-gray-400">Opens and clicks are tracked via campaign link and pixel.</p>
        </div>
      )}

      {(platform === 'qr' || pack.qr_url) && platform === 'qr' && (
        <div className="text-center space-y-4">
          <img src={pack.qr_url} alt="Survey QR" className="w-48 h-48 mx-auto rounded-xl border shadow-sm" />
          <div className="flex flex-wrap justify-center gap-2">
            <Button data-testid="Button-elt-120" variant="secondary" onClick={() => downloadQr(pack.qr_url, 'survexa-qr.png')}>
              Download QR
            </Button>
            <Button data-testid="Button-elt-121" variant="secondary" onClick={() => downloadQr(pack.qr_print_url, 'survexa-qr-print.png')}>
              Print-ready (1000px)
            </Button>
          </div>
        </div>
      )}

      {pack.stats && (
        <p className="text-xs text-gray-400 pt-2 border-t border-gray-100 dark:border-[#2a2a3a]">
          This channel: {pack.stats.views} views · {pack.stats.clicks} clicks · {pack.stats.starts} starts ·{' '}
          {pack.stats.completions} completions ({pack.stats.completionRate}%)
        </p>
      )}
    </div>
  )
}
