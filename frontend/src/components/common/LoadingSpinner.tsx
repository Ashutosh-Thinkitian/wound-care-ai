import { Flex, Spinner, Text } from '@radix-ui/themes'

interface LoadingSpinnerProps {
  label?: string
}

export default function LoadingSpinner({ label }: LoadingSpinnerProps) {
  return (
    <Flex direction="column" align="center" justify="center" gap="3" py="9">
      <Spinner size="3" />
      {label && (
        <Text size="2" color="gray">
          {label}
        </Text>
      )}
    </Flex>
  )
}
