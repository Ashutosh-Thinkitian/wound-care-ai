import { useState } from 'react'
import { Box, Card, Text, Button, Flex, Grid, Heading } from '@radix-ui/themes'
import { PlusIcon, ClipboardIcon } from '@radix-ui/react-icons'
import PageHeader from '@/components/layout/PageHeader'
import EmptyState from '@/components/common/EmptyState'
import NewEncounterDialog from '@/components/wound/NewEncounterDialog'

export default function DashboardPage() {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Start a new wound assessment encounter"
      />

      <Grid columns={{ initial: '1', sm: '3' }} gap="4" mb="6">
        {/* Card 1: New Encounter */}
        <Card variant="surface" size="3">
          <Flex direction="column" gap="3" align="center" py="2">
            <Flex
              align="center"
              justify="center"
              style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-3)',
                backgroundColor: 'var(--blue-a3)',
                color: 'var(--blue-9)',
              }}
            >
              <PlusIcon width={24} height={24} />
            </Flex>
            <Heading size="3" align="center">New Encounter</Heading>
            <Text size="2" color="gray" align="center">
              Generate a QR code for bedside image capture
            </Text>
            <Button size="3" onClick={() => setDialogOpen(true)}>
              Start Encounter
            </Button>
          </Flex>
        </Card>

        {/* Card 2: How it works */}
        <Card variant="surface" size="3">
          <Flex direction="column" gap="3" py="2">
            <Heading size="3">How it works</Heading>
            <Flex direction="column" gap="2">
              <Flex gap="2" align="start">
                <Text size="2" weight="bold" color="blue" style={{ minWidth: 20 }}>1.</Text>
                <Text size="2">Start encounter and generate a QR code</Text>
              </Flex>
              <Flex gap="2" align="start">
                <Text size="2" weight="bold" color="blue" style={{ minWidth: 20 }}>2.</Text>
                <Text size="2">Patient scans QR and captures wound image</Text>
              </Flex>
              <Flex gap="2" align="start">
                <Text size="2" weight="bold" color="blue" style={{ minWidth: 20 }}>3.</Text>
                <Text size="2">AI generates detailed wound assessment</Text>
              </Flex>
            </Flex>
          </Flex>
        </Card>

        {/* Card 3: Supported wounds */}
        <Card variant="surface" size="3">
          <Flex direction="column" gap="3" py="2">
            <Heading size="3">Supported Wounds</Heading>
            <Flex direction="column" gap="1">
              {[
                'Diabetic ulcers',
                'Pressure injuries',
                'Surgical wounds',
                'Traumatic wounds',
                'Burns',
                'Venous / arterial ulcers',
              ].map((wound) => (
                <Text key={wound} size="2" color="gray">
                  • {wound}
                </Text>
              ))}
            </Flex>
          </Flex>
        </Card>
      </Grid>

      {/* Recent Sessions */}
      <Box>
        <Heading size="4" mb="4">Recent Sessions</Heading>
        <EmptyState
          icon={<ClipboardIcon width={24} height={24} />}
          title="No encounters yet"
          description="Start your first encounter above"
        />
      </Box>

      <NewEncounterDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  )
}
