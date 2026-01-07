import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import ErrorBoundary from '@/components/ErrorBoundary'
import AppHealthCheck from '@/components/AppHealthCheck'
import LandingPage from '@/pages/LandingPage'
import FileUploadPage from '@/pages/FileUploadPage'
import AIAssistantPage from '@/pages/AIAssistantPage'
import WorkListPage from '@/pages/WorkListPage'
import GraphAnalysisPage from '@/pages/GraphAnalysisPage'
import ReportPage from '@/pages/ReportPage'

function App() {
  return (
    <BrowserRouter>
      <div className="relative">
        <ErrorBoundary>
          <AppHealthCheck />
          <Layout>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/upload" element={<FileUploadPage />} />
              <Route path="/ai-assistant" element={<AIAssistantPage />} />
              <Route path="/works" element={<WorkListPage />} />
              <Route path="/analysis" element={<GraphAnalysisPage />} />
              <Route path="/report" element={<ReportPage />} />
            </Routes>
          </Layout>
        </ErrorBoundary>
      </div>
    </BrowserRouter>
  )
}

export default App
