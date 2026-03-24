import type { ReactNode } from 'react'
import { Box } from '@radix-ui/themes'

interface PulsingCardProps {
  active: boolean
  children: ReactNode
}

export default function PulsingCard({ active, children }: PulsingCardProps) {
  return (
    <Box
      style={{
        borderRadius: 'var(--radius-3)',
        padding: 'var(--space-4)',
        backgroundColor: 'var(--color-panel)',
        border: '1px solid var(--gray-5)',
        animation: active ? 'borderPulse 2s ease-in-out infinite' : 'none',
      }}
    >
      {children}
    </Box>
  )
}
