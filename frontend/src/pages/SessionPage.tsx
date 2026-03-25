import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  Flex,
  Text,
  Heading,
  Grid,
  Button,
  Badge,
  Callout,
  Strong,
  Tabs,
} from '@radix-ui/themes'
import {
  InfoCircledIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  UploadIcon,
  CheckCircledIcon,
  MagicWandIcon,
} from '@radix-ui/react-icons'
import PageHeader from '@/components/layout/PageHeader'
import StatusBadge from '@/components/common/StatusBadge'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import EmptyState from '@/components/common/EmptyState'
import QRCodeDisplay from '@/components/qr/QRCodeDisplay'
import SessionTimeline from '@/components/wound/SessionTimeline'
import ProviderUpload from '@/components/wound/ProviderUpload'
import PulsingCard from '@/components/common/PulsingCard'
import AnalysisProgress from '@/components/common/AnalysisProgress'
import { useSession } from '@/hooks/useSession'

function useCountdown(expiresAt: string | undefined) {
  const [remaining, setRemaining] = useState('')
  const [expired, setExpired] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!expiresAt) return

    // Ensure we parse expiresAt as UTC by appending 'Z' if no timezone info present
    const parseUTCDate = (dateStr: string): Date => {
      const normalized = dateStr.endsWith('Z') || dateStr.includes('+')
        ? dateStr
        : dateStr + 'Z'
      return new Date(normalized)
    }

    const tick = () => {
      const diff = parseUTCDate(expiresAt).getTime() - Date.now()
      if (diff <= 0) {
        setRemaining('0m 0s')
        setExpired(true)
        if (intervalRef.current) clearInterval(intervalRef.current)
        return
      }
      const mins = Math.floor(diff / 60000)
      const secs = Math.floor((diff % 60000) / 1000)
      setRemaining(`${mins}m ${secs}s`)
      setExpired(false)
    }

    tick()
    intervalRef.current = setInterval(tick, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [expiresAt])

  return { remaining, expired }
}

const statusTitles: Record<string, string> = {
  pending: 'Waiting...',
  image_received: 'Image Received',
  analyzing: 'Analyzing...',
  complete: 'Complete',
  error: 'Error',
}

