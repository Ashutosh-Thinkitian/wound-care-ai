import { Card, Flex, Box, Text } from '@radix-ui/themes'
import PageHeader from '@/components/layout/PageHeader'
import StatusBadge from '@/components/common/StatusBadge'

export default function SessionPage() {
  return (
    <>
      <PageHeader title="Session" subtitle="Waiting for patient image..." />
      <Flex gap="4" direction={{ initial: 'column', sm: 'row' }}>
        <Card size="3">
          <Flex direction="column" align="center" gap="4" p="4">
            <Text size="2" weight="medium" color="gray">
              QR Code
            </Text>
            <Box
              style={{
                width: 200,
                height: 200,
                backgroundColor: 'var(--gray-a3)',
                borderRadius: 'var(--radius-2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text size="2" color="gray">
                QR Code
              </Text>
            </Box>
            <Text size="1" color="gray">
              Scan with a mobile device to capture wound image
            </Text>
          </Flex>
        </Card>
        <Card size="3" style={{ flex: 1 }}>
          <Flex direction="column" gap="3" p="2">
            <Text size="2" weight="medium">
              Session Status
            </Text>
            <StatusBadge status="pending" />
            <Text size="2" color="gray">
              Waiting for the patient or clinician to upload a wound image via the QR code link.
            </Text>
          </Flex>
        </Card>
      </Flex>
    </>
  )
}
