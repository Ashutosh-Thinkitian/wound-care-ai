import { useState, useEffect } from 'react'
import { assessmentApi } from '@/services/api'
import type { WoundAssessment } from '@/types'

export function useAssessment(assessmentId: string) {
  const [assessment, setAssessment] = useState<WoundAssessment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!assessmentId) {
      setError('No assessment ID provided')
      setLoading(false)
      return
    }

    let cancelled = false

    const fetchAssessment = async () => {
      try {
        const data = await assessmentApi.getById(assessmentId)
        if (!cancelled) {
          setAssessment(data)
          setLoading(false)
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load assessment')
          setLoading(false)
        }
      }
    }

    fetchAssessment()
    return () => {
      cancelled = true
    }
  }, [assessmentId])

  return { assessment, loading, error }
}
