import { useRef, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  Flex,
  Box,
  Text,
  Heading,
  Button,
  Callout,
  Spinner,
} from '@radix-ui/themes'
import {
  CameraIcon,
  UploadIcon,
  ArrowRightIcon,
  CheckCircledIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
  MagicWandIcon,
} from '@radix-ui/react-icons'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import AnalysisProgress from '@/components/common/AnalysisProgress'
import PulsingCard from '@/components/common/PulsingCard'
import { useMobileCapture } from '@/hooks/useMobileCapture'
import { sessionsApi } from '@/services/api'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Animated dots: cycles . → .. → ... every 500ms */
function useAnimatedDots() {
  const [count, setCount] = useState(1)

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => (prev % 3) + 1)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return '.'.repeat(count)
}

/** Poll session status after upload and navigate to assessment when complete */
function usePostUploadPolling(sessionId: string, active: boolean) {
  const navigate = useNavigate()
  const [analysisState, setAnalysisState] = useState<'analyzing' | 'complete' | 'error' | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!active || !sessionId) return

    setAnalysisState('analyzing')

    const poll = async () => {
      try {
        const session = await sessionsApi.poll(sessionId)
        if (session.status === 'complete') {
          setAnalysisState('complete')
          if (intervalRef.current) clearInterval(intervalRef.current)
          // Navigate to assessment report after brief delay
          setTimeout(() => {
            if (session.assessmentId) {
              navigate(`/assessment/${session.assessmentId}`)
            }
          }, 1500)
        } else if (session.status === 'error') {
          setAnalysisState('error')
          setErrorMessage('Analysis failed. Please try again with a new encounter.')
          if (intervalRef.current) clearInterval(intervalRef.current)
        }
      } catch {
        // Keep polling on network errors
      }
    }

    poll()
    intervalRef.current = setInterval(poll, 3000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [active, sessionId, navigate])

  return { analysisState, errorMessage }
}

