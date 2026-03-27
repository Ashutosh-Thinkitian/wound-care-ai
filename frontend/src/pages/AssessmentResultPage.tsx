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
  Strong,
  Separator,
  Tabs,
  IconButton,
} from '@radix-ui/themes'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarIcon,
  CheckCircledIcon,
  ClockIcon,
  Cross2Icon,
  DownloadIcon,
  ExclamationTriangleIcon,
  FileTextIcon,
  HeartIcon,
  InfoCircledIcon,
  LightningBoltIcon,
  MagnifyingGlassIcon,
  BarChartIcon,
  IdCardIcon,
  MixerHorizontalIcon,
  RulerSquareIcon,
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

const formatShortDate = (iso: string): string => {
  const d = new Date(iso.endsWith('Z') ? iso : iso + 'Z')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${mm}-${dd}-${yyyy}`
}

const labelStyle = {
  color: 'var(--gray-9)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
  display: 'block',
  marginBottom: '4px',
}

function Divider() {
  return <Box style={{ height: 1, backgroundColor: 'var(--gray-5)', width: '100%' }} />
}

/** Section heading with colored icon */
function SectionHeading({ icon, iconBg, iconColor, title }: {
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  title: string
}) {
  return (
    <Flex align="center" gap="2" mb="3">
      <Box style={{ background: iconBg, borderRadius: '8px', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box style={{ color: iconColor, width: 16, height: 16, display: 'flex' }}>{icon}</Box>
      </Box>
      <Heading size="4">{title}</Heading>
    </Flex>
  )
}

/** Badge-style DataItem for Wound Characteristics */
function DataItemBadge({ label, children, alt }: { label: string; children: React.ReactNode; alt?: boolean }) {
  return (
    <Box style={alt ? { background: 'var(--gray-1)', borderRadius: '6px', padding: '8px' } : { padding: '8px' }}>
      <Text size="1" color="blue" weight="bold" style={{ textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>
        {label}
      </Text>
      {children}
    </Box>
  )
}

function ChartPlaceholder({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <Box
      style={{
        border: '1px dashed var(--gray-6)',
        borderRadius: 'var(--radius-3)',
        padding: 'var(--space-4)',
        textAlign: 'center',
        minHeight: 160,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--gray-2)',
      }}
    >
      <Flex align="center" gap="1" mb="1">
        <Box style={{ color: 'var(--gray-8)', display: 'flex' }}>{icon}</Box>
        <Text size="1" color="gray" weight="bold" style={{ textTransform: 'uppercase' }}>{label}</Text>
      </Flex>
      <Text size="1" color="gray">Chart coming soon</Text>
    </Box>
  )
}

export default function AssessmentResultPage() {
  const { assessmentId = '' } = useParams<{ assessmentId: string }>()
  const navigate = useNavigate()
  const { assessment, loading, error } = useAssessment(assessmentId)

  const handlePrint = () => {
    const patientRef = assessment?.patientRef?.trim()
    const fallback = assessment?.sessionId.slice(0, 8).toUpperCase() ?? 'REPORT'
    const label = patientRef ? patientRef : fallback
    const filename = `WoundCare AI_${label}`
    document.title = filename
    window.print()
    setTimeout(() => { document.title = 'WoundCare AI' }, 2000)
  }

  if (loading) return <LoadingSpinner label="Loading assessment report..." />

  if (error || !assessment) {
    return (
      <EmptyState
        icon={<InfoCircledIcon width={24} height={24} />}
        title="Assessment not found"
        description={error ?? 'This assessment could not be loaded.'}
        action={<Button variant="soft" onClick={() => navigate('/')}><ArrowLeftIcon /> Back to Dashboard</Button>}
      />
    )
  }

  const hasRedFlags =
    assessment.redFlags.length > 0 &&
    !(assessment.redFlags.length === 1 && assessment.redFlags[0].toLowerCase().includes('none'))

  const hasInfection =
    assessment.infectionSigns.length > 0 &&
    !(assessment.infectionSigns.length === 1 && assessment.infectionSigns[0].toLowerCase().includes('no signs'))

  return (
    <Flex direction="column" gap="4">
      {/* PRINT-ONLY HEADER */}
      <Box className="print-header" style={{ display: 'none' }} data-print-only>
        <Flex justify="between" align="start">
          <Box>
            <Heading size="7">WoundCare AI</Heading>
            <Text size="2" color="gray" as="p">AI-Assisted Wound Assessment Report</Text>
            <Text size="1" color="gray" as="p">This report is AI-generated and must be reviewed by a licensed healthcare provider</Text>
          </Box>
          <Box style={{ textAlign: 'right' }}>
            <Text size="2" weight="bold">{assessment.woundType}</Text>
            <Text size="2" color="gray" style={{ display: 'block' }}>Analyzed: {formatDate(assessment.analyzedAt)}</Text>
            {assessment.patientRef && <Text size="2" color="gray" style={{ display: 'block' }}>Patient Ref: {assessment.patientRef}</Text>}
            <Text size="2" color="gray" style={{ display: 'block' }}>Report ID: {assessment.id}</Text>
          </Box>
        </Flex>
      </Box>

      {/* TOP BAR */}
      <Card variant="surface" size="3" className="screen-top-bar">
        <Flex justify="between" align="center" wrap="wrap" gap="4" p="1">
          <Flex direction="column" gap="1" style={{ flex: 1, minWidth: 0 }}>
            <Heading size="6" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {assessment.woundType}
            </Heading>
            <Text size="2" color="gray">Analyzed on {formatDate(assessment.analyzedAt)}</Text>
            {assessment.patientRef && <Text size="2" color="gray">Patient Ref: <Strong>{assessment.patientRef}</Strong></Text>}
          </Flex>
          <Flex gap="3" align="center" wrap="wrap" style={{ flexShrink: 0 }}>
            <SeverityBadge severity={assessment.severity} />
            <Badge variant="outline" size="2" style={{ textTransform: 'capitalize' }}>{assessment.healingPhase.replace(/_/g, ' ')}</Badge>
            <Button className="no-print" variant="soft" size="2" onClick={handlePrint}><DownloadIcon /> Export PDF</Button>
            <IconButton className="no-print" variant="ghost" color="gray" size="2" onClick={() => navigate(-1)} title="Close"><Cross2Icon /></IconButton>
          </Flex>
        </Flex>
      </Card>

      {/* TABBED CONTENT — hidden during print, replaced by flat print-only section */}
      <Card size="3" className="no-print">
        <Tabs.Root defaultValue="summary">
          <Tabs.List size="2" style={{ borderBottom: '1px solid var(--gray-4)', width: '100%' }}>
            <Tabs.Trigger value="summary">Wound Summary</Tabs.Trigger>
            <Tabs.Trigger value="assessments">Assessments</Tabs.Trigger>
            <Tabs.Trigger value="treatments">Treatments</Tabs.Trigger>
          </Tabs.List>

          {/* ─── TAB 1: WOUND SUMMARY ─── */}
          <Tabs.Content value="summary">
            <Flex direction="column" gap="5" pt="4">
              <SectionHeading icon={<IdCardIcon />} iconBg="#EFF6FF" iconColor="#185FA5" title={`Initial Assessment — ${formatShortDate(assessment.analyzedAt)}`} />

              <Grid columns={{ initial: '1', md: '2' }} gap="5" style={{ alignItems: 'start' }}>
                <Box data-print-wound-image="true" style={{ borderRadius: '16px', overflow: 'hidden', border: '0.5px solid var(--gray-4)' }}>
                  <img src={assessment.imageUrl} alt="Wound image" style={{ width: '100%', height: '100%', minHeight: '320px', maxHeight: '500px', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
                </Box>

                <Box style={{ background: 'var(--gray-1)', borderRadius: '12px', padding: '20px', minHeight: '320px' }}>
                  <Grid columns="2" gap="4" style={{ rowGap: '16px' }}>
                    <Box>
                      <Text size="1" weight="bold" style={labelStyle}>Onset Date</Text>
                      <Badge color="amber" variant="soft" size="2">{formatShortDate(assessment.analyzedAt)}</Badge>
                    </Box>
                    <Box>
                      <Text size="1" weight="bold" style={labelStyle}>Visit Date</Text>
                      <Text size="2">{formatShortDate(assessment.analyzedAt)}</Text>
                    </Box>
                    <Box>
                      <Text size="1" weight="bold" style={labelStyle}>Length</Text>
                      <Text size="2">{assessment.estimatedDimensions.lengthCm}</Text>
                    </Box>
                    <Box>
                      <Text size="1" weight="bold" style={labelStyle}>Width</Text>
                      <Text size="2">{assessment.estimatedDimensions.widthCm}</Text>
                    </Box>
                    <Box style={{ gridColumn: 'span 2' }}>
                      <Text size="1" weight="bold" style={labelStyle}>Primary Location</Text>
                      <Text size="2">{assessment.woundType.length > 80 ? assessment.woundType.slice(0, 80) + '...' : assessment.woundType}</Text>
                    </Box>
                    <Box>
                      <Text size="1" weight="bold" style={labelStyle}>Primary Type</Text>
                      <Text size="2" style={{ textTransform: 'capitalize' }}>{assessment.woundDepth.replace(/_/g, ' ')}</Text>
                    </Box>
                    <Box>
                      <Text size="1" weight="bold" style={labelStyle}>Secondary Type</Text>
                      <Text size="2" style={{ textTransform: 'capitalize' }}>{assessment.healingPhase.replace(/_/g, ' ')}</Text>
                    </Box>
                    <Box style={{ gridColumn: 'span 2' }}>
                      <Text size="1" weight="bold" style={labelStyle}>Color Composition</Text>
                      <Text size="2" color="gray">{assessment.woundBed.split('.')[0].trim()}</Text>
                    </Box>
                    <Box style={{ gridColumn: 'span 2' }}>
                      <Separator size="4" my="2" />
                      <Text size="1" weight="bold" style={labelStyle}>Diagnosis</Text>
                      <Box style={{ borderLeft: '3px solid var(--blue-6)', paddingLeft: '12px' }}>
                        <Text size="2" color="blue">{assessment.diagnosis}</Text>
                      </Box>
                    </Box>
                    <Box style={{ gridColumn: 'span 2' }}>
                      <Text size="1" weight="bold" style={labelStyle}>Severity</Text>
                      <SeverityBadge severity={assessment.severity} />
                    </Box>
                  </Grid>
                </Box>
              </Grid>

              <Box mb="5">
                <SectionHeading icon={<BarChartIcon />} iconBg="#F0FDF4" iconColor="#16a34a" title="Wound Progression Tracking" />
                <Text size="2" color="gray" mb="3" style={{ display: 'block' }}>Tracking wound metrics across follow-up visits</Text>
                <Grid columns={{ initial: '1', sm: '3' }} gap="3">
                  <ChartPlaceholder label="Area (cm²)" icon={<RulerSquareIcon width={12} height={12} />} />
                  <ChartPlaceholder label="Depth (cm)" icon={<RulerSquareIcon width={12} height={12} />} />
                  <ChartPlaceholder label="Volume (cm³)" icon={<RulerSquareIcon width={12} height={12} />} />
                </Grid>
              </Box>
            </Flex>
          </Tabs.Content>

          {/* ─── TAB 2: ASSESSMENTS ─── */}
          <Tabs.Content value="assessments">
            <Flex direction="column" gap="5" pt="4">
              {/* Red Flags — enhanced banner */}
              {hasRedFlags && (
                <Box style={{
                  background: 'linear-gradient(135deg, #FEF2F2, #FFF1F2)',
                  border: '1px solid #FECACA',
                  borderLeft: '4px solid #EF4444',
                  borderRadius: '10px',
                  padding: '16px',
                  marginBottom: '4px',
                }}>
                  <Flex align="center" gap="2" mb="2">
                    <Box style={{ background: '#FEE2E2', borderRadius: '6px', padding: '4px', display: 'flex' }}>
                      <ExclamationTriangleIcon style={{ color: '#DC2626', width: 16, height: 16 }} />
                    </Box>
                    <Text weight="bold" style={{ color: '#991B1B' }}>Red Flags Requiring Urgent Attention</Text>
                    <Box style={{ marginLeft: 'auto' }}>
                      <Badge color="red" variant="solid" radius="full" style={{ fontSize: '10px' }}>URGENT</Badge>
                    </Box>
                  </Flex>
                  {assessment.redFlags.map((flag, i) => (
                    <Flex key={i} gap="2" align="start" mb="1">
                      <Box style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EF4444', flexShrink: 0, marginTop: '7px' }} />
                      <Text size="2" style={{ color: '#7F1D1D' }}>{flag}</Text>
                    </Flex>
                  ))}
                </Box>
              )}

              {/* Severity + Phase badges */}
              <Flex gap="3" align="center" wrap="wrap">
                <SeverityBadge severity={assessment.severity} />
                <Badge variant="outline" size="2" style={{ textTransform: 'capitalize' }}>{assessment.healingPhase.replace(/_/g, ' ')}</Badge>
              </Flex>

              {/* Clinical Diagnosis */}
              <Card variant="surface" mb="5" style={{ borderTop: '3px solid var(--blue-8)' }}>
                <Flex direction="column" gap="3" p="3">
                  <SectionHeading icon={<FileTextIcon />} iconBg="#EFF6FF" iconColor="#185FA5" title="Clinical Diagnosis" />
                  <Text size="3" weight="bold" color="blue">{assessment.diagnosis}</Text>
                  <Divider />
                  <Text size="2" color="gray" weight="bold" style={{ textTransform: 'uppercase' }}>Probable Cause</Text>
                  <Text size="2">{assessment.probableCause}</Text>
                  <Divider />
                  <Text size="2" color="gray" weight="bold" style={{ textTransform: 'uppercase' }}>Differential Diagnoses</Text>
                  <Flex gap="2" wrap="wrap">
                    {assessment.differentialDiagnosis.map((d, i) => (
                      <Badge key={i} variant="outline" color="blue" radius="full" style={{ padding: '4px 12px' }}>{d}</Badge>
                    ))}
                  </Flex>
                </Flex>
              </Card>

              {/* Wound Characteristics */}
              <Card variant="surface" mb="5">
                <Flex direction="column" gap="3" p="3">
                  <SectionHeading icon={<MagnifyingGlassIcon />} iconBg="#F0FDF4" iconColor="#16a34a" title="Wound Characteristics" />
                  <Grid columns="3" gap="3">
                    <DataItemBadge label="Wound Type" alt>
                      <Text size="2">{assessment.woundType}</Text>
                    </DataItemBadge>
                    <DataItemBadge label="Wound Depth">
                      <Badge color={assessment.woundDepth === 'full_thickness' ? 'red' : assessment.woundDepth === 'partial_thickness' ? 'amber' : assessment.woundDepth === 'superficial' ? 'green' : 'gray'} variant="soft" radius="full">
                        {assessment.woundDepth.replace(/_/g, ' ')}
                      </Badge>
                    </DataItemBadge>
                    <DataItemBadge label="Wound Stage" alt>
                      <Text size="2">{assessment.woundStage ?? 'Not staged'}</Text>
                    </DataItemBadge>
                    <DataItemBadge label="Healing Phase">
                      <Badge color={assessment.healingPhase === 'inflammatory' ? 'red' : assessment.healingPhase === 'proliferative' ? 'amber' : assessment.healingPhase === 'remodeling' ? 'green' : 'gray'} variant="soft" radius="full" style={{ textTransform: 'capitalize' }}>
                        {assessment.healingPhase.replace(/_/g, ' ')}
                      </Badge>
                    </DataItemBadge>
                    <DataItemBadge label="Exudate Amount" alt>
                      <Badge color={assessment.exudate.amount === 'heavy' ? 'red' : assessment.exudate.amount === 'moderate' ? 'amber' : assessment.exudate.amount === 'scant' ? 'blue' : 'gray'} variant="soft" radius="full" style={{ textTransform: 'capitalize' }}>
                        {assessment.exudate.amount}
                      </Badge>
                    </DataItemBadge>
                    <DataItemBadge label="Exudate Type">
                      <Badge variant="outline" color="gray" radius="full">{assessment.exudate.type}</Badge>
                    </DataItemBadge>
                  </Grid>
                  <Divider />
                  <Text size="1" color="blue" weight="bold" style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>Wound Bed</Text>
                  <Text size="2">{assessment.woundBed}</Text>
                  <Divider />
                  <Text size="1" color="blue" weight="bold" style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>Periwound Skin</Text>
                  <Text size="2">{assessment.periwoundSkin}</Text>
                </Flex>
              </Card>

              {/* Infection Assessment */}
              <Card variant="surface" mb="5">
                <Flex direction="column" gap="3" p="3">
                  <SectionHeading icon={<ExclamationTriangleIcon />} iconBg="#FFF7ED" iconColor="#ea580c" title="Infection Assessment" />
                  {hasInfection ? (
                    <>
                      <Callout.Root color="red" size="1" style={{ background: 'var(--red-2)' }}>
                        <Callout.Icon><ExclamationTriangleIcon /></Callout.Icon>
                        <Callout.Text>Signs of infection detected</Callout.Text>
                      </Callout.Root>
                      <Flex direction="column" gap="1">
                        {assessment.infectionSigns.map((sign, i) => (
                          <Flex key={i} gap="2" align="center">
                            <Box style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EF4444', flexShrink: 0 }} />
                            <Text size="2">{sign}</Text>
                          </Flex>
                        ))}
                      </Flex>
                    </>
                  ) : (
                    <Callout.Root color="green" size="1">
                      <Callout.Icon><CheckCircledIcon /></Callout.Icon>
                      <Callout.Text>No signs of infection observed</Callout.Text>
                    </Callout.Root>
                  )}
                </Flex>
              </Card>

              {/* Estimated Dimensions */}
              <Card variant="surface" mb="5">
                <Flex direction="column" gap="3" p="3">
                  <SectionHeading icon={<RulerSquareIcon />} iconBg="#F5F3FF" iconColor="#7c3aed" title="Estimated Dimensions" />
                  <Grid columns="3" gap="3">
                    {[
                      { label: 'Length', value: assessment.estimatedDimensions.lengthCm },
                      { label: 'Width', value: assessment.estimatedDimensions.widthCm },
                      { label: 'Depth', value: assessment.estimatedDimensions.depthCm },
                    ].map((dim) => (
                      <Flex key={dim.label} direction="column" align="center" gap="1" style={{ padding: 'var(--space-3)', backgroundColor: 'var(--gray-3)', borderRadius: 'var(--radius-3)' }}>
                        <Text size="5" weight="bold" color="blue">{dim.value}</Text>
                        <Text size="1" color="gray">{dim.label}</Text>
                      </Flex>
                    ))}
                  </Grid>
                  <Callout.Root color="amber" size="1">
                    <Callout.Icon><InfoCircledIcon /></Callout.Icon>
                    <Callout.Text>{assessment.estimatedDimensions.note}</Callout.Text>
                  </Callout.Root>
                </Flex>
              </Card>
            </Flex>
          </Tabs.Content>

          {/* ─── TAB 3: TREATMENTS ─── */}
          <Tabs.Content value="treatments">
            <Flex direction="column" gap="5" pt="4">
              {/* Immediate Actions */}
              <Card variant="surface" mb="5">
                <Flex direction="column" gap="3" p="3">
                  <SectionHeading icon={<LightningBoltIcon />} iconBg="#EFF6FF" iconColor="#185FA5" title="Immediate Actions" />
                  <Flex direction="column">
                    {assessment.immediateActions.map((action, i) => (
                      <Flex key={i} gap="3" align="start" mb="3">
                        <Box style={{
                          minWidth: '26px', height: '26px', borderRadius: '50%', background: '#185FA5', color: 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', flexShrink: 0, marginTop: '1px',
                        }}>
                          {i + 1}
                        </Box>
                        <Text size="2">{action}</Text>
                      </Flex>
                    ))}
                  </Flex>
                </Flex>
              </Card>

              {/* Dressing Recommendations */}
              <Card variant="surface" mb="5">
                <Flex direction="column" gap="3" p="3">
                  <SectionHeading icon={<HeartIcon />} iconBg="#F0FDF4" iconColor="#16a34a" title="Dressing Recommendations" />
                  <Flex direction="column" gap="2">
                    {assessment.dressingSuggestions.map((suggestion, i) => (
                      <Flex key={i} gap="2" align="start">
                        <CheckCircledIcon color="var(--green-9)" style={{ marginTop: 3, flexShrink: 0 }} />
                        <Text size="2">{suggestion}</Text>
                      </Flex>
                    ))}
                  </Flex>
                </Flex>
              </Card>

              {/* Follow-Up & Referrals */}
              <Card variant="surface" mb="5">
                <Flex direction="column" gap="3" p="3">
                  <SectionHeading icon={<CalendarIcon />} iconBg="#FFF7ED" iconColor="#ea580c" title="Follow-Up & Referrals" />
                  {/* Follow-up timeline callout */}
                  <Box style={{
                    background: 'linear-gradient(135deg, #FFF7ED, #FEF3C7)',
                    border: '1px solid #FCD34D',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    marginBottom: '8px',
                  }}>
                    <Flex align="center" gap="2" mb="1">
                      <ClockIcon style={{ color: '#D97706', width: 14, height: 14 }} />
                      <Text size="1" weight="bold" style={{ color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Follow-Up Timeline</Text>
                    </Flex>
                    <Text size="2" style={{ color: '#78350F' }}>{assessment.followUpTimeline}</Text>
                  </Box>
                  <Divider />
                  <Text size="1" weight="bold" color="blue" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Referral Recommendations</Text>
                  <Flex direction="column" gap="1">
                    {assessment.referralRecommendations.length > 0 ? (
                      assessment.referralRecommendations.map((ref, i) => (
                        <Flex key={i} gap="2" align="center">
                          <ArrowRightIcon color="var(--blue-9)" style={{ flexShrink: 0 }} />
                          <Text size="2">{ref}</Text>
                        </Flex>
                      ))
                    ) : (
                      <Text size="2" color="gray">No referrals needed at this time.</Text>
                    )}
                  </Flex>
                </Flex>
              </Card>

              {/* Additional Workup */}
              <Card variant="surface" mb="5">
                <Flex direction="column" gap="3" p="3">
                  <SectionHeading icon={<MixerHorizontalIcon />} iconBg="#F5F3FF" iconColor="#7c3aed" title="Additional Workup" />
                  {assessment.additionalWorkup.length > 0 ? (
                    <Flex direction="column" gap="1">
                      {assessment.additionalWorkup.map((item, i) => (
                        <Flex key={i} gap="2" align="center">
                          <Box style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--blue-9)', flexShrink: 0 }} />
                          <Text size="2">{item}</Text>
                        </Flex>
                      ))}
                    </Flex>
                  ) : (
                    <Text size="2" color="gray">No additional workup required at this time.</Text>
                  )}
                </Flex>
              </Card>

              {/* Disclaimer */}
              <Card variant="surface" className="print-disclaimer">
                <Flex gap="2" align="start" p="2">
                  <InfoCircledIcon color="var(--gray-8)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <Text size="1" color="gray">{assessment.disclaimer}</Text>
                </Flex>
              </Card>
            </Flex>
          </Tabs.Content>
        </Tabs.Root>
      </Card>

      {/* ═══ PRINT-ONLY FLAT LAYOUT ═══ */}
      <Box className="print-only-content">
        {/* 1. Wound Image */}
        <Box style={{ marginBottom: '16pt' }}>
          <img
            src={assessment.imageUrl}
            alt="Wound image"
            style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px', display: 'block' }}
          />
        </Box>

        {/* 2. Metadata Grid */}
        <Box style={{ marginBottom: '16pt' }}>
          <Heading size="4" className="print-section-heading">Wound Summary</Heading>
          <Grid columns="2" gap="3" style={{ rowGap: '10px' }}>
            <Box><Text size="1" weight="bold" style={labelStyle}>Onset Date</Text><Text size="2">{formatShortDate(assessment.analyzedAt)}</Text></Box>
            <Box><Text size="1" weight="bold" style={labelStyle}>Visit Date</Text><Text size="2">{formatShortDate(assessment.analyzedAt)}</Text></Box>
            <Box><Text size="1" weight="bold" style={labelStyle}>Length</Text><Text size="2">{assessment.estimatedDimensions.lengthCm}</Text></Box>
            <Box><Text size="1" weight="bold" style={labelStyle}>Width</Text><Text size="2">{assessment.estimatedDimensions.widthCm}</Text></Box>
            <Box style={{ gridColumn: 'span 2' }}><Text size="1" weight="bold" style={labelStyle}>Primary Location</Text><Text size="2">{assessment.woundType}</Text></Box>
            <Box><Text size="1" weight="bold" style={labelStyle}>Primary Type</Text><Text size="2" style={{ textTransform: 'capitalize' }}>{assessment.woundDepth.replace(/_/g, ' ')}</Text></Box>
            <Box><Text size="1" weight="bold" style={labelStyle}>Secondary Type</Text><Text size="2" style={{ textTransform: 'capitalize' }}>{assessment.healingPhase.replace(/_/g, ' ')}</Text></Box>
            <Box style={{ gridColumn: 'span 2' }}><Text size="1" weight="bold" style={labelStyle}>Color Composition</Text><Text size="2">{assessment.woundBed.split('.')[0].trim()}</Text></Box>
            <Box style={{ gridColumn: 'span 2' }}><Text size="1" weight="bold" style={labelStyle}>Diagnosis</Text><Text size="2">{assessment.diagnosis}</Text></Box>
            <Box style={{ gridColumn: 'span 2' }}><Text size="1" weight="bold" style={labelStyle}>Severity</Text><SeverityBadge severity={assessment.severity} /></Box>
          </Grid>
        </Box>

        {/* 3. Red Flags */}
        {hasRedFlags && (
          <Box style={{ borderLeft: '4px solid #EF4444', background: '#FEF2F2', padding: '12pt', marginBottom: '16pt', borderRadius: '4px' }}>
            <Text weight="bold" size="2" className="print-section-heading" style={{ color: '#991B1B', display: 'block', marginBottom: '6pt' }}>Red Flags Requiring Urgent Attention</Text>
            {assessment.redFlags.map((flag, i) => (
              <Text key={i} size="2" style={{ display: 'block', color: '#7F1D1D' }}>• {flag}</Text>
            ))}
          </Box>
        )}

        {/* 4. Clinical Diagnosis */}
        <Box style={{ marginBottom: '16pt' }}>
          <Heading size="4" className="print-section-heading">Clinical Diagnosis</Heading>
          <Text size="2" weight="bold" style={{ display: 'block', marginBottom: '4pt' }}>{assessment.diagnosis}</Text>
          <Divider />
          <Text size="1" weight="bold" style={{ ...labelStyle, marginTop: '8pt' }}>Probable Cause</Text>
          <Text size="2" style={{ display: 'block', marginBottom: '8pt' }}>{assessment.probableCause}</Text>
          <Text size="1" weight="bold" style={labelStyle}>Differential Diagnoses</Text>
          <Text size="2">{assessment.differentialDiagnosis.join(', ')}</Text>
        </Box>

        {/* 5. Wound Characteristics */}
        <Box style={{ marginBottom: '16pt' }}>
          <Heading size="4" className="print-section-heading">Wound Characteristics</Heading>
          <Grid columns="3" gap="3" style={{ marginBottom: '8pt' }}>
            <Box><Text size="1" weight="bold" style={labelStyle}>Wound Type</Text><Text size="2">{assessment.woundType}</Text></Box>
            <Box><Text size="1" weight="bold" style={labelStyle}>Wound Depth</Text><Text size="2" style={{ textTransform: 'capitalize' }}>{assessment.woundDepth.replace(/_/g, ' ')}</Text></Box>
            <Box><Text size="1" weight="bold" style={labelStyle}>Wound Stage</Text><Text size="2">{assessment.woundStage ?? 'Not staged'}</Text></Box>
            <Box><Text size="1" weight="bold" style={labelStyle}>Healing Phase</Text><Text size="2" style={{ textTransform: 'capitalize' }}>{assessment.healingPhase.replace(/_/g, ' ')}</Text></Box>
            <Box><Text size="1" weight="bold" style={labelStyle}>Exudate Amount</Text><Text size="2" style={{ textTransform: 'capitalize' }}>{assessment.exudate.amount}</Text></Box>
            <Box><Text size="1" weight="bold" style={labelStyle}>Exudate Type</Text><Text size="2" style={{ textTransform: 'capitalize' }}>{assessment.exudate.type}</Text></Box>
          </Grid>
          <Text size="1" weight="bold" style={labelStyle}>Wound Bed</Text>
          <Text size="2" style={{ display: 'block', marginBottom: '6pt' }}>{assessment.woundBed}</Text>
          <Text size="1" weight="bold" style={labelStyle}>Periwound Skin</Text>
          <Text size="2">{assessment.periwoundSkin}</Text>
        </Box>

        {/* 6. Infection Assessment */}
        <Box style={{ marginBottom: '16pt' }}>
          <Heading size="4" className="print-section-heading">Infection Assessment</Heading>
          {hasInfection ? (
            <Flex direction="column" gap="1">
              <Text size="2" weight="bold" style={{ color: '#DC2626', display: 'block', marginBottom: '4pt' }}>Signs of infection detected:</Text>
              {assessment.infectionSigns.map((sign, i) => (
                <Text key={i} size="2" style={{ display: 'block' }}>• {sign}</Text>
              ))}
            </Flex>
          ) : (
            <Text size="2" color="green">No signs of infection observed</Text>
          )}
        </Box>

        {/* 7. Estimated Dimensions */}
        <Box style={{ marginBottom: '16pt' }}>
          <Heading size="4" className="print-section-heading">Estimated Dimensions</Heading>
          <Flex gap="4">
            {[
              { label: 'Length', value: assessment.estimatedDimensions.lengthCm },
              { label: 'Width', value: assessment.estimatedDimensions.widthCm },
              { label: 'Depth', value: assessment.estimatedDimensions.depthCm },
            ].map((dim) => (
              <Box key={dim.label} style={{ textAlign: 'center', padding: '8pt 16pt', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
                <Text size="4" weight="bold" style={{ display: 'block' }}>{dim.value}</Text>
                <Text size="1" color="gray">{dim.label}</Text>
              </Box>
            ))}
          </Flex>
          <Text size="1" color="gray" style={{ display: 'block', marginTop: '6pt' }}>{assessment.estimatedDimensions.note}</Text>
        </Box>

        {/* 8. Immediate Actions */}
        <Box style={{ marginBottom: '16pt' }}>
          <Heading size="4" className="print-section-heading">Immediate Actions</Heading>
          {assessment.immediateActions.map((action, i) => (
            <Text key={i} size="2" style={{ display: 'block', marginBottom: '4pt' }}>{i + 1}. {action}</Text>
          ))}
        </Box>

        {/* 9. Dressing Recommendations */}
        <Box style={{ marginBottom: '16pt' }}>
          <Heading size="4" className="print-section-heading">Dressing Recommendations</Heading>
          {assessment.dressingSuggestions.map((s, i) => (
            <Text key={i} size="2" style={{ display: 'block', marginBottom: '4pt' }}>✓ {s}</Text>
          ))}
        </Box>

        {/* 10. Follow-Up & Referrals */}
        <Box style={{ marginBottom: '16pt' }}>
          <Heading size="4" className="print-section-heading">Follow-Up & Referrals</Heading>
          <Text size="1" weight="bold" style={labelStyle}>Follow-Up Timeline</Text>
          <Text size="2" style={{ display: 'block', marginBottom: '8pt' }}>{assessment.followUpTimeline}</Text>
          <Text size="1" weight="bold" style={labelStyle}>Referral Recommendations</Text>
          {assessment.referralRecommendations.length > 0 ? (
            assessment.referralRecommendations.map((ref, i) => (
              <Text key={i} size="2" style={{ display: 'block', marginBottom: '2pt' }}>→ {ref}</Text>
            ))
          ) : (
            <Text size="2" color="gray">No referrals needed at this time.</Text>
          )}
        </Box>

        {/* 11. Additional Workup */}
        <Box style={{ marginBottom: '16pt' }}>
          <Heading size="4" className="print-section-heading">Additional Workup</Heading>
          {assessment.additionalWorkup.length > 0 ? (
            assessment.additionalWorkup.map((item, i) => (
              <Text key={i} size="2" style={{ display: 'block', marginBottom: '2pt' }}>• {item}</Text>
            ))
          ) : (
            <Text size="2" color="gray">No additional workup required at this time.</Text>
          )}
        </Box>

        {/* 12. Disclaimer */}
        <Box style={{ borderTop: '1px solid #d1d5db', paddingTop: '8pt', marginTop: '16pt' }}>
          <Text size="1" color="gray">{assessment.disclaimer}</Text>
        </Box>
      </Box>
    </Flex>
  )
}
