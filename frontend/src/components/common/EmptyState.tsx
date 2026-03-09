import { Flex, Heading, Text } from '@radix-ui/themes'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Flex direction="column" align="center" justify="center" gap="3" py="9">
      <Flex
        align="center"
        justify="center"
        style={{
          width: 56,
          height: 56,
          borderRadius: 'var(--radius-3)',
          backgroundColor: 'var(--gray-a3)',
          color: 'var(--gray-9)',
        }}
      >
        {icon}
      </Flex>
      <Heading size="4" align="center">
        {title}
      </Heading>
      <Text size="2" color="gray" align="center" style={{ maxWidth: 320 }}>
        {description}
      </Text>
      {action && action}
    </Flex>
  )
}
