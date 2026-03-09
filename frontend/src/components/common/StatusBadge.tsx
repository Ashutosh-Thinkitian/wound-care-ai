import { Badge } from '@radix-ui/themes'

type SessionStatus = 'pending' | 'image_received' | 'analyzing' | 'complete' | 'error'

interface StatusBadgeProps {
  status: SessionStatus
}

const statusConfig: Record<SessionStatus, { color: 'gray' | 'blue' | 'amber' | 'green' | 'red'; label: string }> = {
  pending: { color: 'gray', label: 'Waiting for Image' },
  image_received: { color: 'blue', label: 'Image Received' },
  analyzing: { color: 'amber', label: 'Analyzing...' },
  complete: { color: 'green', label: 'Complete' },
  error: { color: 'red', label: 'Error' },
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <Badge color={config.color} variant="soft" size="2">
      {config.label}
    </Badge>
  )
}
