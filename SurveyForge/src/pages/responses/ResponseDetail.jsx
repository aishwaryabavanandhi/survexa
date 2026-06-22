/**
 * pages/responses/ResponseDetail.jsx — single response + survey context (2 API calls).
 */
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getResponseById, getSurveyById } from '../../services/api'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'

export default function ResponseDetail() {
  const { id } = useParams()

  const [response, setResponse] = useState(null)
  const [survey, setSurvey] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return

    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        const resBody = await getResponseById(id)
        if (cancelled) return

        const row = resBody?.data
        if (!row) {
          setError(`Response #${id} not found.`)
          setResponse(null)
          setSurvey(null)
          setQuestions([])
          return
        }

        const surveyBody = await getSurveyById(row.survey_id)
        if (cancelled) return

        const surveyRow = surveyBody?.data
        if (!surveyRow) {
          setError('Survey not found for this response.')
          setResponse(row)
          setSurvey(null)
          setQuestions([])
          return
        }

        setResponse(row)
        setSurvey(surveyRow)
        setQuestions(surveyRow.questions ?? [])
      } catch (err) {
        if (cancelled) return
        const msg =
          err.response?.data?.error ??
          err.message ??
          'Failed to load response'
        setError(msg)
        setResponse(null)
        setSurvey(null)
        setQuestions([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Spinner size="lg" />
        <p className="text-sm text-gray-400">Loading response…</p>
      </div>
    )
  }

  if (error || !response) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Link to="/responses" className="text-sm text-primary-500 font-medium hover:underline">
          ← Back to Responses
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-3xl mb-2">❌</p>
          <p className="font-semibold text-red-700">{error ?? 'Response not found'}</p>
        </div>
      </div>
    )
  }

  const answers =
    typeof response.answers === 'string'
      ? JSON.parse(response.answers || '{}')
      : response.answers ?? {}

  const displayAnswers =
    questions.length > 0
      ? questions.map((q) => ({
          question: q.text,
          answer: answers[q.id] ?? '(no answer)',
          type: q.type,
        }))
      : Object.entries(answers).map(([key, val]) => ({
          question: `Question #${key}`,
          answer: val,
          type: 'text',
        }))

  const answerCount = Object.keys(answers).length
  const completionPct =
    questions.length > 0 ? Math.round((answerCount / questions.length) * 100) : 100

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link to="/responses" className="text-sm text-primary-500 font-medium hover:underline">
          ← Responses
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-500">Response #{id}</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">
              {survey?.title ?? 'Survey Response'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Response #{id} · Submitted{' '}
              {response.submitted_at
                ? new Date(response.submitted_at).toLocaleString()
                : '—'}
            </p>
          </div>
          <Badge variant={completionPct >= 80 ? 'green' : completionPct >= 50 ? 'amber' : 'red'}>
            {completionPct}% complete
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          {[
            { label: 'Total Questions', value: questions.length || '—' },
            { label: 'Answered', value: answerCount },
            { label: 'Survey ID', value: `#${survey?.id ?? response.survey_id ?? '—'}` },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-gray-400 font-medium">{label}</p>
              <p className="text-lg font-extrabold text-gray-800 mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-gray-800">Answers ({displayAnswers.length})</h3>
        {displayAnswers.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p className="text-3xl mb-2">📭</p>
            <p>No answers recorded</p>
          </div>
        ) : (
          displayAnswers.map((a, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-bold text-primary-500 bg-primary-50 px-2 py-1 rounded-lg w-fit mb-2">
                Q{i + 1}
              </p>
              <p className="text-sm font-semibold text-gray-800 mb-2">{a.question}</p>
              <div
                className={`text-sm text-gray-600 rounded-xl px-4 py-3 ${
                  a.answer === '(no answer)'
                    ? 'bg-gray-50 italic text-gray-400'
                    : 'bg-primary-50 text-gray-700'
                }`}
              >
                {Array.isArray(a.answer) ? a.answer.join(', ') : String(a.answer)}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-3 pb-8">
        <Link to="/responses">
          <Button data-testid="Button-elt-153" variant="secondary">← Back</Button>
        </Link>
        <Link to="/analytics">
          <Button data-testid="Button-elt-154" variant="secondary">📊 View Analytics</Button>
        </Link>
      </div>
    </div>
  )
}
