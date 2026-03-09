import { Card } from '@radix-ui/themes'
import PageHeader from '@/components/layout/PageHeader'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function AssessmentResultPage() {
  return (
    <>
      <PageHeader title="Assessment Result" />
      <Card size="3">
        <LoadingSpinner label="Assessment loading..." />
      </Card>
    </>
  )
}
