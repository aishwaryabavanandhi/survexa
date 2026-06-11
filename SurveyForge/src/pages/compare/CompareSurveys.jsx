import { useState, useEffect } from 'react'
import { getSurveys, getAnalytics } from '../../services/api'
import toast from 'react-hot-toast'
import Spinner from '../../components/ui/Spinner'
import { motion, AnimatePresence } from 'framer-motion'

export default function CompareSurveys() {
  const [surveys, setSurveys] = useState([])
  const [loadingSurveys, setLoadingSurveys] = useState(true)

  const [baselineId, setBaselineId] = useState('')
  const [variantId, setVariantId] = useState('')

  const [baselineData, setBaselineData] = useState(null)
  const [variantData, setVariantData] = useState(null)
  const [loadingData, setLoadingData] = useState(false)

  // Fetch survey list on mount
  useEffect(() => {
    getSurveys()
      .then((res) => {
        if (res.success) {
          // Filter out surveys that have no responses to make comparison meaningful,
          // but let's show all so they can see comparison even if 0.
          setSurveys(res.data || [])
        } else {
          toast.error('Failed to load surveys')
        }
      })
      .catch((err) => toast.error(err.message || 'Error connecting to server'))
      .finally(() => setLoadingSurveys(false))
  }, [])

  // Fetch analytics when both dropdowns are selected
  useEffect(() => {
    if (!baselineId || !variantId) {
      if (!baselineId) setBaselineData(null)
      if (!variantId) setVariantData(null)
      return
    }

    setLoadingData(true)
    Promise.all([
      getAnalytics(baselineId).catch((err) => {
        console.error('Error fetching baseline analytics:', err)
        return { success: false, error: err.message }
      }),
      getAnalytics(variantId).catch((err) => {
        console.error('Error fetching variant analytics:', err)
        return { success: false, error: err.message }
      })
    ])
      .then(([baseRes, varRes]) => {
        if (baseRes.success && varRes.success) {
          setBaselineData(baseRes.data)
          setVariantData(varRes.data)
        } else {
          if (!baseRes.success) toast.error(`Baseline load error: ${baseRes.error}`)
          if (!varRes.success) toast.error(`Variant load error: ${varRes.error}`)
        }
      })
      .catch((err) => toast.error('Failed to load comparison data'))
      .finally(() => setLoadingData(false))
  }, [baselineId, variantId])

  // Helper to calculate delta percentage
  const getDelta = (valA, valB, isPercent = false) => {
    const a = Number(valA || 0)
    const b = Number(valB || 0)
    if (a === 0) return b > 0 ? '+100%' : '0%'
    const diff = b - a
    const pct = ((diff / a) * 100).toFixed(1)
    const sign = diff >= 0 ? '+' : ''
    return `${sign}${isPercent ? diff.toFixed(1) : pct}%`
  }

  // Match questions between baseline and variant
  const getMatchedQuestions = () => {
    if (!baselineData || !variantData) return []

    const baseQuestions = baselineData.analytics || []
    const varQuestions = variantData.analytics || []
    const matched = []

    // Match by exact text (trimmed, lowercase)
    const matchedVarIds = new Set()

    baseQuestions.forEach((baseQ) => {
      const baseText = String(baseQ.question?.text || '').trim().toLowerCase()
      
      // Try to find exact text match
      let match = varQuestions.find(
        (vq) => String(vq.question?.text || '').trim().toLowerCase() === baseText && !matchedVarIds.has(vq.question?.id)
      )

      if (match) {
        matchedVarIds.add(match.question?.id)
        matched.push({
          base: baseQ,
          variant: match,
          matchType: 'text'
        })
      } else {
        // Fallback: match by index/position if variant has a question at this position and not already matched
        const posIndex = baseQuestions.indexOf(baseQ)
        const fallbackMatch = varQuestions[posIndex]
        if (fallbackMatch && !matchedVarIds.has(fallbackMatch.question?.id)) {
          matchedVarIds.add(fallbackMatch.question?.id)
          matched.push({
            base: baseQ,
            variant: fallbackMatch,
            matchType: 'position'
          })
        } else {
          // No match found
          matched.push({
            base: baseQ,
            variant: null,
            matchType: 'none'
          })
        }
      }
    })

    // Add remaining unmatched variant questions
    varQuestions.forEach((varQ) => {
      if (!matchedVarIds.has(varQ.question?.id)) {
        matched.push({
          base: null,
          variant: varQ,
          matchType: 'none'
        })
      }
    })

    return matched
  }

  const matchedQuestions = getMatchedQuestions()

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
          <span>⚖️</span> Survey Comparison (A/B Test)
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Select baseline and variant surveys to compare response distributions, KPIs, and drop-off metrics side-by-side.
        </p>
      </div>

      {/* Selectors card */}
      <div className="card p-5 border border-gray-100 dark:border-[#2a2a3a] dark:bg-[#16161f] space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">Compare Survey Snapshots</h3>
        {loadingSurveys ? (
          <div className="flex justify-center py-4"><Spinner size="sm" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="baseline-select" className="text-xs font-semibold text-gray-500">Baseline (Survey A)</label>
              <select
                id="baseline-select"
                value={baselineId}
                onChange={(e) => setBaselineId(e.target.value)}
                className="input w-full text-sm"
              >
                <option value="">Select Baseline Survey...</option>
                {surveys.map((s) => (
                  <option key={`base-${s.id}`} value={s.id} disabled={s.id === Number(variantId)}>
                    {s.title} ({s.response_count || 0} responses)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="variant-select" className="text-xs font-semibold text-gray-500">Variant (Survey B)</label>
              <select
                id="variant-select"
                value={variantId}
                onChange={(e) => setVariantId(e.target.value)}
                className="input w-full text-sm"
              >
                <option value="">Select Variant Survey...</option>
                {surveys.map((s) => (
                  <option key={`var-${s.id}`} value={s.id} disabled={s.id === Number(baselineId)}>
                    {s.title} ({s.response_count || 0} responses)
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {loadingData ? (
        <div className="flex justify-center py-24"><Spinner size="lg" /></div>
      ) : baselineData && variantData ? (
        <div className="space-y-6">
          {/* KPI Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Total Responses KPI */}
            <div className="card p-5 space-y-3 bg-gradient-to-br from-white to-gray-50/50 dark:from-[#16161f] dark:to-[#12121b] border border-gray-100 dark:border-[#1e1e2e]">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total Responses</span>
                <span className="text-2xl">💬</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{variantData.totalResponses}</span>
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
                  variantData.totalResponses >= baselineData.totalResponses
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                    : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                }`}>
                  {getDelta(baselineData.totalResponses, variantData.totalResponses)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-800">
                <span>Baseline A: <strong className="text-gray-700 dark:text-gray-300">{baselineData.totalResponses}</strong></span>
                <span>Variant B: <strong className="text-gray-700 dark:text-gray-300">{variantData.totalResponses}</strong></span>
              </div>
            </div>

            {/* Completion Rate KPI */}
            <div className="card p-5 space-y-3 bg-gradient-to-br from-white to-gray-50/50 dark:from-[#16161f] dark:to-[#12121b] border border-gray-100 dark:border-[#1e1e2e]">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Completion Rate</span>
                <span className="text-2xl">📈</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  {(variantData.completionRate || 0).toFixed(1)}%
                </span>
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
                  (variantData.completionRate || 0) >= (baselineData.completionRate || 0)
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                    : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                }`}>
                  {getDelta(baselineData.completionRate, variantData.completionRate, true)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-800">
                <span>Baseline A: <strong className="text-gray-700 dark:text-gray-300">{(baselineData.completionRate || 0).toFixed(1)}%</strong></span>
                <span>Variant B: <strong className="text-gray-700 dark:text-gray-300">{(variantData.completionRate || 0).toFixed(1)}%</strong></span>
              </div>
            </div>

            {/* Questions count KPI */}
            <div className="card p-5 space-y-3 bg-gradient-to-br from-white to-gray-50/50 dark:from-[#16161f] dark:to-[#12121b] border border-gray-100 dark:border-[#1e1e2e]">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Question Load</span>
                <span className="text-2xl">❓</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  {variantData.analytics?.length || 0}
                </span>
                <span className="text-xs font-medium text-gray-400">
                  {variantData.analytics?.length - baselineData.analytics?.length > 0
                    ? `+${variantData.analytics?.length - baselineData.analytics?.length} questions`
                    : variantData.analytics?.length - baselineData.analytics?.length < 0
                    ? `${variantData.analytics?.length - baselineData.analytics?.length} questions`
                    : 'Unchanged'}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-800">
                <span>Baseline A: <strong className="text-gray-700 dark:text-gray-300">{baselineData.analytics?.length || 0}</strong></span>
                <span>Variant B: <strong className="text-gray-700 dark:text-gray-300">{variantData.analytics?.length || 0}</strong></span>
              </div>
            </div>
          </div>

          {/* Funnel Overlay Chart */}
          <div className="card p-6 border border-gray-100 dark:border-[#1e1e2e] space-y-4">
            <div>
              <h3 className="font-bold text-sm text-gray-800 dark:text-white">Completion Funnel Drop-off</h3>
              <p className="text-xs text-gray-400 mt-0.5">Overlaid response submission completion rate compared side-by-side.</p>
            </div>
            <div className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-purple-400 inline-block shadow-sm"></span>
                    Baseline (A): {baselineData.survey?.title}
                  </span>
                  <span>{(baselineData.completionRate || 0).toFixed(1)}% ({baselineData.totalResponses} submissions)</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${baselineData.completionRate || 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-cyan-400 inline-block shadow-sm"></span>
                    Variant (B): {variantData.survey?.title}
                  </span>
                  <span>{(variantData.completionRate || 0).toFixed(1)}% ({variantData.totalResponses} submissions)</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${variantData.completionRate || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Question Level Comparison */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>📊</span> Question-by-Question Deltas
            </h3>

            {matchedQuestions.map((pair, index) => {
              const qText = pair.base?.question?.text || pair.variant?.question?.text || `Question ${index + 1}`
              const qType = pair.base?.question?.type || pair.variant?.question?.type || 'unknown'

              return (
                <div
                  key={`pair-${index}`}
                  className="card p-6 border border-gray-100 dark:border-[#2a2a3a] space-y-4 hover:border-gray-200 dark:hover:border-[#38384f] transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">
                        Question {index + 1} • {String(qType).toUpperCase()}
                      </span>
                      <h4 className="font-bold text-base text-gray-800 dark:text-white">{qText}</h4>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {pair.matchType === 'text' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300 border border-green-150">
                          Matched by Text
                        </span>
                      ) : pair.matchType === 'position' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 border border-amber-150">
                          Matched by Position
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300 border border-red-150">
                          Unmatched Question
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Layout side-by-side comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    {/* Baseline A Chart */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                        <span>A: Baseline</span>
                        <span>{pair.base ? `${pair.base.count || 0} responses` : 'Not in baseline'}</span>
                      </div>

                      {pair.base ? (
                        <QuestionSummary data={pair.base} colorClass="bg-purple-500" />
                      ) : (
                        <div className="p-4 border border-dashed border-gray-200 dark:border-gray-800 text-center rounded-xl text-xs text-gray-400">
                          Question not present in Baseline Survey
                        </div>
                      )}
                    </div>

                    {/* Variant B Chart */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wide">
                        <span>B: Variant</span>
                        <span>{pair.variant ? `${pair.variant.count || 0} responses` : 'Not in variant'}</span>
                      </div>

                      {pair.variant ? (
                        <QuestionSummary data={pair.variant} colorClass="bg-cyan-500" />
                      ) : (
                        <div className="p-4 border border-dashed border-gray-200 dark:border-gray-800 text-center rounded-xl text-xs text-gray-400">
                          Question not present in Variant Survey
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="card p-16 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center gap-4">
          <p className="text-6xl">📊</p>
          <div>
            <p className="font-extrabold text-lg text-gray-700 dark:text-gray-200">A/B Testing Comparison Dashboard</p>
            <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
              Select two surveys above. The system will align their metrics, completion rates, and question distributions side-by-side for insights.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// Sub-component to render distributions per question type
function QuestionSummary({ data, colorClass }) {
  const { type, count } = data

  if (count === 0) {
    return <div className="text-xs text-gray-400 py-3 italic">No responses recorded yet</div>
  }

  // Rating / NPS
  if (type === 'rating' || type === 'nps') {
    const avg = data.average || 0
    const score = data.npsScore
    const maxVal = type === 'nps' ? 10 : 5

    return (
      <div className="card p-4 space-y-3 bg-gray-50/50 dark:bg-white/[0.01]">
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-gray-400">Average Rating:</span>
          <span className="text-2xl font-black text-gray-800 dark:text-white">
            {avg} <span className="text-xs text-gray-400 font-normal">/ {maxVal}</span>
          </span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
          <div
            className={`${colorClass} h-full rounded-full`}
            style={{ width: `${(avg / maxVal) * 100}%` }}
          ></div>
        </div>
        {type === 'nps' && score !== undefined && (
          <div className="flex justify-between items-center text-xs pt-1 border-t border-gray-100 dark:border-gray-800">
            <span className="text-gray-400 font-semibold">Net Promoter Score (NPS):</span>
            <span className={`font-bold px-1.5 py-0.5 rounded-md ${
              score >= 30
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                : score >= 0
                ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
            }`}>
              {score > 0 ? `+${score}` : score}
            </span>
          </div>
        )}
      </div>
    )
  }

  // MCQ / Checkbox / Dropdown
  if (type === 'mcq' && data.counts) {
    const total = Object.values(data.counts).reduce((sum, v) => sum + v, 0) || 1

    return (
      <div className="space-y-2">
        {Object.entries(data.counts).map(([option, optCount]) => {
          const percentage = ((optCount / total) * 100).toFixed(1)
          return (
            <div key={option} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-gray-700 dark:text-gray-300 truncate max-w-[200px]">{option}</span>
                <span className="text-gray-400">{optCount} ({percentage}%)</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`${colorClass} h-full rounded-full`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Matrix
  if (type === 'matrix' && data.grid) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-gray-100/50 dark:bg-white/[0.02]">
              <th className="p-2 text-gray-400">Row</th>
              {Object.keys(Object.values(data.grid)[0] || {}).map((col) => (
                <th key={col} className="p-2 text-gray-400 text-center font-mono">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {Object.entries(data.grid).map(([row, cols]) => (
              <tr key={row}>
                <td className="p-2 font-medium text-gray-700 dark:text-gray-300">{row}</td>
                {Object.entries(cols).map(([col, val]) => (
                  <td key={col} className="p-2 text-center font-bold text-gray-800 dark:text-gray-200">{val}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  // Kano Model
  if (type === 'kano' && data.categories) {
    const kanoMap = {
      A: 'Attractive (Attractive features)',
      P: 'Performance (One-dimensional)',
      M: 'Must-be (Basic expectations)',
      I: 'Indifferent (Don\'t care)',
      R: 'Reverse (Disliked)',
      Q: 'Questionable (Conflicting answers)'
    }
    const total = Object.values(data.categories).reduce((sum, v) => sum + v, 0) || 1

    return (
      <div className="space-y-2">
        {Object.entries(data.categories).map(([cat, catCount]) => {
          const pct = ((catCount / total) * 100).toFixed(1)
          return (
            <div key={cat} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-gray-700 dark:text-gray-300">{kanoMap[cat]}</span>
                <span className="text-gray-400">{catCount} ({pct}%)</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`${colorClass} h-full rounded-full`}
                  style={{ width: `${pct}%` }}
                ></div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // MaxDiff Analysis
  if (type === 'maxdiff' && data.utilityScores) {
    return (
      <div className="space-y-2">
        {Object.entries(data.utilityScores).map(([opt, score]) => {
          // utility score is from -1.00 to +1.00. Map to 0% - 100% for progress bar
          const mappedPct = Math.round(((score + 1) / 2) * 100)
          return (
            <div key={opt} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-gray-700 dark:text-gray-300 truncate max-w-[200px]">{opt}</span>
                <span className={`font-mono font-bold ${
                  score > 0 ? 'text-green-500' : score < 0 ? 'text-red-500' : 'text-gray-400'
                }`}>{score > 0 ? `+${score.toFixed(2)}` : score.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`${colorClass} h-full rounded-full`}
                  style={{ width: `${mappedPct}%` }}
                ></div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Text responses / Date / File
  if (data.samples) {
    return (
      <div className="space-y-2">
        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Sample Responses</p>
        <div className="space-y-1.5">
          {data.samples.map((s, idx) => (
            <div key={`sample-${idx}`} className="p-2.5 rounded-lg bg-gray-50/50 dark:bg-white/[0.01] border border-gray-100/50 dark:border-gray-800/50 text-xs text-gray-600 dark:text-gray-400 italic">
              "{s}"
            </div>
          ))}
        </div>
      </div>
    )
  }

  return <div className="text-xs text-gray-400 py-3 italic">Advanced visualization for type: {type}</div>
}