export default function SessionPage() {
  const { sessionId = '' } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const { session, loading, error, notFound } = useSession(sessionId)
  const { remaining, expired } = useCountdown(session?.expiresAt)

  // Track when analysis just completed for transition animation
  const [justCompleted, setJustCompleted] = useState(false)
  const prevStatusRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (
      prevStatusRef.current === 'analyzing' &&
      session?.status === 'complete'
    ) {
      setJustCompleted(true)
      const timer = setTimeout(() => {
        if (session.assessmentId) {
          navigate(`/assessment/${session.assessmentId}`)
        }
      }, 1800)
      return () => clearTimeout(timer)
    }
    prevStatusRef.current = session?.status
  }, [session?.status, session?.assessmentId, navigate])

  // Update document title based on status
  useEffect(() => {
    if (session) {
      document.title = `${statusTitles[session.status] ?? 'Session'} | WoundCare AI`
    }
    return () => {
      document.title = 'WoundCare AI'
    }
  }, [session?.status])

  if (loading) {
    return <LoadingSpinner label="Loading session..." />
  }

  if (notFound) {
    return (
      <EmptyState
        icon={<InfoCircledIcon width={24} height={24} />}
        title="Session not found"
        description="This session may have expired or does not exist."
        action={
          <Button variant="soft" onClick={() => navigate('/')}>
            <ArrowLeftIcon />
            Back to Dashboard
          </Button>
        }
      />
    )
  }

  if (!session) {
    return (
      <EmptyState
        icon={<InfoCircledIcon width={24} height={24} />}
        title="Unable to load session"
        description={error ?? 'An unexpected error occurred.'}
        action={
          <Button variant="soft" onClick={() => navigate('/')}>
            <ArrowLeftIcon />
            Back to Dashboard
          </Button>
        }
      />
    )
  }

  const subtitle =
    session.status === 'pending'
      ? 'Waiting for patient image...'
      : session.status === 'image_received'
        ? 'Image received — preparing analysis'
        : session.status === 'analyzing'
          ? 'AI analysis in progress...'
          : session.status === 'complete'
            ? 'Assessment complete'
            : 'Encounter error'

  return (
    <>
      <PageHeader title="Session" subtitle={subtitle} />

      <Grid columns={{ initial: '1', md: '2' }} gap="6">
        {/* LEFT: Tabs for QR Code / Upload */}
        <Card size="3">
          <Tabs.Root defaultValue="qr">
            <Tabs.List>
              <Tabs.Trigger value="qr">QR Code</Tabs.Trigger>
              <Tabs.Trigger value="upload">
                <UploadIcon />
                Upload Directly
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="qr">
              <Flex direction="column" gap="4" p="2" pt="4">
                <Heading size="3">Scan to Capture Wound Image</Heading>

                <QRCodeDisplay
                  qrUrl={session.qrUrl}
                  sessionId={sessionId}
                  status={session.status}
                />

                <Flex direction="column" align="center" gap="2">
                  <StatusBadge status={session.status} />

                  {expired ? (
                    <Badge color="red" size="2">Session Expired</Badge>
                  ) : (
                    <Text size="2" color="gray">
                      Session expires in: {remaining}
                    </Text>
                  )}
                </Flex>

                <Callout.Root color="blue" size="1">
                  <Callout.Icon>
                    <InfoCircledIcon />
                  </Callout.Icon>
                  <Callout.Text>
                    Ask the patient or bedside nurse to scan this QR code with their phone camera
                  </Callout.Text>
                </Callout.Root>
              </Flex>
            </Tabs.Content>

            <Tabs.Content value="upload">
              <Flex direction="column" gap="4" p="2" pt="4">
                <Heading size="3">Upload Wound Image</Heading>
                <Text size="2" color="gray">
                  Upload the wound image directly from this device instead of using the QR code.
                </Text>

                <ProviderUpload sessionId={sessionId} status={session.status} />
              </Flex>
            </Tabs.Content>
          </Tabs.Root>
        </Card>

        {/* RIGHT: Status Timeline */}
        <Card size="3">
          <Flex direction="column" gap="4" p="2">
            <Heading size="3">Encounter Status</Heading>

            {session.patientRef && (
              <Text size="2">
                Patient Ref: <Strong>{session.patientRef}</Strong>
              </Text>
            )}

            {/* AI Analysis In Progress panel */}
            {session.status === 'analyzing' && (
              <PulsingCard active>
                <Flex direction="column" gap="3" align="center" py="2">
                  <MagicWandIcon
                    width={32}
                    height={32}
                    color="var(--blue-9)"
                  />
                  <Heading size="4" align="center">
                    AI Analysis In Progress
                  </Heading>
                  <Text size="2" color="gray" align="center">
                    Gemini is analyzing the wound image. This usually takes
                    15–30 seconds.
                  </Text>
                  <AnalysisProgress
                    size="lg"
                    showProgressBar
                    durationSeconds={25}
                  />
                </Flex>
              </PulsingCard>
            )}

            {/* Completion transition flash */}
            {justCompleted && session.status === 'complete' && (
              <Flex
                direction="column"
                gap="3"
                style={{ animation: 'successFlash 1s ease-out' }}
              >
                <Callout.Root color="green" size="1">
                  <Callout.Icon>
                    <CheckCircledIcon />
                  </Callout.Icon>
                  <Callout.Text>
                    Analysis complete! Loading your report...
                  </Callout.Text>
                </Callout.Root>
              </Flex>
            )}

            <SessionTimeline status={session.status} />

            {session.status === 'complete' && !justCompleted && (
              <Button
                size="3"
                color="green"
                disabled={!session.assessmentId}
                onClick={() => {
                  if (session.assessmentId) {
                    navigate(`/assessment/${session.assessmentId}`)
                  }
                }}
              >
                View Assessment Report
                <ArrowRightIcon />
              </Button>
            )}

            {session.status === 'error' && (
              <Flex direction="column" gap="3">
                <Callout.Root color="red" size="1">
                  <Callout.Icon>
                    <InfoCircledIcon />
                  </Callout.Icon>
                  <Callout.Text>
                    {error ?? 'Analysis failed. Please try again with a new encounter.'}
                  </Callout.Text>
                </Callout.Root>
                <Button variant="soft" onClick={() => navigate('/')}>
                  Start New Encounter
                </Button>
              </Flex>
            )}
          </Flex>
        </Card>
      </Grid>
    </>
  )
}
