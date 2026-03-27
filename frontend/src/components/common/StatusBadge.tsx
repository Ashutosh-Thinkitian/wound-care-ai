import { Badge, Flex } from '@radix-ui/themes'
import {
  ClockIcon,
  ImageIcon,
  MagicWandIcon,
  CheckCircledIcon,
  CrossCircledIcon,
} from '@radix-ui/react-icons'

type SessionStatus = 'pending' | 'image_received' | 'analyzing' | 'complete' | 'error'

interface StatusBadgeProps {
  status: SessionStatus
}

const statusConfig: Record<SessionStatus, { color: 'gray' | 'blue' | 'amber' | 'green' | 'red'; label: string; icon: React.ReactNode }> = {
  pending: { color: 'gray', label: 'Waiting', icon: <ClockIcon width={12} height={12} /> },
  image_received: { color: 'blue', label: 'Image Received', icon: <ImageIcon width={12} height={12} /> },
  analyzing: { color: 'amber', label: 'Analyzing...', icon: <MagicWandIcon width={12} height={12} /> },
  complete: { color: 'green', label: 'Complete', icon: <CheckCircledIcon width={12} height={12} /> },
  error: { color: 'red', label: 'Failed', icon: <CrossCircledIcon width={12} height={12} /> },
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <Badge color={config.color} variant="soft" size="2" radius="full">
      <Flex align="center" gap="1">
        {config.icon}
        {config.label}
      </Flex>
    </Badge>
  )
}
