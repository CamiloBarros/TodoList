import React, { useState, useEffect } from 'react'
import { Navbar } from '../common'
import styles from './DashboardLayout.module.css'

interface DashboardLayoutProps {
  children: React.ReactNode
  onCreateTask?: () => void
  pendingCount?: number
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  onCreateTask,
  pendingCount = 0,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Check for saved theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      setIsDarkMode(true)
      document.documentElement.setAttribute('data-theme', 'dark')
    }
  }, [])

  const handleToggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)

    if (newTheme) {
      document.documentElement.setAttribute('data-theme', 'dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <div className={styles.dashboardLayout}>
      <Navbar
        onCreateTask={onCreateTask}
        onToggleTheme={handleToggleTheme}
        isDarkMode={isDarkMode}
        pendingCount={pendingCount}
      />
      <main className={styles.mainContent}>{children}</main>
    </div>
  )
}
