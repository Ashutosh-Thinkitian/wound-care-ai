import { useState, useEffect } from 'react'
import { sessionsApi } from '@/services/api'
import { useImageUpload } from '@/hooks/useImageUpload'
import type { UploadState } from '@/hooks/useImageUpload'
import axios from 'axios'

export type CaptureState =
  | 'validating'
  | 'idle'
  | 'preview'
  | 'uploading'
  | 'success'
  | 'already_used'
  | 'expired'
  | 'invalid'

/** Parse UTC date string — appends 'Z' if no timezone info present */
function parseUTCDate(dateStr: string): Date {
  if (!dateStr) return new Date()
  const normalized =
    dateStr.endsWith('Z') || dateStr.includes('+') ? dateStr : dateStr + 'Z'
  return new Date(normalized)
}

export function useMobileCapture(sessionId: string) {
  const [sessionState, setSessionState] = useState<'validating' | 'already_used' | 'expired' | 'invalid' | 'ready'>('validating')

  const {
    selectedFile,
    previewUrl,
    uploadState,
    uploadError,
    selectFile,
    clearFile,
    uploadImage: doUpload,
  } = useImageUpload(sessionId)

  // Validate session on mount
  useEffect(() => {
    if (!sessionId) {
      setSessionState('invalid')
      return
    }

    let cancelled = false

    const validate = async () => {
      try {
        const session = await sessionsApi.poll(sessionId)
        if (cancelled) return

        // Check expiry
        const expiresAt = parseUTCDate(session.expiresAt)
        if (expiresAt.getTime() <= Date.now()) {
          setSessionState('expired')
          return
        }

        // Check status
        if (session.status === 'pending') {
          setSessionState('ready')
        } else {
          setSessionState('already_used')
        }
      } catch (err: unknown) {
        if (cancelled) return
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setSessionState('invalid')
        } else {
          setSessionState('invalid')
        }
      }
    }

    validate()
    return () => {
      cancelled = true
    }
  }, [sessionId])

  // Map upload state back to preview on error (mobile shows error inline in preview)
  const uploadImage = async () => {
    await doUpload()
  }

  // Derive combined state
  const deriveState = (): CaptureState => {
    // Session-level states take priority
    if (sessionState === 'validating') return 'validating'
    if (sessionState === 'already_used') return 'already_used'
    if (sessionState === 'expired') return 'expired'
    if (sessionState === 'invalid') return 'invalid'

    // Map upload states
    const uploadStateMap: Record<UploadState, CaptureState> = {
      idle: 'idle',
      preview: 'preview',
      uploading: 'uploading',
      success: 'success',
      error: 'preview', // On error, stay on preview with error message shown
    }
    return uploadStateMap[uploadState]
  }

  return {
    state: deriveState(),
    selectedFile,
    previewUrl,
    uploadError,
    selectFile,
    clearFile,
    uploadImage,
  }
}
