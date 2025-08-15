import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './hooks/useAuth'
import { DashboardPage, LoginPage, RegisterPage, TasksPage } from '@/pages'
import { Spinner } from './components/common'
import { ErrorBoundary } from './components/common/ErrorBoundary'

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
    <ErrorBoundary>
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
          <Route
            path='/tasks'
            element={
              <ProtectedRoute>
                <TasksPage />
              </ProtectedRoute>
            }
          />

          {/* 404 route */}
          <Route path='*' element={<Navigate to='/dashboard' replace />} />
        </Routes>

        {/* Global notification system */}
        <Toaster
          position='top-right'
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--color-bg-primary)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-sm)',
            },
            success: {
              style: {
                border: '1px solid var(--color-success)',
              },
              iconTheme: {
                primary: 'var(--color-success)',
                secondary: 'var(--color-bg-primary)',
              },
            },
            error: {
              style: {
                border: '1px solid var(--color-danger)',
              },
              iconTheme: {
                primary: 'var(--color-danger)',
                secondary: 'var(--color-bg-primary)',
              },
            },
          }}
        />
      </>
    </ErrorBoundary>
  )
}

export default App
