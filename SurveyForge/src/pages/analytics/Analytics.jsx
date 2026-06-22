/**
 * pages/analytics/Analytics.jsx
 * Real data — fetches surveys, lets user pick one, then loads
 * per-survey analytics from GET /responses/analytics/:id.
 * Falls back to an overview with aggregate stats when no survey selected.
 */
import { useState, useEffect, useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import toast from 'react-hot-toast'
import { getSurveys, getAnalytics, exportAnalyticsCsv, getAnalyticsSegments } from '../../services/api'
import Spinner from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, ArcElement, Title, Tooltip, Legend, Filler
)

/* Pastel chart palette — brand system */
const LAVENDER = '#D6C6FF'
const CYAN     = '#B8F2F5'
const MINT     = '#CFF8E3'
const PEACH    = '#FFD7B8'
const PINK     = '#F5C3E8'
const LEMON    = '#FFF6B3'
const COLORS   = [LAVENDER, CYAN, MINT, PEACH, PINK, LEMON, LAVENDER, CYAN]
const PURPLE   = LAVENDER
const GREEN    = MINT
const AMBER    = PEACH
const BLUE     = CYAN

/** Chart.js captures wheel by default — exclude it so the page scrolls smoothly */
const CHART_EVENTS = ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove']

const chartOpts = {
  responsive: true,
  maintainAspectRatio: true,
  events: CHART_EVENTS,
  plugins: {
    legend:  { display: false },
    tooltip: { backgroundColor: '#1f2937', padding: 12, cornerRadius: 8 },
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 12, weight: '500' } } },
    y: { grid: { color: 'rgba(15,23,42,0.06)' }, ticks: { color: '#64748b', font: { size: 12, weight: '500' } } },
  },
}

const doughnutOpts = {
  responsive: true,
  maintainAspectRatio: true,
  events: CHART_EVENTS,
  plugins: {
    legend: {
      position: typeof window !== 'undefined' && window.innerWidth < 768 ? 'bottom' : 'right',
      labels: { usePointStyle: true, padding: 16, font: { size: 12 } },
    },
    tooltip: { backgroundColor: '#1f2937', padding: 12, cornerRadius: 8 },
  },
  cutout: '65%',
}

