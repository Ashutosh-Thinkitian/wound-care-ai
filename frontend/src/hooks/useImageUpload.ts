import { useState, useEffect, useRef, useCallback } from 'react'
import { captureApi } from '@/services/api'
import axios from 'axios'

export type UploadState = 'idle' | 'preview' | 'uploading' | 'success' | 'error'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function useImageUpload(sessionId: string) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [uploadError, setUploadError] = useState<string | null>(null)
  const previewUrlRef = useRef<string | null>(null)

  // Clean up object URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
      }
    }
  }, [])

  const selectFile = useCallback((file: File) => {
    setUploadError(null)

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file.')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError('File too large. Maximum size is 10MB.')
      return
    }

    // Revoke previous preview URL
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
    }

    const url = URL.createObjectURL(file)
    previewUrlRef.current = url
    setSelectedFile(file)
    setPreviewUrl(url)
    setUploadState('preview')
  }, [])

  const clearFile = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }
    setSelectedFile(null)
    setPreviewUrl(null)
    setUploadError(null)
    setUploadState('idle')
  }, [])

  const uploadImage = useCallback(async () => {
    if (!selectedFile) return

    setUploadState('uploading')
    setUploadError(null)

    try {
      await captureApi.uploadImage(sessionId, selectedFile)
      setUploadState('success')
    } catch (err: unknown) {
      let message = 'Upload failed. Please try again.'
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        message = String(err.response.data.detail)
      }
      setUploadError(message)
      setUploadState('error')
    }
  }, [sessionId, selectedFile])

  return {
    selectedFile,
    previewUrl,
    uploadState,
    uploadError,
    selectFile,
    clearFile,
    uploadImage,
  }
}