export default function MobileCapturePage() {
  const { sessionId = '' } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const {
    state,
    selectedFile,
    previewUrl,
    uploadError,
    selectFile,
    clearFile,
    uploadImage,
  } = useMobileCapture(sessionId)

  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const dots = useAnimatedDots()

  // Start polling after successful upload
  const { analysisState, errorMessage } = usePostUploadPolling(sessionId, state === 'success')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) selectFile(file)
    e.target.value = ''
  }

  // STATE 1: Validating
  if (state === 'validating') {
    return <LoadingSpinner label="Verifying session..." />
  }

  // STATE 5: Success — show analysis progress (same as web SessionPage)
  if (state === 'success') {
    return (
      <Flex direction="column" gap="4">
        {/* Wound image stays visible */}
        {previewUrl && (
          <Card size="3">
            <Box style={{ borderRadius: 'var(--radius-3)', overflow: 'hidden' }}>
              <img
                src={previewUrl}
                alt="Wound preview"
                style={{
                  width: '100%',
                  maxHeight: 280,
                  objectFit: 'cover',
                  display: 'block',
                  borderRadius: 'var(--radius-3)',
                }}
              />
            </Box>
          </Card>
        )}

        {/* Analysis complete — navigating to report */}
        {analysisState === 'complete' && (
          <Card size="3">
            <Flex
              direction="column"
              gap="3"
              align="center"
              py="4"
              style={{ animation: 'successFlash 1s ease-out' }}
            >
              <CheckCircledIcon width={40} height={40} color="var(--green-9)" />
              <Heading size="4" align="center">Analysis Complete!</Heading>
              <Text size="2" color="gray" align="center">Loading your assessment report...</Text>
            </Flex>
          </Card>
        )}

        {/* Analysis in progress */}
        {analysisState === 'analyzing' && (
          <PulsingCard active>
            <Flex direction="column" gap="3" align="center" py="3">
              <MagicWandIcon width={32} height={32} color="var(--blue-9)" />
              <Heading size="4" align="center">AI Analysis In Progress</Heading>
              <Text size="2" color="gray" align="center" style={{ maxWidth: 300 }}>
                Gemini is analyzing the wound image. This usually takes 15–30 seconds.
              </Text>
              <Box style={{ width: '100%', maxWidth: 300 }}>
                <AnalysisProgress size="lg" showProgressBar durationSeconds={25} />
              </Box>
            </Flex>
          </PulsingCard>
        )}

        {/* Analysis error */}
        {analysisState === 'error' && (
          <Flex direction="column" gap="3">
            <Callout.Root color="red" size="2">
              <Callout.Icon><ExclamationTriangleIcon /></Callout.Icon>
              <Callout.Text>{errorMessage ?? 'Analysis failed.'}</Callout.Text>
            </Callout.Root>
            <Button variant="soft" onClick={() => navigate('/')}>
              Start New Encounter
            </Button>
          </Flex>
        )}

        {/* Info callout */}
        {analysisState === 'analyzing' && (
          <Callout.Root color="blue" size="1">
            <Callout.Icon><InfoCircledIcon /></Callout.Icon>
            <Callout.Text>Please keep this page open while the AI analyzes the wound.</Callout.Text>
          </Callout.Root>
        )}
      </Flex>
    )
  }

  // STATE 6: Already used
  if (state === 'already_used') {
    return (
      <Flex direction="column" align="center" justify="center" gap="4" py="9">
        <CheckCircledIcon width={48} height={48} color="var(--blue-9)" />
        <Heading size="5" align="center">Image Already Received</Heading>
        <Text color="gray" align="center" size="2" style={{ maxWidth: 320 }}>
          This session already has a wound image submitted. The provider is reviewing the assessment.
        </Text>
      </Flex>
    )
  }

  // STATE 7: Expired
  if (state === 'expired') {
    return (
      <Flex direction="column" align="center" justify="center" gap="4" py="9">
        <ClockIcon width={48} height={48} color="var(--amber-9)" />
        <Heading size="5" align="center">Session Expired</Heading>
        <Text color="gray" align="center" size="2" style={{ maxWidth: 320 }}>
          This QR code has expired. Please ask the healthcare provider to generate a new encounter.
        </Text>
      </Flex>
    )
  }

  // STATE 8: Invalid
  if (state === 'invalid') {
    return (
      <Flex direction="column" align="center" justify="center" gap="4" py="9">
        <ExclamationTriangleIcon width={48} height={48} color="var(--red-9)" />
        <Heading size="5" align="center">Invalid Session</Heading>
        <Text color="gray" align="center" size="2" style={{ maxWidth: 320 }}>
          This session could not be found. Please ask the healthcare provider to generate a new QR code.
        </Text>
      </Flex>
    )
  }

  // Hidden file inputs
  const fileInputs = (
    <>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </>
  )

  // STATE 3 & 4: Preview / Uploading
  if (state === 'preview' || state === 'uploading') {
    const isUploading = state === 'uploading'

    return (
      <>
        {fileInputs}
        <Card size="3">
          <Flex direction="column" gap="4" p="2">
            <Heading size="4" align="center">Review Image</Heading>

            <Box style={{ position: 'relative', borderRadius: 'var(--radius-3)', overflow: 'hidden' }}>
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Wound preview"
                  style={{
                    width: '100%',
                    maxHeight: '60vh',
                    objectFit: 'cover',
                    display: 'block',
                    borderRadius: 'var(--radius-3)',
                    opacity: isUploading ? 0.3 : 1,
                    transition: 'opacity 0.3s ease',
                  }}
                />
              )}
              {isUploading && (
                <Flex align="center" justify="center" style={{ position: 'absolute', inset: 0 }}>
                  <Flex
                    direction="column"
                    align="center"
                    gap="2"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: 'var(--radius-3)',
                      padding: 'var(--space-4) var(--space-5)',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                    }}
                  >
                    <Spinner size="3" />
                    <Text size="2" weight="bold">Uploading image{dots}</Text>
                  </Flex>
                </Flex>
              )}
            </Box>

            <Text size="2" color="gray" align="center">
              Review: is the wound clearly visible and in focus?
            </Text>

            {selectedFile && (
              <Text size="1" color="gray" align="center">
                {selectedFile.name} · {formatFileSize(selectedFile.size)}
              </Text>
            )}

            {uploadError && (
              <Callout.Root color="red" size="1">
                <Callout.Icon><ExclamationTriangleIcon /></Callout.Icon>
                <Callout.Text>{uploadError}</Callout.Text>
              </Callout.Root>
            )}

            {isUploading && (
              <Text size="2" color="gray" align="center">Please keep this page open</Text>
            )}

            <Flex gap="3">
              <Button variant="soft" color="gray" size="3" style={{ flex: 1 }} disabled={isUploading} onClick={clearFile}>
                Retake
              </Button>
              <Button color="blue" size="3" style={{ flex: 1 }} disabled={isUploading} loading={isUploading} onClick={uploadImage}>
                Submit <ArrowRightIcon />
              </Button>
            </Flex>
          </Flex>
        </Card>
      </>
    )
  }

  // STATE 2: Idle (main capture UI)
  return (
    <>
      {fileInputs}
      <Card size="3">
        <Flex direction="column" gap="4" p="2">
          <Heading size="4" align="center">Capture Wound Image</Heading>
          <Text size="2" color="gray" align="center">
            Take a clear, well-lit photo of the wound. Hold the camera 15–30cm away.
          </Text>

          <Flex direction="column" gap="3">
            <Button size="4" onClick={() => cameraInputRef.current?.click()}>
              <CameraIcon /> Take Photo
            </Button>
            <Button size="4" variant="soft" onClick={() => galleryInputRef.current?.click()}>
              <UploadIcon /> Upload from Gallery
            </Button>
          </Flex>

          <Callout.Root color="blue" size="1">
            <Callout.Icon><InfoCircledIcon /></Callout.Icon>
            <Callout.Text>
              Ensure good lighting. Include a ruler or coin for scale if available.
            </Callout.Text>
          </Callout.Root>

          <Flex direction="column" gap="1">
            <Text size="2" color="gray">✓ Clean, focused image</Text>
            <Text size="2" color="gray">✓ Good lighting</Text>
            <Text size="2" color="gray">✓ Wound fully visible</Text>
            <Text size="2" color="gray">✓ Minimal motion blur</Text>
          </Flex>

          {uploadError && (
            <Callout.Root color="red" size="1">
              <Callout.Icon><ExclamationTriangleIcon /></Callout.Icon>
              <Callout.Text>{uploadError}</Callout.Text>
            </Callout.Root>
          )}
        </Flex>
      </Card>
    </>
  )
}
