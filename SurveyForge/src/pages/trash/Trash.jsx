import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getTrashSurveys, restoreSurvey, deleteSurvey } from '../../services/api'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'

export default function Trash() {
  const [surveys, setSurveys] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getTrashSurveys()
      setSurveys(res.data ?? [])
    } catch {
      toast.error('Could not load trash')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleRestore = async (id) => {
    setBusy(id)
    try {
      await restoreSurvey(id)
      setSurveys((prev) => prev.filter((s) => s.id !== id))
      toast.success('Survey restored')
    } catch {
      toast.error('Restore failed')
    } finally {
      setBusy(null)
    }
  }

  const handlePermanentDelete = async (id) => {
    if (!window.confirm('Permanently delete this survey? This cannot be undone.')) return
    setBusy(id)
    try {
      await deleteSurvey(id, true)
      setSurveys((prev) => prev.filter((s) => s.id !== id))
      toast.success('Survey permanently deleted')
    } catch {
      toast.error('Delete failed')
    } finally {
      setBusy(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Trash</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Restore surveys or delete them permanently.
          </p>
        </div>
        <Link to="/surveys">
          <Button variant="secondary" size="sm">Back to surveys</Button>
        </Link>
      </div>

      {surveys.length === 0 ? (
        <div className="card p-12 text-center border border-dashed border-gray-200 dark:border-[#2a2a3a]">
          <p className="text-4xl mb-3">🗑️</p>
          <p className="font-medium text-gray-700 dark:text-gray-200">Trash is empty</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {surveys.map((s) => (
            <li key={s.id} className="card p-4 flex flex-wrap items-center justify-between gap-3 dark:bg-[#16161f]">
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{s.title}</p>
                <p className="text-xs text-gray-400">Deleted {s.deleted_at ? new Date(s.deleted_at).toLocaleString() : ''}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleRestore(s.id)} disabled={busy === s.id}>
                  Restore
                </Button>
                <Button size="sm" variant="secondary" onClick={() => handlePermanentDelete(s.id)} disabled={busy === s.id}>
                  Delete forever
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
