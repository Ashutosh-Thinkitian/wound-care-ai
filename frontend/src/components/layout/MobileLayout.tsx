import { Box, Flex, Text, Badge, Container } from '@radix-ui/themes'
import { Cross2Icon } from '@radix-ui/react-icons'

interface MobileLayoutProps {
  children: React.ReactNode
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <Flex direction="column" style={{ minHeight: '100vh', backgroundColor: 'white' }}>
      {/* Top bar */}
      <Box
        p="3"
        style={{
          borderBottom: '1px solid var(--gray-a5)',
        }}
      >
        <Flex align="center" justify="center" gap="3">
          <Flex align="center" gap="2">
            <Flex
              align="center"
              justify="center"
              style={{
                width: 24,
                height: 24,
                borderRadius: 'var(--radius-2)',
                backgroundColor: 'var(--blue-9)',
                color: 'white',
              }}
            >
              <Cross2Icon width={14} height={14} />
            </Flex>
            <Text size="3" weight="bold" color="blue">
              WoundCare AI
            </Text>
          </Flex>
          <Badge color="blue">Secure Session</Badge>
        </Flex>
      </Box>

      {/* Content */}
      <Container size="1" px="4" py="5" style={{ flex: 1 }}>
        {children}
      </Container>
    </Flex>
  )
}
