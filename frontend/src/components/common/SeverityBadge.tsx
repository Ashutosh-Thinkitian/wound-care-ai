import { Badge } from '@radix-ui/themes'
import clsx from 'clsx'

type Severity = 'mild' | 'moderate' | 'severe' | 'critical'

interface SeverityBadgeProps {
  severity: Severity
}

const severityConfig: Record<Severity, { color: 'green' | 'amber' | 'orange' | 'red'; label: string }> = {
  mild: { color: 'green', label: 'Mild' },
  moderate: { color: 'amber', label: 'Moderate' },
  severe: { color: 'orange', label: 'Severe' },
  critical: { color: 'red', label: 'Critical' },
}

export default function SeverityBadge({ severity }: SeverityBadgeProps) {
  const config = severityConfig[severity]
  return (
    <Badge
      color={config.color}
      variant="solid"
      size="2"
      className={clsx(severity === 'critical' && 'severity-critical-pulse')}
    >
      {config.label}
    </Badge>
  )
}
