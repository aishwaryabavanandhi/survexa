import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)
import { getSurveys, getAnalytics } from '../../services/api'
import Spinner from '../../components/ui/Spinner'

export default function LiveResults() {
  const [surveys, setSurveys] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(null)

  useEffect(() => {
    getSurveys()
      .then((res) => {
        const list = (res.data ?? []).filter((s) => s.status === 'published' || s.share_token)
        setSurveys(list)
        if (list.length) setSelectedId(String(list[0].id))
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedId) return
    const load = () => {
      getAnalytics(selectedId)
        .then((res) => {
          setAnalytics(res.data ?? null)
          setLastRefresh(new Date())
        })
        .catch(() => setAnalytics(null))
    }
    load()
    const interval = setInterval(load, 8000)
    return () => clearInterval(interval)
  }, [selectedId])

  const timeline = analytics?.responseTimeline ?? []
  const chartData = {
    labels: timeline.map((t) => t.day),
    datasets: [{
      label: 'Responses',
      data: timeline.map((t) => t.count),
      backgroundColor: '#B8A4E8',
      borderRadius: 6,
    }],
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Live results</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Auto-refreshes every 8 seconds — ideal for workshops and demos.
        </p>
      </div>

      <div className="card p-5 dark:bg-[#16161f]">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Survey</label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="mt-2 w-full rounded-xl border border-gray-200 dark:border-[#2a2a3a] px-4 py-3 text-sm dark:bg-[#1e1e2e]"
        >
          {surveys.map((s) => (
            <option key={s.id} value={s.id}>{s.title}</option>
          ))}
        </select>
        {lastRefresh && (
          <p className="text-xs text-gray-400 mt-2">Last updated {lastRefresh.toLocaleTimeString()}</p>
        )}
      </div>

      {analytics ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-6 text-center dark:bg-[#16161f]">
            <p className="text-3xl font-extrabold text-primary-600">{analytics.totalResponses ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">Total responses</p>
          </div>
          <div className="card p-6 text-center dark:bg-[#16161f]">
            <p className="text-3xl font-extrabold text-emerald-600">{analytics.completionRate?.rate ?? 0}%</p>
            <p className="text-xs text-gray-500 mt-1">Completion rate</p>
          </div>
          <div className="card p-6 text-center dark:bg-[#16161f]">
            <p className="text-3xl font-extrabold text-amber-600">{timeline.length}</p>
            <p className="text-xs text-gray-500 mt-1">Active days</p>
          </div>
          {timeline.length > 0 && (
            <div className="card p-6 md:col-span-3 dark:bg-[#16161f]">
              <h3 className="font-bold text-sm mb-4">Response trend</h3>
              <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
            </div>
          )}
        </div>
      ) : (
        <div className="card p-8 text-center text-gray-500">
          Select a survey with responses to see live charts.
        </div>
      )}

      <Link to="/analytics" className="text-sm font-bold text-primary-600 hover:underline">
        Full analytics →
      </Link>
    </div>
  )
}
