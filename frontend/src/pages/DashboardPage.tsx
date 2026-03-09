import { Card, Text, Button, Flex } from '@radix-ui/themes'
import { PlusIcon } from '@radix-ui/react-icons'
import PageHeader from '@/components/layout/PageHeader'

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Wound Assessment Encounters"
        action={
          <Button size="3">
            <PlusIcon />
            New Encounter
          </Button>
        }
      />
      <Card size="3">
        <Flex direction="column" align="center" gap="4" py="6">
          <Text size="3" color="gray" align="center">
            Start your first encounter to generate a QR code for image capture.
          </Text>
          <Button size="3">
            <PlusIcon />
            New Encounter
          </Button>
        </Flex>
      </Card>
    </>
  )
}
