/**
 * pages/responses/Responses.jsx
 * Real API integration — loads surveys, then fetches responses per survey.
 */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getSurveys, getResponses } from '../../services/api'
import Badge   from '../../components/ui/Badge'
import Button  from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'

export default function Responses() {
  const [surveys,       setSurveys]       = useState([])
  const [selectedId,    setSelectedId]    = useState('')
  const [responses,     setResponses]     = useState([])
  const [loadingSurveys, setLoadingSurveys] = useState(true)
  const [loadingResp,   setLoadingResp]   = useState(false)
  const [search,        setSearch]        = useState('')

  // Load survey list on mount
  useEffect(() => {
    getSurveys()
      .then((res) => {
        const list = res.data ?? []
        setSurveys(list)
        if (list.length > 0) setSelectedId(String(list[0].id))
      })
      .catch(() => setSurveys([]))
      .finally(() => setLoadingSurveys(false))
  }, [])

  // Load responses when survey changes
  useEffect(() => {
    if (!selectedId) return
    setLoadingResp(true)
    getResponses(selectedId)
      .then((res) => setResponses(res.data ?? []))
      .catch(() => setResponses([]))
      .finally(() => setLoadingResp(false))
  }, [selectedId])

  const filtered = responses.filter((r) => {
    if (!search) return true
    const answersStr = JSON.stringify(r.answers ?? {}).toLowerCase()
    return answersStr.includes(search.toLowerCase()) ||
           String(r.id).includes(search) ||
           (r.submitted_at ?? '').includes(search)
  })

  const exportCSV = () => {
    if (responses.length === 0) return
    const rows = responses.map((r) => {
      const answers = typeof r.answers === 'string' ? JSON.parse(r.answers) : r.answers
      return `${r.id},"${r.submitted_at}","${JSON.stringify(answers).replace(/"/g, '""')}"`
    })
    const csv  = `ID,Submitted At,Answers\n${rows.join('\n')}`
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a'); a.href = url
    a.download = `responses-survey-${selectedId}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const selectedSurvey = surveys.find((s) => String(s.id) === selectedId)

  if (loadingSurveys) {
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
          <h2 className="text-2xl font-extrabold text-gray-900">Responses</h2>
          <p className="text-sm text-gray-500 mt-1">
            {loadingResp ? 'Loading…' : `${responses.length} submission${responses.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Button data-testid="Button-elt-155" variant="secondary" onClick={exportCSV} disabled={responses.length === 0}>
          ⬇ Export CSV
        </Button>
      </div>

      {/* No surveys at all */}
      {surveys.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">💬</p>
          <p className="font-semibold text-gray-600">No surveys yet</p>
          <p className="text-sm mt-1 mb-5">Create a survey first to collect responses</p>
          <Link to="/surveys/builder"><Button data-testid="Button-elt-156">＋ Create Survey</Button></Link>
        </div>
      ) : (
        <>
          {/* Survey selector + search */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-48">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Select Survey</label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
              >
                {surveys.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.response_count ?? 0} responses)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-48">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Search</label>
              <input data-testid="input-elt-157"
                placeholder="Search responses…"
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
          </div>

          {/* Response table */}
          {loadingResp ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-4xl mb-3">📭</p>
              <p className="font-medium text-gray-600">
                {responses.length === 0 ? 'No responses collected yet' : 'No responses match your search'}
              </p>
              {responses.length === 0 && (
                <p className="text-sm mt-1">
                  Share your survey to start collecting responses.
                </p>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr className="text-left text-gray-500">
                    <th className="px-5 py-3 font-medium">#</th>
                    <th className="px-5 py-3 font-medium">Response ID</th>
                    <th className="px-5 py-3 font-medium">Submitted At</th>
                    <th className="px-5 py-3 font-medium">Answers</th>
                    <th className="px-5 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((r, i) => {
                    const answers = typeof r.answers === 'string'
                      ? JSON.parse(r.answers)
                      : r.answers ?? {}
                    const answerCount = Object.keys(answers).length

                    return (
                      <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4 text-gray-400">{i + 1}</td>
                        <td className="px-5 py-4 font-mono text-xs text-gray-600">
                          #{r.id}
                        </td>
                        <td className="px-5 py-4 text-gray-400 text-xs">
                          {r.submitted_at
                            ? new Date(r.submitted_at).toLocaleString()
                            : '—'}
                        </td>
                        <td className="px-5 py-4">
                          <Badge variant="green">{answerCount} answer{answerCount !== 1 ? 's' : ''}</Badge>
                        </td>
                        <td className="px-5 py-4">
                          <Link to={`/responses/${r.id}`}
                            className="text-primary-500 hover:text-primary-700 text-xs font-semibold">
                            View →
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
