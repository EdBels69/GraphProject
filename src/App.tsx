import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import ErrorBoundary from '@/components/ErrorBoundary'
import AppHealthCheck from '@/components/AppHealthCheck'
import { ToastProvider } from '@/contexts/ToastContext'
import ToastContainer from '@/components/ui/Toast'

// New Elicit-style pages (no sidebar)
import HomePage from '@/pages/HomePage'
import PapersPage from '@/pages/PapersPage'
import AnalysisConfigPage from '@/pages/AnalysisConfigPage'
import GraphViewPage from '@/pages/GraphViewPage'
import AIAnalysisPage from '@/pages/AIAnalysisPage'
import SettingsPage from '@/pages/SettingsPage'

// Legacy pages (with sidebar) - kept for compatibility
import FileUploadPage from '@/pages/FileUploadPage'
import AIAssistantPage from '@/pages/AIAssistantPage'
import WorkListPage from '@/pages/WorkListPage'
import GraphAnalysisPage from '@/pages/GraphAnalysisPage'
import GraphDataPage from '@/pages/GraphDataPage'
import ReportPage from '@/pages/ReportPage'
import SearchPage from '@/pages/SearchPage'
import ResearchPage from '@/pages/ResearchPage'
import HealthDashboardPage from '@/pages/HealthDashboardPage'

import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import LoginPage from '@/pages/LoginPage'

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <div className="relative">
            <ErrorBoundary>
              <AppHealthCheck />
              <Routes>
                <Route path="/login" element={<LoginPage />} />

                {/* Unified Bio-Digital Layout */}
                <Route element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }>
                  {/* Core Flows */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/research/:id/papers" element={<PapersPage />} />
                  <Route path="/research/:id/config" element={<AnalysisConfigPage />} />
                  <Route path="/research/:id/graph" element={<GraphViewPage />} />
                  <Route path="/research/:id/ai" element={<AIAnalysisPage />} />
                  <Route path="/settings" element={<SettingsPage />} />

                  {/* Main Utilities */}
                  <Route path="/upload" element={<FileUploadPage />} />
                  <Route path="/ai-assistant" element={<AIAssistantPage />} />
                  <Route path="/works" element={<WorkListPage />} />
                  <Route path="/analysis" element={<GraphAnalysisPage />} />
                  <Route path="/analysis/data/:id?" element={<GraphDataPage />} />
                  <Route path="/report/:id?" element={<ReportPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/research" element={<ResearchPage />} />
                  <Route path="/health" element={<HealthDashboardPage />} />
                </Route>
              </Routes>
            </ErrorBoundary>
            <ToastContainer />
          </div>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App

