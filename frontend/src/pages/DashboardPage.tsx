import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  Text,
  Button,
  Flex,
  Grid,
  Heading,
  Badge,
  Table,
  Separator,
} from '@radix-ui/themes'
import {
  ClipboardIcon,
  ArrowRightIcon,
  LightningBoltIcon,
  TimerIcon,
  BarChartIcon,
} from '@radix-ui/react-icons'
import PageHeader from '@/components/layout/PageHeader'
import EmptyState from '@/components/common/EmptyState'
import StatusBadge from '@/components/common/StatusBadge'
import NewEncounterDialog from '@/components/wound/NewEncounterDialog'
import { useSessions } from '@/hooks/useSessions'
import { formatDate } from '@/utils/formatDate'

export default function DashboardPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const navigate = useNavigate()
  const { sessions, loading } = useSessions()
  const recentSessions = sessions.slice(0, 3)

  const completedCount = sessions.filter(s => s.status === 'complete').length
  const inProgressCount = sessions.filter(s =>
    s.status === 'pending' || s.status === 'image_received' || s.status === 'analyzing'
  ).length
  const failedCount = sessions.filter(s => s.status === 'error').length

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Start a new wound assessment encounter"
      />

      {/* TOP ROW — CTA card + Capabilities card */}
      <Grid columns={{ initial: '1', md: '2fr 3fr' }} gap="4" mb="5">

        {/* LEFT — Start New Encounter CTA */}
        <Card
          variant="surface"
          style={{
            background: 'var(--blue-2)',
            border: '1px solid var(--blue-6)',
          }}
        >
          <Flex direction="column" gap="4" p="4">
            <Flex gap="2" mb="3" wrap="wrap">
              <Badge color="blue" variant="soft" radius="full">AI Powered</Badge>
              <Badge color="green" variant="soft" radius="full">Gemini 2.5 Flash</Badge>
              <Badge color="amber" variant="soft" radius="full">Clinical Grade</Badge>
            </Flex>

            <Box>
              <Heading size="5" mb="2">New Encounter</Heading>
              <Text size="2" color="gray">
                Generate a QR code or upload an image directly for AI-powered wound assessment
              </Text>
            </Box>

            {/* 3-step flow — vertical on small, stays readable */}
            <Flex direction="column" gap="2">
              {[
                { n: '1', label: 'Create encounter & generate QR' },
                { n: '2', label: 'Capture or upload wound image' },
                { n: '3', label: 'Receive AI clinical assessment' },
              ].map(step => (
                <Flex key={step.n} gap="3" align="center">
                  <Badge color="blue" variant="solid" radius="full" size="1">{step.n}</Badge>
                  <Text size="2">{step.label}</Text>
                </Flex>
              ))}
            </Flex>

            <Button size="3" onClick={() => setDialogOpen(true)}>
              Start Encounter <ArrowRightIcon />
            </Button>

            <Text size="1" color="gray">
              AI-generated reports must be reviewed by a licensed healthcare provider
            </Text>
          </Flex>
        </Card>

        {/* RIGHT — Capabilities: stats + supported wounds */}
        <Flex direction="column" gap="4">

          {/* Capability stats row */}
          <Grid columns="3" gap="3">
            <Card variant="surface">
              <Flex direction="column" align="center" gap="2" p="3">
                <Flex
                  align="center"
                  justify="center"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'var(--blue-a3)',
                    color: 'var(--blue-9)',
                  }}
                >
                  <LightningBoltIcon width={20} height={20} />
                </Flex>
                <Text size="5" weight="bold" color="blue">AI</Text>
                <Text size="1" color="gray" align="center">Powered Analysis</Text>
              </Flex>
            </Card>
            <Card variant="surface">
              <Flex direction="column" align="center" gap="2" p="3">
                <Flex
                  align="center"
                  justify="center"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'var(--amber-a3)',
                    color: 'var(--amber-9)',
                  }}
                >
                  <TimerIcon width={20} height={20} />
                </Flex>
                <Text size="5" weight="bold" color="amber">30s</Text>
                <Text size="1" color="gray" align="center">Avg Analysis Time</Text>
              </Flex>
            </Card>
            <Card variant="surface">
              <Flex direction="column" align="center" gap="2" p="3">
                <Flex
                  align="center"
                  justify="center"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'var(--green-a3)',
                    color: 'var(--green-9)',
                  }}
                >
                  <BarChartIcon width={20} height={20} />
                </Flex>
                <Text size="5" weight="bold" color="green">15+</Text>
                <Text size="1" color="gray" align="center">Clinical Data Points</Text>
              </Flex>
            </Card>
          </Grid>

          {/* Supported Wounds */}
          <Card variant="surface">
            <Flex direction="column" gap="2" p="3">
              <Heading size="3">Supported Wounds</Heading>
              <Separator />
              <Grid columns={{ initial: '1', sm: '2' }} gap="3">
                <Box>
                  <Text size="1" weight="bold" color="blue" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Chronic
                  </Text>
                  <Text size="1" color="gray" as="p">• Diabetic foot ulcers</Text>
                  <Text size="1" color="gray" as="p">• Venous leg ulcers</Text>
                  <Text size="1" color="gray" as="p">• Arterial / ischemic ulcers</Text>
                  <Text size="1" color="gray" as="p">• Pressure injuries (I–IV)</Text>
                </Box>
                <Box>
                  <Text size="1" weight="bold" color="blue" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Acute
                  </Text>
                  <Text size="1" color="gray" as="p">• Surgical wounds & incisions</Text>
                  <Text size="1" color="gray" as="p">• Traumatic lacerations</Text>
                  <Text size="1" color="gray" as="p">• Puncture & bite wounds</Text>
                  <Text size="1" color="gray" as="p">• Burns (all depths)</Text>
                </Box>
                <Box>
                  <Text size="1" weight="bold" color="blue" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Skin Conditions
                  </Text>
                  <Text size="1" color="gray" as="p">• Skin tears</Text>
                  <Text size="1" color="gray" as="p">• Dermatitis wounds</Text>
                  <Text size="1" color="gray" as="p">• Necrotizing fasciitis</Text>
                </Box>
                <Box>
                  <Text size="1" weight="bold" color="blue" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Other
                  </Text>
                  <Text size="1" color="gray" as="p">• Fungal infections</Text>
                  <Text size="1" color="gray" as="p">• Post-radiation wounds</Text>
                  <Text size="1" color="gray" as="p">• Wound dehiscence</Text>
                </Box>
              </Grid>
            </Flex>
          </Card>
        </Flex>
      </Grid>

      {/* ENCOUNTER STATS ROW */}
      <Grid columns={{ initial: '2', sm: '4' }} gap="3" mb="5">
        <Card variant="surface" style={{ textAlign: 'center', padding: 16 }}>
          <Text size="6" weight="bold">{loading ? 0 : sessions.length}</Text>
          <Text size="1" color="gray" style={{ display: 'block', marginTop: 4, textTransform: 'uppercase' }}>
            Total Encounters
          </Text>
        </Card>
        <Card variant="surface" style={{ textAlign: 'center', padding: 16 }}>
          <Text size="6" weight="bold" color="green">{loading ? 0 : completedCount}</Text>
          <Text size="1" color="gray" style={{ display: 'block', marginTop: 4, textTransform: 'uppercase' }}>
            Completed
          </Text>
        </Card>
        <Card variant="surface" style={{ textAlign: 'center', padding: 16 }}>
          <Text size="6" weight="bold" color="blue">{loading ? 0 : inProgressCount}</Text>
          <Text size="1" color="gray" style={{ display: 'block', marginTop: 4, textTransform: 'uppercase' }}>
            In Progress
          </Text>
        </Card>
        <Card variant="surface" style={{ textAlign: 'center', padding: 16 }}>
          <Text size="6" weight="bold" color="red">{loading ? 0 : failedCount}</Text>
          <Text size="1" color="gray" style={{ display: 'block', marginTop: 4, textTransform: 'uppercase' }}>
            Failed
          </Text>
        </Card>
      </Grid>

      {/* Recent Sessions */}
      <Box>
        <Flex justify="between" align="center" mb="3">
          <Heading size="4">Recent Sessions</Heading>
          {sessions.length > 0 && (
            <Button variant="soft" size="2" onClick={() => navigate('/sessions')}>
              View All Sessions <ArrowRightIcon />
            </Button>
          )}
        </Flex>

        {loading ? (
          <Flex direction="column" gap="2">
            {[1, 2, 3].map(i => (
              <Box
                key={i}
                style={{
                  height: 40,
                  background: 'var(--gray-3)',
                  borderRadius: 4,
                }}
              />
            ))}
          </Flex>
        ) : recentSessions.length === 0 ? (
          <EmptyState
            icon={<ClipboardIcon width={24} height={24} />}
            title="No encounters yet"
            description="Start your first encounter above"
          />
        ) : (
          <Table.Root variant="surface">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Patient Ref</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Created</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {recentSessions.map(session => (
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
                    {session.status === 'complete' && session.assessmentId ? (
                      <Button size="1" onClick={() => navigate(`/assessment/${session.assessmentId}`)}>
                        View Report <ArrowRightIcon />
                      </Button>
                    ) : session.status === 'error' ? (
                      <Badge color="red" size="1">Failed</Badge>
                    ) : (
                      <Button size="1" variant="soft" onClick={() => navigate(`/session/${session.id}`)}>
                        View <ArrowRightIcon />
                      </Button>
                    )}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        )}
      </Box>

      <NewEncounterDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  )
}
