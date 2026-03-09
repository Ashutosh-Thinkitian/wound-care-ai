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
} from '@radix-ui/themes'
import {
  InfoCircledIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
} from '@radix-ui/react-icons'
import PageHeader from '@/components/layout/PageHeader'
import StatusBadge from '@/components/common/StatusBadge'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import EmptyState from '@/components/common/EmptyState'
import QRCodeDisplay from '@/components/qr/QRCodeDisplay'
import SessionTimeline from '@/components/wound/SessionTimeline'
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
        {/* LEFT: QR Code Panel */}
        <Card size="3">
          <Flex direction="column" gap="4" p="2">
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

            <SessionTimeline status={session.status} />

            {session.status === 'complete' && (
              <Button
                size="3"
                color="green"
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
