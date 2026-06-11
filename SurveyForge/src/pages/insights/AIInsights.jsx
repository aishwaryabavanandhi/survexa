/**
 * pages/insights/AIInsights.jsx
 * Fetches insights from GET /insights (user-scoped stats + optional OpenAI).
 */
import { useState, useEffect, useCallback } from 'react'
import { getAIInsights } from '../../services/api'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'

export default function AIInsights() {
  const [insights, setInsights] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState('loading')
  const [loadError, setLoadError] = useState(null)
  const [aiError, setAiError] = useState(null)

  const fetchInsights = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    setAiError(null)
    try {
      const data = await getAIInsights()
      setInsights(Array.isArray(data.insights) ? data.insights : [])
      setStats(data.stats ?? null)
      setSource(data.source ?? 'api')
      setAiError(data.aiError ?? null)
    } catch (err) {
      setInsights([])
      setStats(null)
      setLoadError(err.response?.data?.error ?? err.message ?? 'Could not load insights.')
      setSource('offline')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInsights()
  }, [fetchInsights])

  const sourceBadge = () => {
    if (loading || source === 'loading') return null
    if (source === 'offline') return { cls: 'bg-amber-100 text-amber-700', label: '⚠️ Backend unreachable' }
    if (source && source !== 'api') {
      return { cls: 'bg-green-100 text-green-700', label: `✅ Generated with ${source.toUpperCase()}` }
    }
    return { cls: 'bg-gray-100 text-gray-600', label: '📋 Insights' }
  }

  const badge = sourceBadge()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            💡 AI Insights
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Analysis scoped to your surveys and responses
          </p>
        </div>
        <Button onClick={fetchInsights} loading={loading} variant="secondary">
          🔄 Refresh Insights
        </Button>
      </div>

      {loadError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong className="font-semibold">Could not reach the API.</strong>{' '}
          {loadError} Ensure the backend is running and you are logged in.
        </div>
      )}


      <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-2xl p-6 text-white">
        <p className="text-sm font-semibold text-primary-100 mb-1">Summary</p>
        {stats ? (
          <>
            <h3 className="text-xl font-extrabold mb-2">
              {stats.totalResponses > 0
                ? `${stats.totalResponses} responses across ${stats.totalSurveys} surveys`
                : 'Ready to collect your first responses'}
            </h3>
            <p className="text-primary-100 text-sm leading-relaxed">
              {stats.totalResponses > 0
                ? `Averaging ${stats.avgResponsesPerSurvey} responses per survey. ${
                    stats.topSurvey
                      ? `Top survey: "${stats.topSurvey.title}" with ${stats.topSurvey.responses} responses.`
                      : ''
                  }`
                : 'Create and share surveys to populate insights.'}
            </p>
            <div className="grid grid-cols-3 gap-4 mt-5">
              {[
                [stats.totalSurveys, 'Surveys'],
                [stats.totalResponses, 'Responses'],
                [stats.totalQuestions, 'Questions'],
              ].map(([v, l]) => (
                <div key={l} className="bg-white/15 rounded-xl p-3">
                  <p className="text-xl font-extrabold">{v}</p>
                  <p className="text-xs text-primary-200 mt-0.5">{l}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <h3 className="text-xl font-extrabold mb-2">Loading summary…</h3>
            <p className="text-primary-100 text-sm leading-relaxed">
              Stats appear once the insights API responds.
            </p>
          </>
        )}
      </div>

      {!loading && badge && (
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badge.cls}`}>
            {badge.label}
          </span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : insights.length === 0 ? (
        <div className="text-center py-14 text-gray-500 text-sm">
          No insight cards yet. {loadError ? 'Fix the connection and retry.' : 'Collect responses to enrich insights.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {insights.map((ins) => (
            <div
              key={ins.id}
              className={`rounded-2xl border p-6 ${ins.color ?? 'bg-white border-gray-100'}`}
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl shrink-0">{ins.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${ins.labelColor ?? 'bg-gray-100 text-gray-700'}`}
                    >
                      {ins.label}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">{ins.title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{ins.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
