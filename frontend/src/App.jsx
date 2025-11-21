import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ApiKeysPage from './pages/ApiKeysPage'
import PlaygroundPage from './pages/PlaygroundPage'
import AnalyticsPage from './pages/AnalyticsPage'
import WebhooksPage from './pages/WebhooksPage'
import BillingPage from './pages/BillingPage'
import SettingsPage from './pages/SettingsPage'

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return isAuthenticated ? children : <Navigate to="/login" />
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/api-keys" element={<ApiKeysPage />} />
                  <Route path="/playground" element={<PlaygroundPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/webhooks" element={<WebhooksPage />} />
                  <Route path="/billing" element={<BillingPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
