import { useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  Flex,
  Grid,
  Text,
  Badge,
  Button,
  Table,
} from '@radix-ui/themes'
import {
  ArrowRightIcon,
  ClipboardIcon,
  PlusIcon,
} from '@radix-ui/react-icons'
import PageHeader from '@/components/layout/PageHeader'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import EmptyState from '@/components/common/EmptyState'
import StatusBadge from '@/components/common/StatusBadge'
import { useSessions } from '@/hooks/useSessions'
import { formatDate, isExpired } from '@/utils/formatDate'
import type { Session } from '@/types'

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <Card variant="surface">
      <Flex direction="column" align="center" gap="1" py="2">
        <Text size="6" weight="bold" style={color ? { color } : undefined}>
          {value}
        </Text>
        <Text size="2" color="gray">{label}</Text>
      </Flex>
    </Card>
  )
}

function ActionButton({ session, navigate }: { session: Session; navigate: ReturnType<typeof useNavigate> }) {
  if (session.status === 'complete' && session.assessmentId) {
    return (
      <Button size="1" onClick={() => navigate(`/assessment/${session.assessmentId}`)}>
        View Report <ArrowRightIcon />
      </Button>
    )
  }
  if (session.status === 'analyzing' || session.status === 'image_received') {
    return (
      <Button size="1" variant="soft" onClick={() => navigate(`/session/${session.id}`)}>
        View Session <ArrowRightIcon />
      </Button>
    )
  }
  if (session.status === 'pending') {
    return (
      <Button size="1" variant="soft" onClick={() => navigate(`/session/${session.id}`)}>
        Open QR <ArrowRightIcon />
      </Button>
    )
  }
  if (session.status === 'error') {
    return <Badge color="red">Failed</Badge>
  }
  return null
}

export default function SessionsPage() {
  const navigate = useNavigate()
  const { sessions, loading, error } = useSessions()

  if (loading) {
    return <LoadingSpinner label="Loading sessions..." />
  }

  if (error) {
    return (
      <EmptyState
        icon={<ClipboardIcon width={24} height={24} />}
        title="Failed to load sessions"
        description={error}
        action={
          <Button variant="soft" onClick={() => navigate('/')}>
            Back to Dashboard
          </Button>
        }
      />
    )
  }

  if (sessions.length === 0) {
    return (
      <>
        <PageHeader
          title="Sessions"
          subtitle="All wound assessment encounters"
          action={
            <Button onClick={() => navigate('/')}>
              <PlusIcon /> New Encounter
            </Button>
          }
        />
        <EmptyState
          icon={<ClipboardIcon width={24} height={24} />}
          title="No sessions yet"
          description="Start your first encounter from the Dashboard"
          action={
            <Button variant="soft" onClick={() => navigate('/')}>
              Go to Dashboard
            </Button>
          }
        />
      </>
    )
  }

  const completedCount = sessions.filter(s => s.status === 'complete').length
  const inProgressCount = sessions.filter(s =>
    s.status === 'pending' || s.status === 'image_received' || s.status === 'analyzing'
  ).length
  const failedCount = sessions.filter(s => s.status === 'error').length

  return (
    <>
      <PageHeader
        title="Sessions"
        subtitle="All wound assessment encounters"
        action={
          <Button onClick={() => navigate('/')}>
            <PlusIcon /> New Encounter
          </Button>
        }
      />

      {/* Summary stats */}
      <Grid columns={{ initial: '2', sm: '4' }} gap="3" mb="5">
        <StatCard label="Total Encounters" value={sessions.length} />
        <StatCard label="Completed" value={completedCount} color="var(--green-9)" />
        <StatCard label="In Progress" value={inProgressCount} color="var(--amber-9)" />
        <StatCard label="Failed" value={failedCount} color="var(--red-9)" />
      </Grid>

      {/* Sessions table */}
      <Box>
        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Patient Ref</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Created</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Expires</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {sessions.map(session => (
              <Table.Row key={session.id}>
                <Table.Cell>
                  {session.patientRef ? (
                    <Text weight="medium">{session.patientRef}</Text>
                  ) : (
                    <Text color="gray">No reference</Text>
                  )}
                </Table.Cell>
                <Table.Cell>
                  <StatusBadge status={session.status} />
                </Table.Cell>
                <Table.Cell>
                  <Text size="2">{formatDate(session.createdAt)}</Text>
                </Table.Cell>
                <Table.Cell>
                  {isExpired(session.expiresAt) ? (
                    <Badge color="red" size="1">Expired</Badge>
                  ) : (
                    <Text size="2">{formatDate(session.expiresAt)}</Text>
                  )}
                </Table.Cell>
                <Table.Cell>
                  <ActionButton session={session} navigate={navigate} />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>
    </>
  )
}
