/**
 * pages/surveys/SurveyBuilder.jsx
 * Build new surveys OR edit existing ones (/:id).
 * When editing, loads the survey + its questions from the API.
 */
import { useState, useCallback, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import toast from 'react-hot-toast'
import { getSurveyById, saveSurvey, updateSurvey, saveQuestions, publishSurvey, getSurveyRecommendations } from '../../services/api'
import { validateSurvey } from '../../utils/validators'
import Button  from '../../components/ui/Button'
import Input   from '../../components/ui/Input'
import Modal   from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import UpgradeModal from '../../components/billing/UpgradeModal'

const BASE_URL = window.location.origin

const QUESTION_TYPES = [
  { value: 'mcq',       label: '🔘 Multiple Choice' },
  { value: 'text',      label: '✏️ Short Answer' },
  { value: 'long_text', label: '📝 Long Answer' },
  { value: 'rating',    label: '⭐ Rating Scale' },
  { value: 'nps',       label: '📈 NPS (0–10)' },
  { value: 'checkbox',  label: '☑️ Checkbox' },
  { value: 'dropdown',  label: '🔽 Dropdown' },
  { value: 'matrix',    label: '📋 Matrix / Grid' },
  { value: 'date',      label: '📅 Date' },
  { value: 'file',      label: '📎 File Upload' },
  { value: 'maxdiff',   label: '⚖️ MaxDiff (Best/Worst)' },
  { value: 'conjoint',  label: '📊 Conjoint Attribute Profile' },
  { value: 'kano',      label: '🧠 Kano Functional/Dysfunctional' },
  { value: 'psm',       label: '💰 Price Sensitivity (PSM)' },
]

const makeQuestion = () => ({
  id:       `q-${Date.now()}-${Math.random()}`,
  text:     '',
  type:     'mcq',
  required: false,
  options:  ['Option 1', 'Option 2'],
  logic:    [],
})

/** Seed new surveys from /templates (query ?template=slug) */
const TEMPLATE_PRESETS = {
  nps: {
    title: 'NPS · Customer loyalty',
    desc: 'Measure likelihood to recommend and capture follow-up context.',
    questions: [
      { text: 'How likely are you to recommend us to a friend or colleague?', type: 'rating', required: true, options: [] },
      { text: 'What is the primary reason for your score?', type: 'text', required: false, options: [] },
    ],
  },
  csat: {
    title: 'CSAT pulse',
    desc: 'Short satisfaction check after a support or product interaction.',
    questions: [
      { text: 'How satisfied are you with your latest experience?', type: 'rating', required: true, options: [] },
      { text: 'What could we improve?', type: 'text', required: false, options: [] },
    ],
  },
  default: {
    title: 'Untitled survey',
    desc: 'Built from a template — customize every question.',
    questions: [{ text: 'What feedback do you have for us?', type: 'text', required: true, options: [] }],
  },
}

export default function SurveyBuilder() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const templateKey = searchParams.get('template') ?? ''

  const [title,       setTitle]      = useState('')
  const [desc,        setDesc]       = useState('')
  const [theme,       setTheme]      = useState({
    primaryColor: '#B8A4E8', // Dreamy Pastel Lavender Default
    background: 'clean',
    borderRadius: '16px', // Puffy Rounded Default
    fontStyle: 'Quicksand', // Sweet Rounded Default
  })
  const [questions,   setQs]         = useState([makeQuestion()])
  const [saving,      setSaving]     = useState(false)
  const [loading,     setLoading]    = useState(!!id)   // only loading when editing
  const [errors,      setErrors]     = useState({})
  const [previewOpen, setPreviewOpen]= useState(false)
  const [loadError,   setLoadError]  = useState(null)
  const [shareToken,  setShareToken] = useState(null)  // set after save
  const [shareCopied, setShareCopied]= useState(false)
  const [surveyStatus, setSurveyStatus] = useState('draft')
  const [settings, setSettings] = useState({ randomize_questions: false })
  const [autoSaveLabel, setAutoSaveLabel] = useState('')
  const [upgradeModal, setUpgradeModal] = useState({ open: false, message: '', code: '' })

  // AI Recommendations states
  const [recs, setRecs] = useState(null)
  const [loadingRecs, setLoadingRecs] = useState(false)
  const [recsModalOpen, setRecsModalOpen] = useState(false)
  const [recsTab, setRecsTab] = useState('structure') // 'structure' | 'types' | 'improvements'

  const handleFetchRecommendations = async () => {
    if (!title.trim()) {
      toast.error('Please enter a survey title first')
      return
    }
    setLoadingRecs(true)
    setRecsModalOpen(true)
    setRecs(null)
    try {
      const res = await getSurveyRecommendations({ title: title.trim(), description: desc, questions })
      setRecs(res)
    } catch (err) {
      toast.error('Could not fetch recommendations: ' + (err.response?.data?.error ?? err.message))
      setRecsModalOpen(false)
    } finally {
      setLoadingRecs(false)
    }
  }

  // ── Load existing survey when editing ────────────────────────
  useEffect(() => {
    if (!id) return
    setLoading(true)
    getSurveyById(id)
      .then((res) => {
        const survey    = res.data
        const qs        = (survey.questions ?? []).map((q) => ({
          id:       String(q.id),
          text:     q.text    ?? '',
          type:     q.type    ?? 'mcq',
          required: !!q.required,
          options:  q.options ?? [],
          logic:    q.logic   ?? [],
        }))
        setTitle(survey.title ?? '')
        setDesc(survey.description ?? '')
        setQs(qs.length > 0 ? qs : [makeQuestion()])
        if (survey.theme) {
          setTheme(typeof survey.theme === 'string' ? JSON.parse(survey.theme) : survey.theme)
        }
        if (survey.share_token) setShareToken(survey.share_token)
        setSurveyStatus(survey.status || 'draft')
        setSettings(
          typeof survey.settings === 'object'
            ? survey.settings
            : JSON.parse(survey.settings || '{}'),
        )
      })
      .catch((err) => {
        setLoadError('Could not load survey: ' + (err.response?.data?.error ?? err.message))
      })
      .finally(() => setLoading(false))
  }, [id])

  // ── Optional template seed (new survey only) ─────────────────
  useEffect(() => {
    if (id) return
    const key = templateKey.toLowerCase()
    if (!key) return
    const preset = TEMPLATE_PRESETS[key] ?? TEMPLATE_PRESETS.default
    setTitle(preset.title)
    setDesc(preset.desc)
    setQs(
      preset.questions.map((q) => ({
        id: `q-${Date.now()}-${Math.random()}`,
        text: q.text,
        type: q.type,
        required: !!q.required,
        logic: [],
        options:
          q.type === 'mcq' || q.type === 'checkbox' || q.type === 'dropdown'
            ? (q.options?.length ? q.options : ['Option 1', 'Option 2'])
            : [],
      }))
    )
  }, [id, templateKey])

  /* ── Auto-save draft (edit mode) ─────────────── */
  useEffect(() => {
    if (!id || loading) return
    const timer = setTimeout(async () => {
      try {
        await updateSurvey(id, { title, description: desc, theme, settings, status: surveyStatus })
        await saveQuestions({ surveyId: id, questions }).catch(() => {})
        setAutoSaveLabel('Saved ' + new Date().toLocaleTimeString())
      } catch {
        setAutoSaveLabel('Auto-save failed')
      }
    }, 4000)
    return () => clearTimeout(timer)
  }, [id, title, desc, theme, settings, questions, loading, surveyStatus])

  /* ── Drag & drop ──────────────────────────────── */
  const onDragEnd = useCallback((result) => {
    if (!result.destination) return
    const reordered = Array.from(questions)
    const [moved] = reordered.splice(result.source.index, 1)
    reordered.splice(result.destination.index, 0, moved)
    setQs(reordered)
  }, [questions])

  /* ── Question CRUD ────────────────────────────── */
  const addQuestion    = () => setQs((prev) => [...prev, makeQuestion()])
  const removeQuestion = (qid) => setQs((prev) => prev.filter((q) => q.id !== qid))
  const updateQuestion = (qid, patch) =>
    setQs((prev) => prev.map((q) => q.id === qid ? { ...q, ...patch } : q))
  const addOption      = (qid) =>
    setQs((prev) => prev.map((q) => {
      if (q.id !== qid) return q
      const current = q.options ?? []
      return { ...q, options: [...current, `Option ${current.length + 1}`] }
    }))
  const updateOption   = (qid, idx, val) =>
    setQs((prev) => prev.map((q) =>
      q.id === qid ? { ...q, options: q.options.map((o, i) => i === idx ? val : o) } : q
    ))
  const removeOption   = (qid, idx) =>
    setQs((prev) => prev.map((q) =>
      q.id === qid ? { ...q, options: q.options.filter((_, i) => i !== idx) } : q
    ))

  /* ── Save / Update ────────────────────────────── */
  const handleSave = async () => {
    const { isValid, errors: ve } = validateSurvey({ title, questions })
    if (!isValid) {
      console.log('[DEBUG SAVE] Survey validation failed:', JSON.stringify(ve))
      setErrors(ve)
      return
    }

    setSaving(true)
    try {
      let surveyId   = id
      let savedToken = shareToken

      if (id) {
        // Update existing survey meta + bulk-replace its questions
        const res = await updateSurvey(id, { title, description: desc, theme, settings, status: surveyStatus })
        savedToken = res.data?.share_token ?? savedToken
        // Only call saveQuestions on EDIT — create already embeds them inline
        await saveQuestions({ surveyId: id, questions }).catch(() => {})
      } else {
        // Create new survey — questions are embedded in the POST body (no duplicate call)
        const res = await saveSurvey({ title, description: desc, questions, theme, settings, status: 'draft' })
        surveyId   = res.data?.id    ?? res.id
        savedToken = res.data?.share_token ?? savedToken
        setSurveyStatus(res.data?.status || 'draft')
      }

      // Show share link instead of navigating away
      if (savedToken) {
        setShareToken(savedToken)
        toast.success(id ? 'Survey updated' : 'Survey saved')
      } else {
        navigate('/surveys')
      }
    } catch (err) {
      const body = err.response?.data
      console.log('[DEBUG SAVE] Save failed with error:', err.message, body)
      if (body?.upgrade) {
        setUpgradeModal({ open: true, message: body.error, code: body.code })
      } else {
        toast.error('Save failed: ' + (body?.error ?? err.message))
      }
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    const { isValid, errors: ve } = validateSurvey({ title, questions })
    if (!isValid) { setErrors(ve); return }
    setSaving(true)
    try {
      let surveyId = id
      if (!surveyId) {
        const res = await saveSurvey({ title, description: desc, questions, theme, settings, status: 'draft' })
        surveyId = res.data?.id
        setSurveyStatus('draft')
      } else {
        await updateSurvey(surveyId, { title, description: desc, theme, settings, status: 'draft' })
        await saveQuestions({ surveyId, questions })
      }
      const pub = await publishSurvey(surveyId)
      const token = pub.data?.share_token
      setShareToken(token)
      setSurveyStatus('published')
      toast.success('Survey published — share link is live')
    } catch (err) {
      const body = err.response?.data
      if (body?.upgrade) {
        setUpgradeModal({ open: true, message: body.error, code: body.code })
      } else {
        toast.error('Publish failed: ' + (body?.error ?? err.message))
      }
    } finally {
      setSaving(false)
    }
  }

  /* ── Copy share link ─────────────────────────── */
  const handleCopyLink = async () => {
    const url = `${BASE_URL}/survey/${shareToken}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const el = document.createElement('textarea')
      el.value = url; document.body.appendChild(el)
      el.select(); document.execCommand('copy')
      document.body.removeChild(el)
    }
    setShareCopied(true)
    setTimeout(() => setShareCopied(false), 2500)
  }

  /* ── Loading / Error states ───────────────────── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Spinner size="lg" />
        <p className="text-sm text-gray-400">Loading survey…</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="max-w-xl mx-auto mt-10 bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p className="text-3xl mb-2">⚠️</p>
        <p className="font-semibold text-red-700">{loadError}</p>
        <Button className="mt-4" variant="secondary" onClick={() => navigate('/surveys')}>
          ← Back to Surveys
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">
            {id ? 'Edit Survey' : 'Survey Builder'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {id ? `Editing survey #${id}` : 'Build and configure your survey'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {autoSaveLabel && (
            <span className="text-xs text-gray-400 mr-1">{autoSaveLabel}</span>
          )}
          <span className={`text-xs font-bold px-2 py-1 rounded-lg ${surveyStatus === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>
            {surveyStatus === 'published' ? 'Published' : 'Draft'}
          </span>
          <Button variant="secondary" onClick={handleFetchRecommendations}>✨ AI Recommendations</Button>
          <Button variant="secondary" onClick={() => setPreviewOpen(true)}>Preview</Button>
          <Button variant="secondary" onClick={handleSave} loading={saving}>
            Save draft
          </Button>
          <Button onClick={handlePublish} loading={saving}>
            Publish
          </Button>
        </div>
      </div>

      {/* Survey meta */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <Input
          id="survey-title" label="Survey Title *" placeholder="e.g. Customer Satisfaction Survey"
          value={title} onChange={(e) => { setTitle(e.target.value); setErrors({}) }}
          error={errors.title}
        />
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
          <textarea
            value={desc} onChange={(e) => setDesc(e.target.value)} rows={2}
            placeholder="Brief description for respondents…"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm resize-none
                       focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
          />
        </div>
      </div>

      {/* Survey settings */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
        <h3 className="font-bold text-gray-800 text-sm">Survey settings</h3>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={!!settings.randomize_questions}
            onChange={(e) => setSettings((s) => ({ ...s, randomize_questions: e.target.checked }))}
            className="accent-primary-500"
          />
          Randomize question order for respondents
        </label>
      </div>

      {/* Theme Customizer Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
            <span>🎨</span> Visual Theme & Style Designer
          </h3>
          <span className="text-[10px] uppercase tracking-wider bg-primary-100 text-primary-700 px-2.5 py-1 rounded-full font-bold">
            SurveyMars Theme Mode
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-600">Accent Color</label>
            <div className="flex flex-wrap gap-1.5 items-center">
              {[
                { name: 'Lavender', value: '#B8A4E8' },
                { name: 'Turquoise', value: '#7ED4CB' },
                { name: 'Peach', value: '#F0C8A0' },
                { name: 'Rose', value: '#E890C0' },
                { name: 'Mint', value: '#A0E8C8' },
              ].map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setTheme({ ...theme, primaryColor: c.value })}
                  style={{ backgroundColor: c.value }}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    theme.primaryColor === c.value ? 'border-black scale-110' : 'border-transparent'
                  }`}
                  title={c.name}
                />
              ))}
              <input
                type="color"
                value={theme.primaryColor}
                onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                className="w-6 h-6 border-0 p-0 rounded-full cursor-pointer"
                title="Custom color picker"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-600">Background Styling</label>
            <select
              value={theme.background}
              onChange={(e) => setTheme({ ...theme, background: e.target.value })}
              className="w-full border rounded-lg p-1.5 text-xs focus:ring-primary-500 focus:outline-none"
            >
              <option value="clean">Clean Light Gradient</option>
              <option value="dark">Elegant Dark Mode</option>
              <option value="cyberpunk">Cyberpunk Neon</option>
              <option value="forest">Soft Forest Cream</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-600">Border Sharpness</label>
            <select
              value={theme.borderRadius}
              onChange={(e) => setTheme({ ...theme, borderRadius: e.target.value })}
              className="w-full border rounded-lg p-1.5 text-xs focus:ring-primary-500 focus:outline-none"
            >
              <option value="12px">Classic Rounded</option>
              <option value="20px">Soft Curves</option>
              <option value="0px">Sharp Edges</option>
              <option value="999px">Pill Outline</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-600">Typography Font</label>
            <select
              value={theme.fontStyle}
              onChange={(e) => setTheme({ ...theme, fontStyle: e.target.value })}
              className="w-full border rounded-lg p-1.5 text-xs focus:ring-primary-500 focus:outline-none"
            >
              <option value="Quicksand">Quicksand (Sweet Rounded)</option>
              <option value="Fredoka">Fredoka (Adorable Bubbly)</option>
              <option value="Comfortaa">Comfortaa (Cute Geometric)</option>
              <option value="Inter">Inter (Classic Sans)</option>
              <option value="Outfit">Outfit (Clean Geometric)</option>
              <option value="Playfair Display">Playfair (Elegant Serif)</option>
              <option value="Fira Code">Fira Code (Modern Mono)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Share link — shown after save */}
      {shareToken && (
        <div className="bg-primary-50 border border-primary-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🔗</span>
            <p className="font-bold text-primary-700 text-sm">Survey saved! Share this link with respondents</p>
          </div>
          <div className="flex gap-2">
            <input
              readOnly
              value={`${BASE_URL}/survey/${shareToken}`}
              className="flex-1 px-4 py-2.5 bg-white border border-primary-200 rounded-xl text-sm
                         font-mono text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
            <button
              onClick={handleCopyLink}
              className={`px-4 py-2.5 text-sm font-semibold rounded-xl transition-all
                ${shareCopied
                  ? 'bg-green-500 text-white'
                  : 'bg-primary-500 text-white hover:bg-primary-600'}`}
            >
              {shareCopied ? '✅ Copied!' : 'Copy Link'}
            </button>
          </div>
          <p className="mt-2 text-xs text-primary-600">
            Anyone with this link can fill out your survey — no login required.
          </p>
          <div className="mt-3 flex gap-2">
            <a
              href={`${BASE_URL}/survey/${shareToken}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary-700 underline hover:text-primary-900"
            >
              Preview as respondent →
            </a>
            <span className="text-primary-300">·</span>
            <button
              onClick={() => navigate('/surveys')}
              className="text-xs text-primary-700 underline hover:text-primary-900"
            >
              Back to surveys
            </button>
          </div>
        </div>
      )}

      {errors.questions && (
        <p className="text-sm text-red-500 font-medium">{errors.questions}</p>
      )}

      {/* Questions */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="questions">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
              {questions.map((q, idx) => (
                <Draggable key={q.id} draggableId={String(q.id)} index={idx}>
                  {(drag, snapshot) => (
                    <div
                      ref={drag.innerRef}
                      {...drag.draggableProps}
                      className={`bg-white rounded-2xl border shadow-sm p-5 transition-shadow
                        ${snapshot.isDragging ? 'shadow-xl border-primary-300' : 'border-gray-100'}`}
                    >
                      {/* Question header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div {...drag.dragHandleProps}
                          className="cursor-grab text-gray-300 hover:text-gray-500 transition-colors">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 6a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm8-16a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4z"/>
                          </svg>
                        </div>
                        <span className="text-xs font-bold text-primary-500 bg-primary-50 px-2 py-1 rounded-lg">
                          Q{idx + 1}
                        </span>
                        <select
                          value={q.type}
                          onChange={(e) => {
                            const newType = e.target.value
                            let initialOptions = q.options
                            if (newType === 'maxdiff') {
                              initialOptions = ['Feature 1', 'Feature 2', 'Feature 3']
                            } else if (newType === 'conjoint') {
                              initialOptions = [
                                { attribute: 'Price', levels: ['$100', '$250'] },
                                { attribute: 'Design', levels: ['Classic', 'Modern'] },
                              ]
                            } else if (newType === 'psm') {
                              initialOptions = ['$']
                            } else if (newType === 'matrix') {
                              initialOptions = { rows: ['Row 1'], columns: ['Col A', 'Col B'] }
                            } else if (newType === 'nps') {
                              initialOptions = []
                            } else if (newType === 'file') {
                              initialOptions = { maxSizeMB: 5 }
                            } else if (['mcq', 'checkbox', 'dropdown'].includes(newType) && (!Array.isArray(q.options) || typeof q.options[0] === 'object')) {
                              initialOptions = ['Option 1', 'Option 2']
                            }
                            updateQuestion(q.id, { type: newType, options: initialOptions })
                          }}
                          className="ml-auto text-xs border border-gray-200 rounded-lg px-2 py-1.5
                                     focus:outline-none focus:ring-2 focus:ring-primary-400 text-gray-600"
                        >
                          {QUESTION_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                        <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                          <input type="checkbox" checked={q.required}
                            onChange={(e) => updateQuestion(q.id, { required: e.target.checked })}
                            className="accent-primary-500"
                          />
                          Required
                        </label>
                        {questions.length > 1 && (
                          <button onClick={() => removeQuestion(q.id)}
                            className="text-gray-300 hover:text-red-500 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* Question text */}
                      <input
                        value={q.text}
                        onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                        placeholder="Type your question here…"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm mb-3
                                   focus:outline-none focus:ring-2 focus:ring-primary-400"
                      />

                      {/* Options for MCQ / Checkbox / Dropdown */}
                      {['mcq', 'checkbox', 'dropdown'].includes(q.type) && Array.isArray(q.options) && (
                        <div className="space-y-2 pl-1">
                          {q.options.map((opt, oi) => (
                            <div key={oi} className="flex items-center gap-2">
                              <span className="text-gray-300">
                                {q.type === 'checkbox' ? '☐' : q.type === 'dropdown' ? `${oi + 1}.` : '○'}
                              </span>
                              <input
                                value={opt}
                                onChange={(e) => updateOption(q.id, oi, e.target.value)}
                                className="flex-1 text-sm border-b border-gray-200 px-1 py-1
                                           focus:outline-none focus:border-primary-400 bg-transparent"
                              />
                              {q.options.length > 1 && (
                                <button onClick={() => removeOption(q.id, oi)}
                                  className="text-gray-300 hover:text-red-400 text-xs">✕</button>
                              )}
                            </div>
                          ))}
                          <button onClick={() => addOption(q.id)}
                            className="text-xs text-primary-500 hover:text-primary-700 font-medium mt-1">
                            ＋ Add option
                          </button>
                        </div>
                      )}

                      {/* Rating preview */}
                      {q.type === 'rating' && (
                        <div className="flex gap-2 pl-1">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <div key={n}
                              className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center
                                         text-sm font-semibold text-gray-400">
                              {n}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Text preview */}
                      {(q.type === 'text' || q.type === 'long_text') && (
                        <div className="border border-dashed border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-400">
                          {q.type === 'long_text' ? 'Long answer (paragraph)…' : 'Short answer…'}
                        </div>
                      )}

                      {q.type === 'nps' && (
                        <div className="flex flex-wrap gap-1 pl-1">
                          {Array.from({ length: 11 }, (_, i) => (
                            <div key={i} className="w-8 h-8 rounded-lg border border-gray-200 text-xs flex items-center justify-center text-gray-400">{i}</div>
                          ))}
                        </div>
                      )}

                      {q.type === 'date' && (
                        <div className="border border-dashed border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-400">
                          Date picker for respondents
                        </div>
                      )}

                      {q.type === 'file' && (
                        <div className="border border-dashed border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-400">
                          File upload (max {q.options?.maxSizeMB ?? 5} MB)
                        </div>
                      )}

                      {q.type === 'matrix' && q.options?.rows && (
                        <div className="space-y-2 pl-1 text-xs">
                          <p className="font-semibold text-gray-500">Matrix rows & columns</p>
                          {(q.options.rows || []).map((row, ri) => (
                            <div key={ri} className="flex gap-2">
                              <input
                                value={row}
                                onChange={(e) => {
                                  const rows = [...q.options.rows]
                                  rows[ri] = e.target.value
                                  updateQuestion(q.id, { options: { ...q.options, rows } })
                                }}
                                className="flex-1 border-b border-gray-200 py-1"
                                placeholder={`Row ${ri + 1}`}
                              />
                            </div>
                          ))}
                          <button type="button" onClick={() => updateQuestion(q.id, { options: { ...q.options, rows: [...(q.options.rows || []), `Row ${(q.options.rows?.length || 0) + 1}`] } })} className="text-primary-500">＋ Row</button>
                          {(q.options.columns || []).map((col, ci) => (
                            <input
                              key={ci}
                              value={col}
                              onChange={(e) => {
                                const columns = [...q.options.columns]
                                columns[ci] = e.target.value
                                updateQuestion(q.id, { options: { ...q.options, columns } })
                              }}
                              className="w-full border-b border-gray-200 py-1"
                              placeholder={`Column ${ci + 1}`}
                            />
                          ))}
                          <button type="button" onClick={() => updateQuestion(q.id, { options: { ...q.options, columns: [...(q.options.columns || []), `Col ${(q.options.columns?.length || 0) + 1}`] } })} className="text-primary-500">＋ Column</button>
                        </div>
                      )}

                      {/* MaxDiff Item Builder */}
                      {q.type === 'maxdiff' && Array.isArray(q.options) && (
                        <div className="space-y-2 pl-1">
                          <p className="text-xs font-semibold text-gray-500 mb-1">MaxDiff Item List (attributes to scale):</p>
                          {q.options.map((opt, oi) => (
                            <div key={oi} className="flex items-center gap-2">
                              <span className="text-gray-300">⚖️</span>
                              <input
                                value={opt}
                                onChange={(e) => updateOption(q.id, oi, e.target.value)}
                                className="flex-1 text-sm border-b border-gray-200 px-1 py-1 focus:outline-none focus:border-primary-400 bg-transparent"
                                placeholder={`Attribute ${oi + 1}`}
                              />
                              {q.options.length > 2 && (
                                <button onClick={() => removeOption(q.id, oi)} className="text-gray-300 hover:text-red-400 text-xs">✕</button>
                              )}
                            </div>
                          ))}
                          <button onClick={() => addOption(q.id)} className="text-xs text-primary-500 hover:text-primary-700 font-medium mt-1">
                            ＋ Add Item
                          </button>
                        </div>
                      )}

                      {/* Conjoint Attributes Builder */}
                      {q.type === 'conjoint' && (
                        <div className="space-y-3 pl-1 border-l-2 border-primary-200 ml-1 py-1">
                          <p className="text-xs font-semibold text-gray-500">Conjoint Profile Attributes & Levels:</p>
                          {(Array.isArray(q.options) ? q.options : []).map((attr, ai) => (
                            <div key={ai} className="bg-gray-50 p-3 rounded-xl space-y-2 border border-gray-100">
                              <div className="flex items-center gap-2">
                                <input
                                  value={attr.attribute ?? ''}
                                  onChange={(e) => {
                                    const nextOpts = [...q.options]
                                    nextOpts[ai] = { ...nextOpts[ai], attribute: e.target.value }
                                    updateQuestion(q.id, { options: nextOpts })
                                  }}
                                  placeholder="Attribute name (e.g. Price, Color)"
                                  className="flex-1 text-sm font-semibold border-b border-gray-300 px-1 focus:outline-none bg-transparent"
                                />
                                <button
                                  onClick={() => {
                                    const nextOpts = q.options.filter((_, i) => i !== ai)
                                    updateQuestion(q.id, { options: nextOpts })
                                  }}
                                  className="text-red-400 hover:text-red-600 text-xs"
                                >
                                  Remove Attribute
                                </button>
                              </div>
                              <div className="space-y-1.5 pl-2">
                                {(attr.levels ?? []).map((lvl, li) => (
                                  <div key={li} className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400">•</span>
                                    <input
                                      value={lvl}
                                      onChange={(e) => {
                                        const nextLevels = [...attr.levels]
                                        nextLevels[li] = e.target.value
                                        const nextOpts = [...q.options]
                                        nextOpts[ai] = { ...nextOpts[ai], levels: nextLevels }
                                        updateQuestion(q.id, { options: nextOpts })
                                      }}
                                      className="flex-1 text-xs border-b border-gray-200 px-1 focus:outline-none bg-transparent"
                                      placeholder={`Level ${li + 1}`}
                                    />
                                    {attr.levels.length > 1 && (
                                      <button
                                        onClick={() => {
                                          const nextLevels = attr.levels.filter((_, i) => i !== li)
                                          const nextOpts = [...q.options]
                                          nextOpts[ai] = { ...nextOpts[ai], levels: nextLevels }
                                          updateQuestion(q.id, { options: nextOpts })
                                        }}
                                        className="text-gray-300 hover:text-red-400 text-xs"
                                      >
                                        ✕
                                      </button>
                                    )}
                                  </div>
                                ))}
                                <button
                                  onClick={() => {
                                    const nextLevels = [...(attr.levels ?? []), `New Level ${(attr.levels?.length ?? 0) + 1}`]
                                    const nextOpts = [...q.options]
                                    nextOpts[ai] = { ...nextOpts[ai], levels: nextLevels }
                                    updateQuestion(q.id, { options: nextOpts })
                                  }}
                                  className="text-xs text-primary-500 hover:text-primary-600 font-medium"
                                >
                                  ＋ Add Level
                                </button>
                              </div>
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              const nextOpts = [...(q.options ?? []), { attribute: `Attribute ${(q.options?.length ?? 0) + 1}`, levels: ['Level 1', 'Level 2'] }]
                              updateQuestion(q.id, { options: nextOpts })
                            }}
                            className="text-xs text-primary-500 hover:text-primary-700 font-medium"
                          >
                            ＋ Add Attribute
                          </button>
                        </div>
                      )}

                      {/* Kano preview message */}
                      {q.type === 'kano' && (
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs space-y-2 text-gray-500 leading-relaxed">
                          <p className="font-semibold text-gray-700">🧠 Kano Model Setup</p>
                          <p>This automatically configures a standard dual-part question:</p>
                          <ul className="list-disc pl-4 space-y-1">
                            <li><strong>Functional:</strong> How would you feel if present?</li>
                            <li><strong>Dysfunctional:</strong> How would you feel if absent?</li>
                          </ul>
                          <p>Standard response options are generated automatically for respondents.</p>
                        </div>
                      )}

                      {/* PSM setup */}
                      {q.type === 'psm' && (
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs space-y-2 text-gray-500">
                          <p className="font-semibold text-gray-700">💰 Van Westendorp Price Sensitivity Meter</p>
                          <p>Respondents will supply four distinct price thresholds:</p>
                          <ul className="list-disc pl-4 space-y-1">
                            <li>At what price is it <strong>Too Cheap</strong>?</li>
                            <li>At what price is it <strong>Cheap / Bargain</strong>?</li>
                            <li>At what price is it <strong>Expensive</strong>?</li>
                            <li>At what price is it <strong>Too Expensive</strong>?</li>
                          </ul>
                          <div className="pt-2 flex items-center gap-2">
                            <span>Currency Symbol:</span>
                            <input
                              value={Array.isArray(q.options) && q.options[0] ? q.options[0] : '$'}
                              onChange={(e) => updateQuestion(q.id, { options: [e.target.value] })}
                              className="w-10 text-center border border-gray-200 rounded p-1 focus:outline-none"
                            />
                          </div>
                        </div>
                      )}

                      {/* Skip Logic Branching Drawer */}
                      <div className="mt-3 pt-3 border-t border-dashed border-gray-100">
                        <details className="group">
                          <summary className="text-xs font-semibold text-primary-500 cursor-pointer select-none hover:text-primary-700">
                            ⚡ Skip Logic Branching ({q.logic?.length ?? 0} rules)
                          </summary>
                          <div className="mt-2 space-y-2 pl-2">
                            {(q.logic ?? []).map((rule, ri) => (
                              <div key={ri} className="flex items-center gap-2 flex-wrap text-xs bg-gray-50 p-2 rounded-lg">
                                <span>IF answer is</span>
                                <select
                                  value={rule.condition || ''}
                                  onChange={(e) => {
                                    const nextLogic = [...q.logic]
                                    nextLogic[ri] = { ...nextLogic[ri], condition: e.target.value }
                                    updateQuestion(q.id, { logic: nextLogic })
                                  }}
                                  className="border rounded p-1"
                                >
                                  <option value="">Select option…</option>
                                  {['mcq', 'dropdown', 'checkbox'].includes(q.type) && Array.isArray(q.options) && q.options.map((o) => (
                                    <option key={o} value={o}>{o}</option>
                                  ))}
                                  {!['mcq', 'dropdown', 'checkbox'].includes(q.type) && (
                                    <option value="any">Any Answer</option>
                                  )}
                                </select>
                                <span>THEN skip to</span>
                                <select
                                  value={rule.target || ''}
                                  onChange={(e) => {
                                    const nextLogic = [...q.logic]
                                    nextLogic[ri] = { ...nextLogic[ri], target: e.target.value }
                                    updateQuestion(q.id, { logic: nextLogic })
                                  }}
                                  className="border rounded p-1"
                                >
                                  <option value="">Select target question…</option>
                                  <option value="submit">🏁 Submit / Thank You Screen</option>
                                  {questions
                                    .filter((_, uidx) => uidx > idx)
                                    .map((uq, uqidx) => (
                                      <option key={uq.id} value={uq.id}>Q{idx + uqidx + 2}: {uq.text.slice(0, 30) || 'Untitled'}…</option>
                                    ))
                                  }
                                </select>
                                <button
                                  onClick={() => {
                                    const nextLogic = q.logic.filter((_, i) => i !== ri)
                                    updateQuestion(q.id, { logic: nextLogic })
                                  }}
                                  className="text-red-400 hover:text-red-600 font-bold ml-auto"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => {
                                const nextLogic = [...(q.logic ?? []), { condition: '', target: '' }]
                                updateQuestion(q.id, { logic: nextLogic })
                              }}
                              className="text-[11px] text-primary-500 hover:underline"
                            >
                              ＋ Add Branch Rule
                            </button>
                          </div>
                        </details>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Add question */}
      <button onClick={addQuestion}
        className="w-full py-3 border-2 border-dashed border-primary-200 rounded-2xl text-primary-500
                   text-sm font-semibold hover:border-primary-400 hover:bg-primary-50 transition-all">
        ＋ Add Question
      </button>

      {/* Preview modal */}
      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)}
        title={title || 'Survey Preview'} size="lg">
        <div className="space-y-6 max-h-96 overflow-y-auto pr-1">
          {questions.map((q, i) => (
            <div key={q.id}>
              <p className="font-semibold text-gray-800 text-sm mb-2">
                {i + 1}. {q.text || <span className="text-gray-400 italic">Untitled question</span>}
                {q.required && <span className="text-red-500 ml-1">*</span>}
              </p>
              {q.type === 'text' && (
                <input disabled placeholder="Short answer…"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm bg-gray-50" />
              )}
              {['mcq', 'checkbox', 'dropdown'].includes(q.type) && (
                <div className="space-y-1.5">
                  {Array.isArray(q.options) && q.options.map((o, oi) => (
                    <label key={oi} className="flex items-center gap-2 text-sm text-gray-700">
                      <input type={q.type === 'mcq' ? 'radio' : 'checkbox'} name={`prev-${q.id}`}
                        className="accent-primary-500" /> {o}
                    </label>
                  ))}
                </div>
              )}
              {q.type === 'rating' && (
                <div className="flex gap-2">
                  {[1,2,3,4,5].map((n) => (
                    <button key={n} className="w-10 h-10 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-500 hover:border-primary-400 hover:text-primary-500 transition-colors">
                      {n}
                    </button>
                  ))}
                </div>
              )}
              {q.type === 'maxdiff' && (
                <div className="border border-gray-200 rounded-xl p-3 bg-gray-50 space-y-2">
                  <p className="text-xs text-gray-500 font-semibold mb-1">Respondents will select one Best and one Worst option:</p>
                  {Array.isArray(q.options) && q.options.map((o, oi) => (
                    <div key={oi} className="flex justify-between text-xs items-center max-w-sm">
                      <span>{o}</span>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-1"><input type="radio" disabled /> Best</label>
                        <label className="flex items-center gap-1"><input type="radio" disabled /> Worst</label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {q.type === 'conjoint' && (
                <div className="border border-gray-200 rounded-xl p-3 bg-gray-50 text-xs space-y-2">
                  <p className="text-xs text-gray-500 font-semibold mb-1">Conjoint Profiles Comparison:</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border p-2 rounded bg-white">
                      <p className="font-bold">Profile A</p>
                      {Array.isArray(q.options) && q.options.map((attr, ai) => (
                        <div key={ai} className="flex justify-between border-b py-0.5">
                          <span className="text-gray-400">{attr.attribute}:</span>
                          <span>{attr.levels?.[0]}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border p-2 rounded bg-white">
                      <p className="font-bold">Profile B</p>
                      {Array.isArray(q.options) && q.options.map((attr, ai) => (
                        <div key={ai} className="flex justify-between border-b py-0.5">
                          <span className="text-gray-400">{attr.attribute}:</span>
                          <span>{attr.levels?.[1] || attr.levels?.[0]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 justify-center mt-2">
                    <button className="border px-2 py-1 rounded bg-white font-medium" disabled>Select Profile A</button>
                    <button className="border px-2 py-1 rounded bg-white font-medium" disabled>Select Profile B</button>
                    <button className="border px-2 py-1 rounded bg-white font-medium text-gray-400" disabled>Neither</button>
                  </div>
                </div>
              )}
              {q.type === 'kano' && (
                <div className="border border-gray-200 rounded-xl p-3 bg-gray-50 text-xs space-y-2">
                  <div className="border-b pb-2">
                    <p className="font-medium text-gray-600">1. Functional: How would you feel if present?</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {['Like', 'Must-be', 'Neutral', 'Live-with', 'Dislike'].map((lbl) => (
                        <label key={lbl} className="flex items-center gap-1 border px-2 py-1 rounded bg-white"><input type="radio" disabled /> {lbl}</label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">2. Dysfunctional: How would you feel if absent?</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {['Like', 'Must-be', 'Neutral', 'Live-with', 'Dislike'].map((lbl) => (
                        <label key={lbl} className="flex items-center gap-1 border px-2 py-1 rounded bg-white"><input type="radio" disabled /> {lbl}</label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {q.type === 'psm' && (
                <div className="border border-gray-200 rounded-xl p-3 bg-gray-50 text-xs space-y-2">
                  {['Too Cheap', 'Cheap/Bargain', 'Expensive', 'Too Expensive'].map((lbl) => (
                    <div key={lbl} className="flex justify-between items-center max-w-xs">
                      <span className="font-medium">{lbl}:</span>
                      <div className="flex items-center gap-1">
                        <span>{Array.isArray(q.options) && q.options[0] ? q.options[0] : '$'}</span>
                        <input type="number" disabled className="w-20 border rounded p-1" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={() => setPreviewOpen(false)} variant="secondary">Close Preview</Button>
        </div>
      </Modal>

      {shareToken && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-semibold text-gray-700 mb-3">Share QR Code</p>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`${BASE_URL}/survey/${shareToken}`)}`}
            alt="Survey share QR code"
            className="w-40 h-40 rounded-xl border border-gray-100"
          />
        </div>
      )}

      {/* AI Recommendations Modal */}
      <Modal
        open={recsModalOpen}
        onClose={() => setRecsModalOpen(false)}
        title="✨ AI Survey Recommendations"
      >
        {loadingRecs ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Spinner size="lg" />
            <p className="text-sm text-gray-500 font-medium">Auditing survey structure and question types...</p>
          </div>
        ) : recs ? (
          <div className="space-y-5">
            {/* Status badge */}
            <div className="flex items-center justify-between border-b pb-3 border-gray-100 dark:border-[#1e1e2e]">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Audit Report</span>
              <span className="badge bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 font-bold flex items-center gap-1 text-[10px]">
                ● GPT-4o-mini
              </span>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-100 dark:border-[#1e1e2e] pb-1">
              {[
                { id: 'structure', label: 'Structure Flow' },
                { id: 'types', label: 'Question Types' },
                { id: 'improvements', label: 'General Tips' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setRecsTab(tab.id)}
                  className={`pb-2 px-3 text-xs font-bold border-b-2 transition-all ${
                    recsTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              {recsTab === 'structure' && (
                <div className="space-y-3">
                  {recs.structureRecommendations?.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">No structure recommendations found.</p>
                  ) : (
                    recs.structureRecommendations.map((sr, idx) => (
                      <div key={idx} className="p-3 bg-primary-50 dark:bg-primary-500/5 rounded-xl border border-primary-100/50">
                        <h4 className="text-xs font-bold text-primary-700 dark:text-primary-400 mb-1">{sr.title}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{sr.body}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {recsTab === 'types' && (
                <div className="space-y-3">
                  {recs.questionTypeRecommendations?.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">All question types are optimized correctly!</p>
                  ) : (
                    recs.questionTypeRecommendations.map((qtr, idx) => (
                      <div key={idx} className="p-3 bg-sky-50 dark:bg-sky-500/5 rounded-xl border border-sky-100/50 space-y-1">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="text-[10px] font-bold bg-sky-100 text-sky-700 px-2 py-0.5 rounded-md">
                            Question {qtr.questionIndex ?? 'General'}
                          </span>
                          <span className="text-[10px] font-semibold text-gray-400">
                            Recommended: <strong className="text-primary-600 dark:text-primary-400 uppercase">{qtr.recommendedType}</strong>
                          </span>
                        </div>
                        <p className="text-xs italic text-gray-500 line-clamp-1 font-medium">"{qtr.currentText}"</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                          <strong>Reason:</strong> {qtr.reason}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {recsTab === 'improvements' && (
                <ul className="space-y-2 pl-4 list-disc text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  {recs.improvements?.length === 0 ? (
                    <li className="list-none text-gray-500 italic">No general improvements suggested.</li>
                  ) : (
                    recs.improvements.map((imp, idx) => (
                      <li key={idx} className="marker:text-primary-500">{imp}</li>
                    ))
                  )}
                </ul>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={() => setRecsModalOpen(false)}>Close Audit</Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-gray-400">No recommendations available.</div>
        )}
      </Modal>

      <UpgradeModal
        open={upgradeModal.open}
        message={upgradeModal.message}
        code={upgradeModal.code}
        onClose={() => setUpgradeModal({ open: false, message: '', code: '' })}
      />
    </div>
  )
}
