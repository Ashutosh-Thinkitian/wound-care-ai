import { Routes, Route } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import MobileLayout from '@/components/layout/MobileLayout'
import DashboardPage from '@/pages/DashboardPage'
import SessionPage from '@/pages/SessionPage'
import MobileCapturePage from '@/pages/MobileCapturePage'
import AssessmentResultPage from '@/pages/AssessmentResultPage'

export default function App() {
  return (
    <Routes>
      {/* Provider routes — wrapped in AppLayout */}
      <Route path="/" element={<AppLayout><DashboardPage /></AppLayout>} />
      <Route path="/session/:sessionId" element={<AppLayout><SessionPage /></AppLayout>} />
      <Route path="/assessment/:assessmentId" element={<AppLayout><AssessmentResultPage /></AppLayout>} />

      {/* Mobile route — wrapped in MobileLayout (no sidebar) */}
      <Route path="/capture/:sessionId" element={<MobileLayout><MobileCapturePage /></MobileLayout>} />
    </Routes>
  )
}
