import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { sessionsApi } from '@/services/api'
import type { Session } from '@/types'

export function useSession(sessionId: string) {
  const navigate = useNavigate()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stoppedRef = useRef(false)

  const stopPolling = useCallback(() => {
    stoppedRef.current = true
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!sessionId) return

    stoppedRef.current = false

    const fetchSession = async () => {
      if (stoppedRef.current) return
      try {
        const s = await sessionsApi.poll(sessionId)
        if (stoppedRef.current) return
        setSession(s)
        setLoading(false)

        if (s.status === 'complete') {
          stopPolling()
          // Auto-navigate after 1.5s so user sees the complete state briefly
          timeoutRef.current = setTimeout(() => {
            if (s.assessmentId) {
              navigate(`/assessment/${s.assessmentId}`)
            }
          }, 1500)
        } else if (s.status === 'error') {
          stopPolling()
          setError('Analysis failed. Please try again.')
        }
      } catch (err: unknown) {
        if (stoppedRef.current) return
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          stopPolling()
          setNotFound(true)
          setLoading(false)
        } else {
          setError('Failed to fetch session.')
          setLoading(false)
        }
      }
    }

    // Initial fetch
    fetchSession()
    // Start polling
    intervalRef.current = setInterval(fetchSession, 3000)

    return () => {
      stopPolling()
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [sessionId, navigate, stopPolling])

  return { session, loading, error, notFound }
}
