import { Card, Flex, Box, Text, Heading, Button } from '@radix-ui/themes'
import { CameraIcon } from '@radix-ui/react-icons'

export default function MobileCapturePage() {
  return (
    <Card size="3">
      <Flex direction="column" gap="4" p="2">
        <Heading size="4" align="center">
          Capture Wound Image
        </Heading>
        <Text size="2" color="gray" align="center">
          Take a clear photo of the wound for AI-assisted assessment.
        </Text>
        <Box
          style={{
            width: '100%',
            height: 240,
            backgroundColor: 'var(--gray-a3)',
            borderRadius: 'var(--radius-2)',
            border: '2px dashed var(--gray-a6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Flex direction="column" align="center" gap="2">
            <CameraIcon width={32} height={32} color="var(--gray-8)" />
            <Text size="2" color="gray">
              Tap to upload or take a photo
            </Text>
          </Flex>
        </Box>
        <Button size="3">
          <CameraIcon />
          Take Photo
        </Button>
      </Flex>
    </Card>
  )
}
