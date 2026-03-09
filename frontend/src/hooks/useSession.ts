import { useState, useEffect, useRef } from 'react'
import { sessionsApi, assessmentApi } from '@/services/api'
import type { Session, WoundAssessment } from '@/types'

export function useSession(sessionId: string) {
  const [session, setSession] = useState<Session | null>(null)
  const [assessment, setAssessment] = useState<WoundAssessment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!sessionId) return
    const poll = async () => {
      try {
        const s = await sessionsApi.poll(sessionId)
        setSession(s)
        setLoading(false)
        if (s.status === 'complete') {
          clearInterval(intervalRef.current!)
          const a = await assessmentApi.getBySession(sessionId)
          setAssessment(a)
        } else if (s.status === 'error') {
          clearInterval(intervalRef.current!)
          setError('Analysis failed. Please try again.')
        }
      } catch {
        setError('Failed to fetch session.')
        setLoading(false)
      }
    }
    poll()
    intervalRef.current = setInterval(poll, 3000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [sessionId])

  return { session, assessment, loading, error }
}