export default function Analytics() {
  const [surveys,    setSurveys]    = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [analytics,  setAnalytics]  = useState(null)   // full analytics object from API
  const [loadingSurveys, setLoadingSurveys] = useState(true)
  const [loadingData,    setLoadingData]    = useState(false)
  const [error,      setError]      = useState(null)
  const [segments,   setSegments]   = useState(null)
  const [exporting,  setExporting]  = useState(false)

  // Load surveys
  useEffect(() => {
    getSurveys()
      .then((res) => {
        const list = res.data ?? []
        setSurveys(list)
        if (list.length > 0) setSelectedId(String(list[0].id))
      })
      .catch(() => setError('Could not connect to backend'))
      .finally(() => setLoadingSurveys(false))
  }, [])

  // Load analytics for selected survey
  useEffect(() => {
    if (!selectedId) return
    setLoadingData(true); setError(null); setAnalytics(null)
    getAnalytics(selectedId)
      .then((res) => setAnalytics(res.data ?? null))
      .catch(() => setError('Could not load analytics for this survey'))
      .finally(() => setLoadingData(false))
    getAnalyticsSegments(selectedId)
      .then((res) => setSegments(res.data?.segments ?? null))
      .catch(() => setSegments(null))
  }, [selectedId])

  const handleExportCsv = async () => {
    if (!selectedId) return
    setExporting(true)
    try {
      const blob = await exportAnalyticsCsv(selectedId)
      const url = URL.createObjectURL(new Blob([blob], { type: 'text/csv' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `survexa-survey-${selectedId}-analytics.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Analytics exported')
    } catch {
      toast.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  // Build chart data from real analytics
  const { mcqCharts, ratingItems, textItems, maxdiffItems, conjointItems, kanoItems, psmItems, kpis } = useMemo(() => {
    if (!analytics) return { mcqCharts: [], ratingItems: [], textItems: [], maxdiffItems: [], conjointItems: [], kanoItems: [], psmItems: [], kpis: [] }

    const { survey, totalResponses, analytics: items } = analytics

    const mcqCharts   = []
    const ratingItems = []
    const textItems   = []
    const maxdiffItems = []
    const conjointItems = []
    const kanoItems = []
    const psmItems = []

    ;(items ?? []).forEach((item, i) => {
      if (item.type === 'mcq') {
        const labels = Object.keys(item.counts ?? {})
        const data   = Object.values(item.counts ?? {})
        mcqCharts.push({
          question: item.question.text,
          chartData: {
            labels,
            datasets: [{
              label: 'Count',
              data,
              backgroundColor: labels.map((_, li) => COLORS[li % COLORS.length]),
              borderRadius: 6,
              borderSkipped: false,
            }],
          },
          top: item.topOption,
          count: item.count,
        })
      } else if (item.type === 'rating') {
        ratingItems.push({
          question: item.question.text,
          average:  item.average,
          count:    item.count,
          dist:     item.distribution ?? {},
        })
      } else if (item.type === 'text') {
        textItems.push({
          question: item.question.text,
          samples:  item.samples ?? [],
          count:    item.count,
        })
      } else if (item.type === 'maxdiff') {
        const labels = Object.keys(item.utilityScores ?? {})
        const data   = Object.values(item.utilityScores ?? {})
        maxdiffItems.push({
          question: item.question.text,
          chartData: {
            labels,
            datasets: [{
              label: 'Net Utility Score',
              data,
              backgroundColor: data.map((v) => v >= 0 ? '#10b981' : '#f43f5e'),
              borderRadius: 6,
            }]
          },
          count: item.count
        })
      } else if (item.type === 'conjoint') {
        const labels = Object.keys(item.counts ?? {})
        const data   = Object.values(item.counts ?? {})
        conjointItems.push({
          question: item.question.text,
          chartData: {
            labels,
            datasets: [{
              label: 'Preferences',
              data,
              backgroundColor: [PURPLE, GREEN, AMBER],
              borderRadius: 6,
            }]
          },
          count: item.count
        })
      } else if (item.type === 'kano') {
        kanoItems.push({
          question: item.question.text,
          categories: item.categories ?? {},
          count: item.count
        })
      } else if (item.type === 'psm') {
        const raw = item.rawPrices ?? {}
        const tooCheap = raw.tooCheap ?? []
        const cheap = raw.cheap ?? []
        const expensive = raw.expensive ?? []
        const tooExpensive = raw.tooExpensive ?? []
        
        const allPrices = [...new Set([...tooCheap, ...cheap, ...expensive, ...tooExpensive])].sort((a,b)=>a-b)
        const total = item.count || 1
        const curves = { tooCheap: [], cheap: [], expensive: [], tooExpensive: [] }
        
        allPrices.forEach((p) => {
          const tcPct = (tooCheap.filter(x => x >= p).length / total) * 100
          const cPct = (cheap.filter(x => x >= p).length / total) * 100
          const ePct = (expensive.filter(x => x <= p).length / total) * 100
          const tePct = (tooExpensive.filter(x => x <= p).length / total) * 100
          
          curves.tooCheap.push(parseFloat(tcPct.toFixed(1)))
          curves.cheap.push(parseFloat(cPct.toFixed(1)))
          curves.expensive.push(parseFloat(ePct.toFixed(1)))
          curves.tooExpensive.push(parseFloat(tePct.toFixed(1)))
        })
        
        let oppPrice = '—'
        let ippPrice = '—'
        let minOppDiff = Infinity
        let minIppDiff = Infinity
        allPrices.forEach((p, idx) => {
          const tc = curves.tooCheap[idx]
          const te = curves.tooExpensive[idx]
          const c = curves.cheap[idx]
          const e = curves.expensive[idx]
          
          const oppDiff = Math.abs(tc - te)
          const ippDiff = Math.abs(c - e)
          
          if (oppDiff < minOppDiff) {
            minOppDiff = oppDiff
            oppPrice = p
          }
          if (ippDiff < minIppDiff) {
            minIppDiff = ippDiff
            ippPrice = p
          }
        })
        
        psmItems.push({
          question: item.question.text,
          chartData: {
            labels: allPrices,
            datasets: [
              { label: 'Too Cheap', data: curves.tooCheap, borderColor: '#ef4444', tension: 0.3, fill: false },
              { label: 'Cheap (Bargain)', data: curves.cheap, borderColor: '#3b82f6', tension: 0.3, fill: false },
              { label: 'Expensive', data: curves.expensive, borderColor: '#f59e0b', tension: 0.3, fill: false },
              { label: 'Too Expensive', data: curves.tooExpensive, borderColor: '#10b981', tension: 0.3, fill: false },
            ]
          },
          oppPrice,
          ippPrice,
          count: item.count
        })
      }
    })

    const avgRating = ratingItems.length > 0
      ? (ratingItems.reduce((s, r) => s + r.average, 0) / ratingItems.length).toFixed(1)
      : '—'

    const kpis = [
      { label: 'Total Responses',  value: String(totalResponses ?? 0) },
      { label: 'Questions',         value: String((items ?? []).length) },
      { label: 'Avg Rating',        value: avgRating !== '—' ? `${avgRating}/5` : '—' },
      { label: 'Text Responses',    value: String(textItems.reduce((s, t) => s + t.count, 0)) },
    ]

    return { mcqCharts, ratingItems, textItems, maxdiffItems, conjointItems, kanoItems, psmItems, kpis }
  }, [analytics])

  // Aggregate doughnut — response share across surveys
  const doughnutData = useMemo(() => {
    const hasCounts = surveys.some((s) => (s.response_count ?? 0) > 0)
    if (!hasCounts) return null
    const labeled = surveys.filter((s) => (s.response_count ?? 0) > 0).slice(0, 8)
    return {
      labels: labeled.map((s) => s.title.length > 24 ? s.title.slice(0, 22) + '…' : s.title),
      datasets: [{
        data: labeled.map((s) => s.response_count ?? 0),
        backgroundColor: COLORS,
        borderWidth: 0,
        hoverOffset: 6,
      }],
    }
  }, [surveys])

  const lineData = useMemo(() => {
    const timeline = analytics?.responseTimeline ?? []
    if (!timeline.length) return null
    return {
      labels: timeline.map((p) => p.day),
      datasets: [{
        label: 'Responses',
        data: timeline.map((p) => Number(p.count ?? 0)),
        borderColor: PURPLE,
        backgroundColor: 'rgba(139,104,255,0.15)',
        pointBackgroundColor: PURPLE,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        tension: 0.35,
        fill: true,
      }],
    }
  }, [analytics])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Analytics</h2>
          <p className="text-sm text-gray-500 mt-1">Real-time insights from your survey responses</p>
        </div>

        {/* Survey selector */}
        {!loadingSurveys && surveys.length > 0 && (
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-gray-600">Survey:</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white min-w-56"
            >
              {surveys.map((s) => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
            <Button data-testid="Button-elt-56" size="sm" variant="secondary" onClick={handleExportCsv} loading={exporting}>
              Export CSV
            </Button>
          </div>
        )}
      </div>

      {analytics?.heatmap && (
        <div className="card p-6">
          <h3 className="font-bold text-gray-800 mb-2">Response heatmap</h3>
          <p className="text-xs text-gray-500 mb-4">When respondents submit (day × hour)</p>
          <div className="overflow-x-auto">
            <table className="text-[10px] border-collapse">
              <thead>
                <tr>
                  <th className="p-1" />
                  {analytics.heatmap.hours.filter((_, i) => i % 3 === 0).map((h) => (
                    <th key={h} colSpan={3} className="p-1 text-gray-400 font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {analytics.heatmap.days.map((day, di) => (
                  <tr key={day}>
                    <td className="p-1 font-semibold text-gray-500 pr-2">{day}</td>
                    {analytics.heatmap.matrix[di].map((count, hi) => {
                      const max = analytics.heatmap.max || 1
                      const intensity = count / max
                      return (
                        <td
                          key={hi}
                          title={`${count} responses`}
                          className="w-3 h-3 p-0"
                          style={{
                            backgroundColor: count
                              ? `rgba(139, 104, 255, ${0.15 + intensity * 0.85})`
                              : '#f3f4f6',
                          }}
                        />
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {segments && segments.length > 0 && (
        <div className="card p-6">
          <h3 className="font-bold text-gray-800 mb-3">Response segmentation</h3>
          <ul className="space-y-2 text-sm">
            {segments.map((seg) => (
              <li key={seg.segment} className="flex justify-between border-b border-gray-50 py-2">
                <span className="text-gray-600 truncate max-w-[70%]">{seg.segment}</span>
                <span className="font-bold text-primary-600">{seg.count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-600 font-medium">
          ⚠️ {error}
        </div>
      )}

      {/* Loading surveys */}
      {loadingSurveys && (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      )}

      {/* No surveys */}
      {!loadingSurveys && surveys.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">📊</p>
          <p className="font-semibold text-gray-600">No surveys yet</p>
          <p className="text-sm mt-1">Create and collect responses to see analytics here</p>
        </div>
      )}

      {/* KPIs */}
      {!loadingSurveys && surveys.length > 0 && (
        <>
          {loadingData ? (
            <div className="flex justify-center py-10"><Spinner size="lg" /></div>
          ) : analytics ? (
            <>
              {/* KPI row */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
                {kpis.map((k) => (
                  <div key={k.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <p className="text-xs text-gray-500 font-medium">{k.label}</p>
                    <p className="text-3xl font-extrabold text-gray-900 mt-1">{k.value}</p>
                  </div>
                ))}
              </div>

              {/* No responses yet */}
              {analytics.totalResponses === 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
                  <p className="text-3xl mb-2">📭</p>
                  <p className="font-semibold text-amber-800">No responses yet for this survey</p>
                  <p className="text-sm text-amber-600 mt-1">
                    Share the survey to start collecting data. Charts will appear once responses come in.
                  </p>
                </div>
              )}

               {/* MCQ Bar Charts */}
               {mcqCharts.length > 0 && (
                 <div>
                   <h3 className="font-bold text-gray-800 mb-4">Multiple Choice Results</h3>
                   <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                     {mcqCharts.map((ch, i) => (
                       <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                         <p className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2">{ch.question}</p>
                         <p className="text-xs text-gray-400 mb-4">
                           {ch.count} answer{ch.count !== 1 ? 's' : ''}
                           {ch.top && ` · Top: "${ch.top}"`}
                         </p>
                         <div className="chart-scroll-pass">
                           <Bar data={ch.chartData} options={chartOpts} />
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               )}

               {/* MaxDiff Results */}
               {maxdiffItems.length > 0 && (
                 <div>
                   <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><span>⚖️</span> MaxDiff Best/Worst Utility Scores</h3>
                   <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                     {maxdiffItems.map((ch, i) => (
                       <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                         <p className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2">{ch.question}</p>
                         <p className="text-xs text-gray-400 mb-4">{ch.count} respondents scaled</p>
                         <div className="chart-scroll-pass">
                           <Bar
                             data={ch.chartData}
                             options={{
                               ...chartOpts,
                               plugins: {
                                 ...chartOpts.plugins,
                                 tooltip: {
                                   callbacks: {
                                     label: (ctx) => `Utility Score: ${ctx.raw} (Range: -1 to +1)`
                                   }
                                 }
                               }
                             }}
                           />
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               )}

               {/* Conjoint Preferences */}
               {conjointItems.length > 0 && (
                 <div>
                   <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><span>📊</span> Conjoint Profile Preference Distribution</h3>
                   <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                     {conjointItems.map((ch, i) => (
                       <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                         <p className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2">{ch.question}</p>
                         <p className="text-xs text-gray-400 mb-4">{ch.count} preferences recorded</p>
                         <div className="chart-scroll-pass">
                           <Bar data={ch.chartData} options={chartOpts} />
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               )}

               {/* Kano Model Results */}
               {kanoItems.length > 0 && (
                 <div>
                   <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><span>🧠</span> Kano Model Product Classification</h3>
                   <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                     {kanoItems.map((ch, i) => {
                       const { A = 0, P = 0, M = 0, I = 0, R = 0, Q = 0 } = ch.categories
                       const total = A + P + M + I + R + Q || 1
                       
                       const dominantCat = Object.entries(ch.categories).sort((a,b) => b[1] - a[1])[0]?.[0] || 'I'
                       const catLabels = { A: 'Attractive (Delighters)', P: 'Performance (Linear)', M: 'Must-be (Basic)', I: 'Indifferent (Don\'t care)', R: 'Reverse', Q: 'Questionable' }
                       const catColors = { A: 'text-purple-600 bg-purple-50', P: 'text-blue-600 bg-blue-50', M: 'text-green-600 bg-green-50', I: 'text-gray-600 bg-gray-50', R: 'text-red-600 bg-red-50', Q: 'text-amber-600 bg-amber-50' }

                       return (
                         <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                           <div>
                             <p className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2">{ch.question}</p>
                             <p className="text-xs text-gray-400">{ch.count} Kano evaluations</p>
                           </div>
                           
                           <div className="flex items-center gap-2 p-3.5 rounded-xl border border-dashed border-gray-100">
                             <span className="text-xs text-gray-400">Dominant Category:</span>
                             <span className={`text-xs font-bold px-2 py-1 rounded-lg ${catColors[dominantCat] || ''}`}>
                               {catLabels[dominantCat] || 'None'}
                             </span>
                           </div>

                           <div className="space-y-2 text-xs">
                             {Object.entries(catLabels).map(([catKey, label]) => {
                               const val = ch.categories[catKey] ?? 0
                               const pct = Math.round((val / total) * 100)
                               return (
                                 <div key={catKey} className="space-y-1">
                                   <div className="flex justify-between font-medium">
                                     <span className="text-gray-600">{label}</span>
                                     <span className="text-gray-400">{val} ({pct}%)</span>
                                   </div>
                                   <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                     <div className="h-full bg-primary-500 rounded-full" style={{ width: `${pct}%` }} />
                                   </div>
                                 </div>
                               )
                             })}
                           </div>
                         </div>
                       )
                     })}
                   </div>
                 </div>
               )}

               {/* PSM Prices */}
               {psmItems.length > 0 && (
                 <div>
                   <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><span>💰</span> Van Westendorp Price Sensitivity Curves</h3>
                   <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                     {psmItems.map((ch, i) => (
                       <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                         <div>
                           <p className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2">{ch.question}</p>
                           <p className="text-xs text-gray-400">{ch.count} pricing points analyzed</p>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-4">
                           <div className="bg-primary-50/50 p-3 rounded-xl border border-primary-100/50">
                             <p className="text-[10px] uppercase tracking-wider text-primary-600 font-bold">Optimum Price Point</p>
                             <p className="text-xl font-extrabold text-primary-700 mt-1">${ch.oppPrice}</p>
                           </div>
                           <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100/50">
                             <p className="text-[10px] uppercase tracking-wider text-amber-600 font-bold">Indifference Price Point</p>
                             <p className="text-xl font-extrabold text-amber-700 mt-1">${ch.ippPrice}</p>
                           </div>
                         </div>

                         <div className="chart-scroll-pass">
                           <Line
                             data={ch.chartData}
                             options={{
                               ...chartOpts,
                               plugins: {
                                 ...chartOpts.plugins,
                                 legend: { display: true, position: 'bottom', labels: { boxWidth: 10, fontSize: 10 } }
                               },
                               scales: {
                                 ...chartOpts.scales,
                                 y: {
                                   ...chartOpts.scales.y,
                                   ticks: {
                                     ...chartOpts.scales.y.ticks,
                                     callback: (v) => `${v}%`
                                   }
                                 }
                               }
                             }}
                           />
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               )}

              {/* Response trend line chart */}
              {lineData && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="font-bold text-gray-800 mb-1">Response Trend</h3>
                  <p className="text-xs text-gray-400 mb-4">Responses over time for selected survey</p>
                  <div className="chart-scroll-pass">
                    <Line data={lineData} options={chartOpts} />
                  </div>
                </div>
              )}

              {/* Rating Items */}
              {ratingItems.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-800 mb-4">Rating Question Results</h3>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                    {ratingItems.map((r, i) => (
                      <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <p className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2">{r.question}</p>
                        <p className="text-xs text-gray-400 mb-3">{r.count} answer{r.count !== 1 ? 's' : ''}</p>
                        <div className="flex items-center gap-3 mb-4">
                          <span className={`text-4xl font-extrabold ${
                            r.average >= 4 ? 'text-green-500' : r.average >= 3 ? 'text-amber-500' : 'text-red-500'
                          }`}>{r.average}</span>
                          <span className="text-gray-400 text-sm">/ 5</span>
                          <div className="flex gap-1">
                            {[1,2,3,4,5].map((n) => (
                              <span key={n} className={`text-lg ${n <= Math.round(r.average) ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
                            ))}
                          </div>
                        </div>
                        {/* Distribution bars */}
                        <div className="space-y-1.5">
                          {[5,4,3,2,1].map((score) => {
                            const cnt = r.dist[score] ?? 0
                            const pct = r.count > 0 ? (cnt / r.count) * 100 : 0
                            return (
                              <div key={score} className="flex items-center gap-2 text-xs">
                                <span className="w-4 text-gray-500">{score}★</span>
                                <div className="flex-1 bg-gray-100 rounded-full h-2">
                                  <div className="h-2 rounded-full bg-primary-500 transition-all duration-700"
                                    style={{ width: `${pct}%` }} />
                                </div>
                                <span className="w-5 text-gray-400">{cnt}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Text responses */}
              {textItems.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-800 mb-4">Open-Ended Responses</h3>
                  <div className="space-y-4">
                    {textItems.map((t, i) => (
                      <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <p className="font-semibold text-gray-800 text-sm mb-1">{t.question}</p>
                        <p className="text-xs text-gray-400 mb-3">{t.count} answer{t.count !== 1 ? 's' : ''}</p>
                        {t.samples.length === 0 ? (
                          <p className="text-sm text-gray-400 italic">No responses yet</p>
                        ) : (
                          <div className="space-y-2">
                            {t.samples.map((s, si) => (
                              <div key={si} className={`px-4 py-3 rounded-xl text-sm text-gray-700 ${
                                si % 2 === 0 ? 'bg-gray-50' : 'bg-white border border-gray-100'
                              }`}>
                                "{s}"
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}

          {/* Cross-survey doughnut — always visible when surveys exist */}
          {doughnutData && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-800 mb-1">Response Distribution Across Surveys</h3>
              <p className="text-xs text-gray-400 mb-5">Proportion of total responses per survey</p>
              <div className="max-w-lg mx-auto chart-scroll-pass">
                <Doughnut data={doughnutData} options={doughnutOpts} />
              </div>
            </div>
          )}

          {/* Survey performance table */}
          {surveys.some((s) => (s.response_count ?? 0) > 0) && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-800 mb-4">All Survey Performance</h3>
              <div className="space-y-4">
                {surveys
                  .filter((s) => (s.response_count ?? 0) > 0)
                  .map((s) => {
                    const maxR = Math.max(...surveys.map((x) => x.response_count ?? 0), 1)
                    const pct  = Math.round(((s.response_count ?? 0) / maxR) * 100)
                    return (
                      <div key={s.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700 truncate max-w-xs">{s.title}</span>
                          <div className="flex gap-4 shrink-0">
                            <span className="text-gray-400 text-xs">{s.response_count ?? 0} responses</span>
                            <span className="text-gray-700 font-semibold">{pct}%</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="h-2 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-700"
                            style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}

          {/* Bottom spacer — ensures last section clears mobile nav / safe area */}
          <div aria-hidden="true" className="h-2 shrink-0" />
        </>
      )}
    </div>
  )
}
