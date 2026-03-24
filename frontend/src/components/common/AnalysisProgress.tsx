import { useState, useEffect, useRef } from 'react'
import { Flex, Text, Box } from '@radix-ui/themes'

const ANALYSIS_STEPS = [
  '🔍 Examining wound bed and tissue type...',
  '📏 Estimating wound dimensions...',
  '🦠 Assessing infection indicators...',
  '🩺 Formulating clinical diagnosis...',
  '💊 Preparing treatment recommendations...',
  '⚠️ Identifying red flags...',
]

interface AnalysisProgressProps {
  size?: 'sm' | 'lg'
  showProgressBar?: boolean
  durationSeconds?: number
}

export default function AnalysisProgress({
  size = 'lg',
  showProgressBar = true,
  durationSeconds = 25,
}: AnalysisProgressProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Rotate steps every 3s with fade
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setStepIndex((prev) => (prev + 1) % ANALYSIS_STEPS.length)
        setVisible(true)
      }, 500)
    }, 3000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  // Animate progress bar from 0 to 90% over durationSeconds
  useEffect(() => {
    if (!showProgressBar) return

    // Start at 0, kick off transition after mount
    const raf = requestAnimationFrame(() => {
      setProgress(90)
    })

    return () => cancelAnimationFrame(raf)
  }, [showProgressBar, durationSeconds])

  const isSmall = size === 'sm'

  return (
    <Flex direction="column" gap="3" align="center" style={{ width: '100%' }}>
      {showProgressBar && (
        <Box
          style={{
            width: '100%',
            height: isSmall ? 4 : 6,
            backgroundColor: 'var(--gray-4)',
            borderRadius: 'var(--radius-2)',
            overflow: 'hidden',
          }}
        >
          <Box
            style={{
              height: '100%',
              width: `${progress}%`,
              backgroundColor: 'var(--blue-9)',
              borderRadius: 'var(--radius-2)',
              transition: `width ${durationSeconds}s ease-out`,
            }}
          />
        </Box>
      )}
      <Text
        size={isSmall ? '1' : '2'}
        color={isSmall ? 'gray' : 'blue'}
        align="center"
        style={{
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.5s ease',
          minHeight: isSmall ? 18 : 22,
        }}
      >
        {ANALYSIS_STEPS[stepIndex]}
      </Text>
    </Flex>
  )
}
