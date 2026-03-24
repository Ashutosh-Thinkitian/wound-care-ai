import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  Flex,
  Grid,
  Text,
  Heading,
  Badge,
  Button,
  Callout,
} from '@radix-ui/themes'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircledIcon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
  DotFilledIcon,
} from '@radix-ui/react-icons'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import EmptyState from '@/components/common/EmptyState'
import SeverityBadge from '@/components/common/SeverityBadge'
import { useAssessment } from '@/hooks/useAssessment'

const formatDate = (iso: string): string => {
  const d = new Date(iso.endsWith('Z') ? iso : iso + 'Z')
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const healingPhaseColors: Record<string, 'red' | 'amber' | 'green' | 'orange' | 'gray'> = {
  inflammatory: 'red',
  proliferative: 'amber',
  remodeling: 'green',
  chronic: 'orange',
  unknown: 'gray',
}

function Divider() {
  return (
    <Box
      style={{
        height: 1,
        backgroundColor: 'var(--gray-5)',
        width: '100%',
      }}
    />
  )
}

function DataItem({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Text size="1" color="gray" weight="bold" style={{ textTransform: 'uppercase' }}>
        {label}
      </Text>
      <Text size="2" as="p" style={{ marginTop: 2 }}>
        {value}
      </Text>
    </Box>
  )
}

export default function AssessmentResultPage() {
  const { assessmentId = '' } = useParams<{ assessmentId: string }>()
  const navigate = useNavigate()
  const { assessment, loading, error } = useAssessment(assessmentId)

  if (loading) {
    return <LoadingSpinner label="Loading assessment report..." />
  }

  if (error || !assessment) {
    return (
      <EmptyState
        icon={<InfoCircledIcon width={24} height={24} />}
        title="Assessment not found"
        description={error ?? 'This assessment could not be loaded.'}
        action={
          <Button variant="soft" onClick={() => navigate('/')}>
            <ArrowLeftIcon />
            Back to Dashboard
          </Button>
        }
      />
    )
  }

  const hasRedFlags =
    assessment.redFlags.length > 0 &&
    !(assessment.redFlags.length === 1 && assessment.redFlags[0].toLowerCase().includes('none'))

  const hasInfection =
    assessment.infectionSigns.length > 0 &&
    !(
      assessment.infectionSigns.length === 1 &&
      assessment.infectionSigns[0].toLowerCase().includes('no signs')
    )

  return (
    <Flex direction="column" gap="5">
      {/* TOP BAR */}
      <Card variant="surface" size="3">
        <Flex
          justify="between"
          align="center"
          wrap="wrap"
          gap="4"
          p="1"
        >
          <Flex direction="column" gap="1">
            <Heading size="6">{assessment.woundType}</Heading>
            <Text size="2" color="gray">
              Analyzed on {formatDate(assessment.analyzedAt)}
            </Text>
          </Flex>

          <Flex gap="3" align="center" wrap="wrap">
            <SeverityBadge severity={assessment.severity} />
            <Badge
              color={healingPhaseColors[assessment.healingPhase] ?? 'gray'}
              variant="soft"
              size="2"
            >
              {assessment.healingPhase.charAt(0).toUpperCase() +
                assessment.healingPhase.slice(1)}
            </Badge>
            <Button variant="soft" onClick={() => navigate(-1)}>
              <ArrowLeftIcon />
              Back to Session
            </Button>
          </Flex>
        </Flex>
      </Card>

      {/* RED FLAGS BANNER */}
      {hasRedFlags && (
        <Callout.Root color="red" size="2">
          <Callout.Icon>
            <ExclamationTriangleIcon />
          </Callout.Icon>
          <Callout.Text>
            <Text weight="bold" size="2">
              Red Flags Requiring Urgent Attention
            </Text>
            <Flex direction="column" gap="1" mt="2">
              {assessment.redFlags.map((flag, i) => (
                <Text key={i} size="2">
                  • {flag}
                </Text>
              ))}
            </Flex>
          </Callout.Text>
        </Callout.Root>
      )}

      {/* MAIN CONTENT — Two columns */}
      <Grid columns={{ initial: '1', md: '3fr 2fr' }} gap="5">
        {/* LEFT COLUMN */}
        <Flex direction="column" gap="5">
          {/* Wound Image */}
          <Card size="3">
            <Flex direction="column" gap="3" p="1">
              <Heading size="4">Wound Image</Heading>
              <Box
                style={{
                  borderRadius: 'var(--radius-3)',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={assessment.imageUrl}
                  alt="Wound photograph"
                  style={{
                    width: '100%',
                    maxHeight: 350,
                    objectFit: 'cover',
                    display: 'block',
                    borderRadius: 'var(--radius-3)',
                  }}
                />
              </Box>
              <Text size="1" color="gray">
                Image captured during encounter
              </Text>
            </Flex>
          </Card>

          {/* Clinical Diagnosis */}
          <Card size="3">
            <Flex direction="column" gap="3" p="1">
              <Heading size="4">Clinical Diagnosis</Heading>
              <Text size="3" weight="bold" color="blue">
                {assessment.diagnosis}
              </Text>
              <Divider />
              <Text size="2" color="gray" weight="bold" style={{ textTransform: 'uppercase' }}>
                Probable Cause
              </Text>
              <Text size="2">{assessment.probableCause}</Text>
              <Divider />
              <Text size="2" color="gray" weight="bold" style={{ textTransform: 'uppercase' }}>
                Differential Diagnoses
              </Text>
              <Flex gap="2" wrap="wrap">
                {assessment.differentialDiagnosis.map((d, i) => (
                  <Badge key={i} variant="soft" color="gray">
                    {d}
                  </Badge>
                ))}
              </Flex>
            </Flex>
          </Card>

          {/* Wound Characteristics */}
          <Card size="3">
            <Flex direction="column" gap="3" p="1">
              <Heading size="4">Wound Characteristics</Heading>
              <Grid columns="2" gap="3">
                <DataItem label="Wound Type" value={assessment.woundType} />
                <DataItem
                  label="Wound Depth"
                  value={assessment.woundDepth.replace(/_/g, ' ')}
                />
                <DataItem
                  label="Wound Stage"
                  value={assessment.woundStage ?? 'Not staged'}
                />
                <DataItem label="Healing Phase" value={assessment.healingPhase} />
                <DataItem
                  label="Exudate Amount"
                  value={assessment.exudate.amount}
                />
                <DataItem label="Exudate Type" value={assessment.exudate.type} />
              </Grid>
              <Divider />
              <Text size="1" color="gray" weight="bold" style={{ textTransform: 'uppercase' }}>
                Wound Bed
              </Text>
              <Text size="2">{assessment.woundBed}</Text>
              <Divider />
              <Text size="1" color="gray" weight="bold" style={{ textTransform: 'uppercase' }}>
                Periwound Skin
              </Text>
              <Text size="2">{assessment.periwoundSkin}</Text>
            </Flex>
          </Card>

          {/* Estimated Dimensions */}
          <Card size="3">
            <Flex direction="column" gap="3" p="1">
              <Heading size="4">Estimated Dimensions</Heading>
              <Grid columns="3" gap="3">
                {[
                  { label: 'Length', value: assessment.estimatedDimensions.lengthCm },
                  { label: 'Width', value: assessment.estimatedDimensions.widthCm },
                  { label: 'Depth', value: assessment.estimatedDimensions.depthCm },
                ].map((dim) => (
                  <Flex
                    key={dim.label}
                    direction="column"
                    align="center"
                    gap="1"
                    style={{
                      padding: 'var(--space-3)',
                      backgroundColor: 'var(--gray-3)',
                      borderRadius: 'var(--radius-3)',
                    }}
                  >
                    <Text size="5" weight="bold">
                      {dim.value}
                    </Text>
                    <Text size="1" color="gray">
                      {dim.label}
                    </Text>
                  </Flex>
                ))}
              </Grid>
              <Callout.Root color="amber" size="1">
                <Callout.Icon>
                  <InfoCircledIcon />
                </Callout.Icon>
                <Callout.Text>
                  {assessment.estimatedDimensions.note}
                </Callout.Text>
              </Callout.Root>
            </Flex>
          </Card>

          {/* Infection Assessment */}
          <Card size="3">
            <Flex direction="column" gap="3" p="1">
              <Heading size="4">Infection Assessment</Heading>
              {hasInfection ? (
                <>
                  <Callout.Root color="red" size="1">
                    <Callout.Icon>
                      <ExclamationTriangleIcon />
                    </Callout.Icon>
                    <Callout.Text>Signs of infection detected</Callout.Text>
                  </Callout.Root>
                  <Flex direction="column" gap="1">
                    {assessment.infectionSigns.map((sign, i) => (
                      <Flex key={i} gap="2" align="center">
                        <DotFilledIcon color="var(--red-9)" />
                        <Text size="2">{sign}</Text>
                      </Flex>
                    ))}
                  </Flex>
                </>
              ) : (
                <Callout.Root color="green" size="1">
                  <Callout.Icon>
                    <CheckCircledIcon />
                  </Callout.Icon>
                  <Callout.Text>
                    No signs of infection observed
                  </Callout.Text>
                </Callout.Root>
              )}
            </Flex>
          </Card>
        </Flex>

        {/* RIGHT COLUMN */}
        <Flex direction="column" gap="5">
          {/* Immediate Actions */}
          <Card size="3">
            <Flex direction="column" gap="3" p="1">
              <Heading size="4">Immediate Actions</Heading>
              <Flex direction="column" gap="2">
                {assessment.immediateActions.map((action, i) => (
                  <Flex key={i} gap="2" align="start">
                    <Badge color="blue" variant="solid" radius="full">
                      {i + 1}
                    </Badge>
                    <Text size="2">{action}</Text>
                  </Flex>
                ))}
              </Flex>
            </Flex>
          </Card>

          {/* Dressing Recommendations */}
          <Card size="3">
            <Flex direction="column" gap="3" p="1">
              <Heading size="4">Dressing Recommendations</Heading>
              <Flex direction="column" gap="2">
                {assessment.dressingSuggestions.map((suggestion, i) => (
                  <Flex key={i} gap="2" align="start">
                    <CheckCircledIcon
                      color="var(--green-9)"
                      style={{ marginTop: 3, flexShrink: 0 }}
                    />
                    <Text size="2">{suggestion}</Text>
                  </Flex>
                ))}
              </Flex>
            </Flex>
          </Card>

          {/* Follow-Up & Referrals */}
          <Card size="3">
            <Flex direction="column" gap="3" p="1">
              <Heading size="4">Follow-Up & Referrals</Heading>
              <Text size="1" color="gray" weight="bold" style={{ textTransform: 'uppercase' }}>
                Follow-Up Timeline
              </Text>
              <Text size="2">{assessment.followUpTimeline}</Text>
              <Divider />
              <Text size="1" color="gray" weight="bold" style={{ textTransform: 'uppercase' }}>
                Referral Recommendations
              </Text>
              <Flex direction="column" gap="1">
                {assessment.referralRecommendations.length > 0 ? (
                  assessment.referralRecommendations.map((ref, i) => (
                    <Flex key={i} gap="2" align="center">
                      <ArrowRightIcon color="var(--blue-9)" style={{ flexShrink: 0 }} />
                      <Text size="2">{ref}</Text>
                    </Flex>
                  ))
                ) : (
                  <Text size="2" color="gray">
                    No referrals needed at this time.
                  </Text>
                )}
              </Flex>
            </Flex>
          </Card>

          {/* Additional Workup */}
          <Card size="3">
            <Flex direction="column" gap="3" p="1">
              <Heading size="4">Additional Workup</Heading>
              {assessment.additionalWorkup.length > 0 ? (
                <Flex direction="column" gap="1">
                  {assessment.additionalWorkup.map((item, i) => (
                    <Flex key={i} gap="2" align="center">
                      <DotFilledIcon color="var(--gray-9)" style={{ flexShrink: 0 }} />
                      <Text size="2">{item}</Text>
                    </Flex>
                  ))}
                </Flex>
              ) : (
                <Text size="2" color="gray">
                  No additional workup required at this time.
                </Text>
              )}
            </Flex>
          </Card>
        </Flex>
      </Grid>

      {/* DISCLAIMER BAR */}
      <Card variant="surface" size="2">
        <Flex gap="2" align="center" p="1">
          <InfoCircledIcon color="var(--gray-9)" style={{ flexShrink: 0 }} />
          <Text size="1" color="gray">
            {assessment.disclaimer}
          </Text>
        </Flex>
      </Card>
    </Flex>
  )
}
