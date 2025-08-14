import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { NotificationContainer } from './components/ui'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import DashboardPage from './pages/Dashboard'
import { Spinner } from './components/ui'

// Component for protected routes
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <Spinner fullscreen text='Loading...' />
  }

  return isAuthenticated ? <>{children}</> : <Navigate to='/login' replace />
}

// Component for public routes (unauthenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <Spinner fullscreen text='Loading...' />
  }

  return !isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to='/dashboard' replace />
  )
}

function App() {
  return (
    <>
      <Routes>
        {/* Root route */}
        <Route path='/' element={<Navigate to='/dashboard' replace />} />

        {/* Public routes */}
        <Route
          path='/login'
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path='/register'
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path='/dashboard/*'
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* 404 route */}
        <Route path='*' element={<Navigate to='/dashboard' replace />} />
      </Routes>

      {/* Global notification system */}
      <NotificationContainer />
    </>
  )
}

export default App
