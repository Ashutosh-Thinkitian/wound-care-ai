import { useState, useEffect, useCallback } from 'react'
import { sessionsApi } from '@/services/api'
import type { Session } from '@/types'

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSessions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await sessionsApi.list()
      setSessions(data)
    } catch {
      setError('Failed to load sessions.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  return { sessions, loading, error, refetch: fetchSessions }
}
