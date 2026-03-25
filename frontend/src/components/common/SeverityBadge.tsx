import { Badge } from '@radix-ui/themes'
import clsx from 'clsx'

type Severity = 'mild' | 'moderate' | 'severe' | 'critical'

interface SeverityBadgeProps {
  severity: string
}

const severityConfig: Record<Severity, { color: 'green' | 'amber' | 'orange' | 'red'; label: string }> = {
  mild: { color: 'green', label: 'Mild' },
  moderate: { color: 'amber', label: 'Moderate' },
  severe: { color: 'orange', label: 'Severe' },
  critical: { color: 'red', label: 'Critical' },
}

const fallback = { color: 'gray' as const, label: 'Unknown' }

export default function SeverityBadge({ severity }: SeverityBadgeProps) {
  const key = severity.toLowerCase() as Severity
  const config = severityConfig[key] ?? fallback
  return (
    <Badge
      color={config.color}
      variant="solid"
      size="2"
      className={clsx(key === 'critical' && 'severity-critical-pulse')}
    >
      {config.label}
    </Badge>
  )
}
