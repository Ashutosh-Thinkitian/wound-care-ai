import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { sessionsApi } from '@/services/api'

export function useCreateSession() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createSession = async (patientRef?: string) => {
    setLoading(true)
    setError(null)
    try {
      const session = await sessionsApi.create(patientRef)
      navigate(`/session/${session.id}`)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to create session. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return { createSession, loading, error }
}
