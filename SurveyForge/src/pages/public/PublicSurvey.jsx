/**
 * pages/public/PublicSurvey.jsx
 * Public survey-taking page — no authentication required.
 * Accessed via /survey/:token (share_token)
 */
import { useState, useEffect, useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { getPublicSurvey, submitPublicResponse, trackCampaignEvent } from '../../services/api'
import survexaLogo from '../../assets/survexa_logo.png'

function qKey(q) {
  return String(q.id)
}

function isAnswered(q, rawVal) {
  const val = rawVal
  if (val === undefined || val === null) return false
  if (q.type === 'checkbox') return Array.isArray(val) && val.length > 0
  if (q.type === 'text') return String(val).trim() !== ''
  if (q.type === 'rating') return val !== '' && !Number.isNaN(Number(val))
  if (q.type === 'maxdiff') return val.best && val.worst
  if (q.type === 'conjoint') return val !== undefined && val !== ''
  if (q.type === 'kano') return val.functional && val.dysfunctional
  if (q.type === 'psm') return val.tooCheap !== undefined && val.cheap !== undefined && val.expensive !== undefined && val.tooExpensive !== undefined
  if (q.type === 'nps') return val !== '' && !Number.isNaN(Number(val))
  if (q.type === 'long_text') return String(val).trim() !== ''
  if (q.type === 'matrix') return val && typeof val === 'object' && Object.keys(val).length > 0
  if (q.type === 'date') return String(val).trim() !== ''
  if (q.type === 'file') return val?.name || val?.fileName
  return val !== ''
}

export default function PublicSurvey() {
  const { token } = useParams()
  const [searchParams] = useSearchParams()
  const campaignToken = searchParams.get('c')
  const [survey, setSurvey] = useState(null)
  const [answers, setAnswers] = useState({})
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    getPublicSurvey(token)
      .then((res) => setSurvey(res.data))
      .catch(() => setError('Survey not found or this link is no longer active.'))
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => {
    if (campaignToken && survey) {
      trackCampaignEvent(campaignToken, 'start').catch(() => {})
    }
  }, [campaignToken, survey])

  // Dynamic skip logic branching solver
  const visibleQuestions = useMemo(() => {
    if (!survey?.questions) return []
    const visible = []
    
    let currentIndex = 0
    while (currentIndex < survey.questions.length) {
      const q = survey.questions[currentIndex]
      visible.push(q)
      
      const qVal = answers[String(q.id)]
      const match = (q.logic ?? []).find((rule) => {
        if (!rule.target || !rule.condition) return false
        if (rule.condition === 'any') return qVal !== undefined && qVal !== ''
        if (q.type === 'checkbox' && Array.isArray(qVal)) {
          return qVal.includes(rule.condition)
        }
        return String(qVal).toLowerCase() === String(rule.condition).toLowerCase()
      })
      
      if (match) {
        if (match.target === 'submit') {
          break
        }
        const targetIdx = survey.questions.findIndex((x) => String(x.id) === String(match.target))
        if (targetIdx !== -1 && targetIdx > currentIndex) {
          currentIndex = targetIdx
          continue
        }
      }
      
      currentIndex++
    }
    return visible
  }, [survey, answers])

  const handleAnswer = (questionId, value) => {
    const k = String(questionId)
    setAnswers((prev) => ({ ...prev, [k]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const missing = visibleQuestions.filter((q) => {
      const key = qKey(q)
      return q.required && !isAnswered(q, answers[key])
    })
    if (missing.length > 0) {
      setError(`Please answer all required questions (${missing.length} remaining).`)
      return
    }

    const payload = {}
    for (const q of visibleQuestions) {
      const k = qKey(q)
      if (answers[k] !== undefined) payload[k] = answers[k]
    }

    setSubmitting(true)
    setError(null)
    try {
      await submitPublicResponse(token, payload, email.trim() || null, campaignToken)
      setSubmitted(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Could not submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-300 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading survey…</p>
        </div>
      </div>
    )
  }

  if (error && !survey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">🔗</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Survey Not Found</h2>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  const theme = survey?.theme ?? {}
  const primaryColor = theme.primaryColor || '#6C63FF'
  const borderRadius = theme.borderRadius || '12px'
  const fontStyle = theme.fontStyle || 'Inter'
  const bgPreset = theme.background || 'clean'

  let bgClass = "bg-gradient-to-br from-primary-50 via-white to-primary-50 text-gray-900"
  let cardClass = "bg-white border border-gray-100 shadow-sm"
  let textClass = "text-gray-900"
  let subTextClass = "text-gray-500"

  if (bgPreset === 'dark') {
    bgClass = "bg-[#0b0b13] min-h-screen text-gray-100"
    cardClass = "bg-[#141420] border border-[#232334] shadow-lg"
    textClass = "text-white"
    subTextClass = "text-gray-400"
  } else if (bgPreset === 'cyberpunk') {
    bgClass = "bg-[#0c001c] min-h-screen text-[#00f3ff]"
    cardClass = "bg-[#150028] border border-[#ff00ff] shadow-[0_0_15px_rgba(255,0,255,0.2)]"
    textClass = "text-white font-mono"
    subTextClass = "text-fuchsia-300"
  } else if (bgPreset === 'forest') {
    bgClass = "bg-[#f4f7f4] min-h-screen text-emerald-950"
    cardClass = "bg-white border border-emerald-100 shadow-sm"
    textClass = "text-emerald-900"
    subTextClass = "text-emerald-700/80"
  }

  if (submitted) {
    return (
      <div className={`min-h-screen ${bgClass} flex items-center justify-center p-6`} style={{ fontFamily: fontStyle }}>
        <div className={`${cardClass} p-10 max-w-md w-full text-center`} style={{ borderRadius: borderRadius }}>
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-5">
            ✅
          </div>
          <h2 className="text-2xl font-extrabold mb-2" style={{ color: bgPreset === 'cyberpunk' ? '#ff00ff' : 'inherit' }}>Response Submitted!</h2>
          <p className={`${subTextClass} text-sm`}>
            Thank you for completing <strong>{survey?.title}</strong>.
            Your response has been recorded.
          </p>
          <div className="mt-6 pt-5 border-t border-gray-100/10 flex flex-col items-center justify-center gap-1">
            <p className="text-xs text-gray-400">Powered by</p>
            <div className="flex items-center gap-1.5 justify-center">
              <img src={survexaLogo} alt="Survexa Logo" className="w-5 h-5 object-contain" />
              <p className="text-sm font-bold font-display" style={{ color: primaryColor }}>Survexa</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-[100dvh] ${bgClass} pb-[max(1.25rem,env(safe-area-inset-bottom,0px))]`} style={{ fontFamily: fontStyle }}>
      <div className={`${cardClass} border-t-0 border-x-0 rounded-none shadow-sm pt-[env(safe-area-inset-top,0px)]`}>
        <div className="max-w-2xl mx-auto px-6 py-3.5 flex items-center gap-2">
          <img src={survexaLogo} alt="Survexa Logo" className="w-7 h-7 object-contain" />
          <span className="font-extrabold text-sm font-display" style={{ color: bgPreset === 'cyberpunk' ? '#ff00ff' : 'inherit' }}>Survexa</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className={`${cardClass} p-8 mb-6`} style={{ borderRadius: borderRadius }}>
          <div className="w-12 h-1.5 rounded-full mb-5" style={{ backgroundColor: primaryColor }} />
          <h1 className="text-2xl font-extrabold" style={{ color: bgPreset === 'cyberpunk' ? '#ff00ff' : 'inherit' }}>{survey?.title}</h1>
          {survey?.description && (
            <p className={`${subTextClass} mt-2 text-sm leading-relaxed`}>{survey.description}</p>
          )}
          <p className="mt-4 text-xs text-gray-400">
            {visibleQuestions.length} question{visibleQuestions.length !== 1 ? 's' : ''}
            {' · '}Estimated time: ~{Math.max(1, Math.ceil((visibleQuestions.length) * 0.5))} min
          </p>
          {visibleQuestions.length > 0 && (() => {
            const answeredCount = visibleQuestions.filter((q) => isAnswered(q, answers[qKey(q)])).length
            const pct = Math.round((answeredCount / visibleQuestions.length) * 100)
            return (
              <div className="mt-4">
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{ width: `${pct}%`, backgroundColor: primaryColor }}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">{answeredCount} of {visibleQuestions.length} answered ({pct}%)</p>
              </div>
            )
          })()}
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
            ⚠️ {error}
          </div>
        )}

        <form data-testid="form-elt-133" onSubmit={handleSubmit} className="space-y-5">
          {visibleQuestions.map((q, idx) => {
            const key = qKey(q)
            return (
              <QuestionCard
                key={key}
                question={q}
                index={idx}
                value={answers[key]}
                onChange={(val) => handleAnswer(key, val)}
                theme={{ primaryColor, borderRadius, cardClass, textClass, subTextClass, bgPreset }}
              />
            )
          })}

          <div className={`${cardClass} p-6`} style={{ borderRadius: borderRadius }}>
            <label className="block text-sm font-semibold mb-1">
              Your email (optional)
            </label>
            <p className="text-xs text-gray-400 mb-3">
              Stored with your response for follow-up.
            </p>
            <input data-testid="input-elt-134"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-transparent"
              style={{ borderRadius: borderRadius }}
            />
          </div>

          <button data-testid="button-elt-135"
            type="submit"
            disabled={submitting}
            style={{ backgroundColor: primaryColor, borderRadius: borderRadius }}
            className="w-full py-4 text-white font-bold shadow-lg hover:brightness-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Submitting…
              </span>
            ) : (
              'Submit Response →'
            )}
          </button>

          <p className="text-center text-xs text-gray-400 pb-6 flex items-center justify-center gap-1.5">
            Powered by <img src={survexaLogo} alt="Survexa Logo" className="w-4 h-4 object-contain" /> <span style={{ color: primaryColor }} className="font-bold font-display">Survexa</span>
          </p>
        </form>
      </div>
    </div>
  )
}

function QuestionCard({ question, index, value, onChange, theme }) {
  const t = question.type
  return (
    <div className={`${theme.cardClass} p-6`} style={{ borderRadius: theme.borderRadius }}>
      <div className="flex gap-3 mb-4">
        <span className="w-7 h-7 font-bold text-sm flex items-center justify-center shrink-0" style={{ backgroundColor: `${theme.primaryColor}1a`, color: theme.primaryColor, borderRadius: '6px' }}>
          {index + 1}
        </span>
        <div>
          <p className="font-semibold text-sm leading-snug">
            {question.text}
            {question.required ? <span className="text-red-400 ml-1">*</span> : null}
          </p>
        </div>
      </div>

      {t === 'mcq' && <MCQInput question={question} value={value} onChange={onChange} theme={theme} />}
      {t === 'rating' && <RatingInput value={value} onChange={onChange} theme={theme} max={5} />}
      {t === 'nps' && <RatingInput value={value} onChange={onChange} theme={theme} max={10} labels={['Not at all likely', 'Extremely likely']} />}
      {t === 'text' && <TextInput value={value} onChange={onChange} theme={theme} rows={2} />}
      {t === 'long_text' && <TextInput value={value} onChange={onChange} theme={theme} rows={5} />}
      {t === 'date' && (
        <input data-testid="input-elt-136"
          type="date"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          style={{ borderRadius: theme.borderRadius }}
          className="w-full px-4 py-3 border border-gray-200 text-sm bg-transparent"
        />
      )}
      {t === 'file' && (
        <input data-testid="input-elt-137"
          type="file"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onChange({ name: file.name, size: file.size, type: file.type })
          }}
          style={{ borderRadius: theme.borderRadius }}
          className="w-full text-sm"
        />
      )}
      {t === 'matrix' && <MatrixInput question={question} value={value} onChange={onChange} theme={theme} />}
      {t === 'checkbox' && <CheckboxInput question={question} value={value} onChange={onChange} theme={theme} />}
      {t === 'dropdown' && <DropdownInput question={question} value={value} onChange={onChange} theme={theme} />}
      {t === 'maxdiff' && <MaxDiffInput question={question} value={value} onChange={onChange} theme={theme} />}
      {t === 'conjoint' && <ConjointInput question={question} value={value} onChange={onChange} theme={theme} />}
      {t === 'kano' && <KanoInput value={value} onChange={onChange} theme={theme} />}
      {t === 'psm' && <PSMInput question={question} value={value} onChange={onChange} theme={theme} />}
      {!['mcq', 'rating', 'nps', 'text', 'long_text', 'date', 'file', 'matrix', 'checkbox', 'dropdown', 'maxdiff', 'conjoint', 'kano', 'psm'].includes(t) && (
        <TextInput value={value} onChange={onChange} theme={theme} />
      )}
    </div>
  )
}

function MCQInput({ question, value, onChange, theme }) {
  return (
    <div className="space-y-2">
      {(question.options ?? []).map((opt) => (
        <label
          key={opt}
          style={{ borderRadius: theme.borderRadius }}
          className={`flex items-center gap-3 px-4 py-3 border cursor-pointer transition-all
            ${value === opt
              ? 'bg-primary-50/10'
              : 'hover:bg-gray-50/5'}`}
          onClick={() => onChange(opt)}
        >
          <div
            className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
            style={{ borderColor: value === opt ? theme.primaryColor : '#cbd5e1' }}
          >
            {value === opt && <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.primaryColor }} />}
          </div>
          <span className="text-sm font-medium">{opt}</span>
        </label>
      ))}
    </div>
  )
}

function CheckboxInput({ question, value, onChange, theme }) {
  const selected = Array.isArray(value) ? value : []
  const toggle = (opt) => {
    const next = selected.includes(opt) ? selected.filter((x) => x !== opt) : [...selected, opt]
    onChange(next)
  }
  return (
    <div className="space-y-2">
      {(question.options ?? []).map((opt) => (
        <label
          key={opt}
          style={{ borderRadius: theme.borderRadius }}
          className={`flex items-center gap-3 px-4 py-3 border cursor-pointer transition-all
            ${selected.includes(opt)
              ? 'bg-primary-50/10'
              : 'hover:bg-gray-50/5'}`}
        >
          <input data-testid="input-elt-138"
            type="checkbox"
            checked={selected.includes(opt)}
            onChange={() => toggle(opt)}
            style={{ accentColor: theme.primaryColor }}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm font-medium">{opt}</span>
        </label>
      ))}
    </div>
  )
}

function DropdownInput({ question, value, onChange, theme }) {
  const opts = question.options ?? []
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      style={{ borderRadius: theme.borderRadius }}
      className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none bg-transparent"
    >
      <option value="">Select an option…</option>
      {opts.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  )
}

function MatrixInput({ question, value = {}, onChange, theme }) {
  const opts = question.options?.rows ? question.options : { rows: [], columns: [] }
  const rows = opts.rows || []
  const cols = opts.columns || []
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="p-2" />
            {cols.map((c) => (
              <th key={c} className="p-2 text-xs font-semibold text-center">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row} className="border-t border-gray-200/50">
              <td className="p-2 font-medium text-xs">{row}</td>
              {cols.map((col) => (
                <td key={col} className="p-2 text-center">
                  <input data-testid="input-elt-139"
                    type="radio"
                    name={`matrix-${question.id}-${row}`}
                    checked={value[row] === col}
                    onChange={() => onChange({ ...value, [row]: col })}
                    style={{ accentColor: theme.primaryColor }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RatingInput({ value, onChange, theme, max = 5, labels: customLabels }) {
  const [hover, setHover] = useState(null)
  const labels = customLabels || ['Terrible', 'Poor', 'Average', 'Good', 'Excellent']
  const nums = max === 10
    ? Array.from({ length: 11 }, (_, i) => i)
    : [1, 2, 3, 4, 5]

  return (
    <div>
      <div className="flex gap-2 justify-center flex-wrap">
        {nums.map((n) => (
          <button data-testid="button-elt-140"
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(null)}
            style={{ borderRadius: theme.borderRadius, backgroundColor: (hover ?? value) >= n ? theme.primaryColor : 'rgba(128,128,128,0.1)' }}
            className={`w-12 h-12 font-bold text-lg transition-all text-white`}
          >
            {n}
          </button>
        ))}
      </div>
      {(hover || value !== undefined) && max === 5 && (
        <p className="text-center text-xs text-gray-500 mt-2 font-medium">
          {labels[(hover ?? value) - 1]}
        </p>
      )}
      {max === 10 && (
        <p className="text-center text-xs text-gray-500 mt-2 font-medium">
          {value !== undefined && value !== '' ? `Score: ${value}` : 'Select 0–10'}
        </p>
      )}
    </div>
  )
}

function TextInput({ value, onChange, theme, rows = 3 }) {
  return (
    <textarea
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder="Type your answer here…"
      style={{ borderRadius: theme.borderRadius }}
      className="w-full px-4 py-3 border border-gray-200 text-sm resize-none focus:outline-none bg-transparent"
    />
  )
}

function MaxDiffInput({ question, value = {}, onChange, theme }) {
  const items = question.options ?? []
  const handleSelect = (item, part) => {
    const next = { ...value }
    if (part === 'best') {
      next.best = item
      if (next.worst === item) delete next.worst
    } else {
      next.worst = item
      if (next.best === item) delete next.best
    }
    onChange(next)
  }
  return (
    <div className="border border-gray-200 overflow-hidden" style={{ borderRadius: theme.borderRadius }}>
      <table className="w-full text-sm border-collapse bg-transparent">
        <thead>
          <tr className="bg-gray-500/10 border-b border-gray-200">
            <th className="px-4 py-3 text-left">Item / Attribute</th>
            <th className="px-4 py-3 text-center w-24">👍 Best</th>
            <th className="px-4 py-3 text-center w-24">👎 Worst</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx} className="border-b border-gray-200/50">
              <td className="px-4 py-3 font-semibold">{item}</td>
              <td className="px-4 py-3 text-center">
                <input data-testid="input-elt-141"
                  type="radio"
                  name={`maxdiff-best-${question.id}-${item}`}
                  checked={value.best === item}
                  onChange={() => handleSelect(item, 'best')}
                  style={{ accentColor: theme.primaryColor }}
                  className="w-4 h-4"
                />
              </td>
              <td className="px-4 py-3 text-center">
                <input data-testid="input-elt-142"
                  type="radio"
                  name={`maxdiff-worst-${question.id}-${item}`}
                  checked={value.worst === item}
                  onChange={() => handleSelect(item, 'worst')}
                  style={{ accentColor: '#ef4444' }}
                  className="w-4 h-4"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ConjointInput({ question, value, onChange, theme }) {
  const attrs = question.options ?? []
  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400 font-medium">Compare the profiles below and select your preference:</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          onClick={() => onChange('Profile A')}
          style={{ borderRadius: theme.borderRadius, borderColor: value === 'Profile A' ? theme.primaryColor : '#e2e8f0' }}
          className={`p-4 border-2 cursor-pointer transition-all bg-transparent`}
        >
          <h4 className="font-bold text-sm mb-3 flex items-center justify-between">
            <span>🎁 Profile A</span>
            {value === 'Profile A' && <span className="text-xs" style={{ color: theme.primaryColor }}>✓ Selected</span>}
          </h4>
          <div className="space-y-2 text-xs">
            {attrs.map((at, idx) => (
              <div key={idx} className="flex justify-between py-1.5 border-b border-gray-200/30">
                <span className="text-gray-400 font-medium">{at.attribute}</span>
                <span className="font-semibold">{at.levels?.[0] || 'N/A'}</span>
              </div>
            ))}
          </div>
        </div>

        <div 
          onClick={() => onChange('Profile B')}
          style={{ borderRadius: theme.borderRadius, borderColor: value === 'Profile B' ? theme.primaryColor : '#e2e8f0' }}
          className={`p-4 border-2 cursor-pointer transition-all bg-transparent`}
        >
          <h4 className="font-bold text-sm mb-3 flex items-center justify-between">
            <span>🎁 Profile B</span>
            {value === 'Profile B' && <span className="text-xs" style={{ color: theme.primaryColor }}>✓ Selected</span>}
          </h4>
          <div className="space-y-2 text-xs">
            {attrs.map((at, idx) => (
              <div key={idx} className="flex justify-between py-1.5 border-b border-gray-200/30">
                <span className="text-gray-400 font-medium">{at.attribute}</span>
                <span className="font-semibold">{at.levels?.[1] || at.levels?.[0] || 'N/A'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button data-testid="button-elt-143"
        type="button"
        onClick={() => onChange('Neither')}
        style={{ borderRadius: theme.borderRadius }}
        className={`w-full py-2.5 border-2 border-dashed text-xs font-bold transition-all bg-transparent ${
          value === 'Neither'
            ? 'border-red-400 text-red-500 font-extrabold'
            : 'border-gray-200 text-gray-500 hover:bg-gray-50/5'
        }`}
      >
        I Prefer Neither Option
      </button>
    </div>
  )
}

function KanoInput({ value = {}, onChange, theme }) {
  const options = [
    { key: 'like', label: '😊 I like it' },
    { key: 'must-be', label: '😐 It must be that way' },
    { key: 'neutral', label: '🤷 I am neutral' },
    { key: 'live-with', label: '😏 I can live with it' },
    { key: 'dislike', label: '😒 I dislike it' },
  ]
  return (
    <div className="space-y-4 text-xs">
      <div className="p-4 rounded-xl space-y-2.5 border border-gray-200/50 bg-gray-500/5">
        <p className="font-bold uppercase tracking-wide">
          1. Functional aspect (if feature is present):
        </p>
        <div className="flex flex-col gap-1.5">
          {options.map((opt) => (
            <label
              key={opt.key}
              style={{ borderRadius: theme.borderRadius }}
              className={`flex items-center gap-2.5 px-3 py-2 border font-medium cursor-pointer transition-all ${
                value.functional === opt.key
                  ? 'bg-primary-50/10 font-semibold'
                  : 'bg-transparent hover:bg-gray-50/5'
              }`}
            >
              <input data-testid="input-elt-144"
                type="radio"
                checked={value.functional === opt.key}
                onChange={() => onChange({ ...value, functional: opt.key })}
                style={{ accentColor: theme.primaryColor }}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-xl space-y-2.5 border border-gray-200/50 bg-gray-500/5">
        <p className="font-bold uppercase tracking-wide">
          2. Dysfunctional aspect (if feature is absent):
        </p>
        <div className="flex flex-col gap-1.5">
          {options.map((opt) => (
            <label
              key={opt.key}
              style={{ borderRadius: theme.borderRadius }}
              className={`flex items-center gap-2.5 px-3 py-2 border font-medium cursor-pointer transition-all ${
                value.dysfunctional === opt.key
                  ? 'bg-primary-50/10 font-semibold'
                  : 'bg-transparent hover:bg-gray-50/5'
              }`}
            >
              <input data-testid="input-elt-145"
                type="radio"
                checked={value.dysfunctional === opt.key}
                onChange={() => onChange({ ...value, dysfunctional: opt.key })}
                style={{ accentColor: theme.primaryColor }}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

function PSMInput({ question, value = {}, onChange, theme }) {
  const symbol = Array.isArray(question.options) && question.options[0] ? question.options[0] : '$'
  const handlePrice = (field, val) => {
    onChange({ ...value, [field]: val === '' ? '' : Number(val) })
  }
  const fields = [
    { key: 'tooCheap', label: '1. Too Cheap (Quality is questionable)', desc: 'At what price is it too cheap that you doubt its quality?' },
    { key: 'cheap', label: '2. Cheap / Bargain (Excellent buy)', desc: 'At what price is it a bargain and a great deal?' },
    { key: 'expensive', label: '3. Expensive (Requires thought)', desc: 'At what price is it getting expensive, but you would still buy?' },
    { key: 'tooExpensive', label: '4. Too Expensive (Will not consider)', desc: 'At what price is it too expensive for you to buy?' },
  ]
  return (
    <div className="space-y-4 text-xs">
      {fields.map((f) => (
        <div key={f.key} className="p-4 rounded-xl border border-gray-200 bg-gray-500/5 space-y-1">
          <label className="block font-semibold">{f.label}</label>
          <p className="text-[11px] text-gray-400 mb-2">{f.desc}</p>
          <div className="relative max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 font-bold">
              {symbol}
            </div>
            <input data-testid="input-elt-146"
              type="number"
              placeholder="0.00"
              value={value[f.key] ?? ''}
              onChange={(e) => handlePrice(f.key, e.target.value)}
              className="w-full pl-7 pr-3 py-2 border border-gray-200 text-sm focus:outline-none bg-transparent"
              style={{ borderRadius: theme.borderRadius }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
