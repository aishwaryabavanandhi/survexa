/**
 * /c/:trackingToken — tracked campaign link entry point
 */
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { resolveCampaignLink } from '../../services/api'

export default function CampaignRedirect() {
  const { trackingToken } = useParams()
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!trackingToken) return
    resolveCampaignLink(trackingToken)
      .then((res) => {
        const { share_token, survey_url } = res.data ?? {}
        if (survey_url) {
          window.location.replace(survey_url)
          return
        }
        if (share_token) {
          navigate(`/survey/${share_token}?c=${encodeURIComponent(trackingToken)}`, { replace: true })
        } else {
          setError('Invalid campaign link')
        }
      })
      .catch(() => setError('This campaign link is invalid or has expired.'))
  }, [trackingToken, navigate])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-primary-50 to-white">
        <div className="bg-white rounded-2xl shadow-sm border p-8 max-w-md text-center">
          <p className="text-4xl mb-3">🔗</p>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Link unavailable</h1>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary-300 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-500">Redirecting to survey…</p>
      </div>
    </div>
  )
}
