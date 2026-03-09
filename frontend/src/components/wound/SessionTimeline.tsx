import { Flex, Text, Box } from '@radix-ui/themes'
import { CheckCircledIcon } from '@radix-ui/react-icons'
import type { Session } from '@/types'

interface SessionTimelineProps {
  status: Session['status']
}

interface Step {
  title: string
  subtitle?: string
}

const steps: Step[] = [
  { title: 'Encounter Created' },
  { title: 'QR Scanned & Image Captured' },
  { title: 'AI Analysis Running' },
  { title: 'Assessment Ready' },
]

function getStepState(
  stepIndex: number,
  status: Session['status']
): 'completed' | 'active' | 'pending' {
  const statusOrder: Record<Session['status'], number> = {
    pending: 0,
    image_received: 1,
    analyzing: 2,
    complete: 3,
    error: -1,
  }

  const currentIndex = statusOrder[status]

  // Error state: only step 0 is complete
  if (status === 'error') {
    return stepIndex === 0 ? 'completed' : 'pending'
  }

  if (stepIndex < currentIndex) return 'completed'
  if (stepIndex === currentIndex) {
    // Step 0 (Encounter Created) is always completed once we have a session
    return stepIndex === 0 ? 'completed' : 'active'
  }
  return 'pending'
}

function StepIcon({ state }: { state: 'completed' | 'active' | 'pending' }) {
  if (state === 'completed') {
    return <CheckCircledIcon width={20} height={20} color="var(--green-9)" />
  }
  if (state === 'active') {
    return (
      <Box
        style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: 'var(--amber-9)',
          animation: 'timelinePulse 1.5s ease-in-out infinite',
          margin: '0 4px',
        }}
      />
    )
  }
  return (
    <Box
      style={{
        width: 12,
        height: 12,
        borderRadius: '50%',
        border: '2px solid var(--gray-6)',
        margin: '0 4px',
      }}
    />
  )
}

export default function SessionTimeline({ status }: SessionTimelineProps) {
  return (
    <>
      <style>{`
        @keyframes timelinePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>
      <Flex direction="column" gap="1">
        {steps.map((step, i) => {
          const state = getStepState(i, status)
          const isLast = i === steps.length - 1
          return (
            <Flex key={step.title} gap="3" align="start">
              {/* Icon + connector line */}
              <Flex
                direction="column"
                align="center"
                style={{ width: 20, flexShrink: 0 }}
              >
                <Flex
                  align="center"
                  justify="center"
                  style={{ height: 24 }}
                >
                  <StepIcon state={state} />
                </Flex>
                {!isLast && (
                  <Box
                    style={{
                      width: 2,
                      height: 24,
                      backgroundColor:
                        state === 'completed'
                          ? 'var(--green-6)'
                          : 'var(--gray-4)',
                    }}
                  />
                )}
              </Flex>

              {/* Text */}
              <Box style={{ paddingTop: 2, paddingBottom: isLast ? 0 : 16 }}>
                <Text
                  size="2"
                  weight={state === 'active' ? 'medium' : 'regular'}
                  style={{
                    opacity: state === 'pending' ? 0.45 : 1,
                  }}
                >
                  {step.title}
                </Text>
                {state === 'active' && (
                  <Text size="1" color="gray" as="p">
                    (in progress)
                  </Text>
                )}
              </Box>
            </Flex>
          )
        })}
      </Flex>
    </>
  )
}
