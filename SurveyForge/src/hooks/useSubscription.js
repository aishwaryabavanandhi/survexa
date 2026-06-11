import { useState, useEffect, useCallback } from 'react'
import { getBillingUsage } from '../services/api'
import { useApp } from '../context/AppContext'

export function useSubscription() {
  const { isAuthenticated } = useApp()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setData(null)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const res = await getBillingUsage()
      setData(res.data ?? null)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    refresh()
  }, [refresh])

  const isAtLimit = (metric) => {
    if (!data?.remaining) return false
    const rem = data.remaining[metric]
    return rem !== null && rem !== undefined && rem <= 0
  }

  return { data, loading, refresh, isAtLimit }
}
