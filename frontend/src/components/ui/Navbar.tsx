import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Menu,
  X,
  Home,
  CheckSquare,
  Folder,
  Tags,
  BarChart3,
  Settings,
  User,
  LogOut,
  Moon,
  Sun,
  Bell,
  Search,
  Plus,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import Button from './Button'
import styles from './Navbar.module.css'

interface NavItem {
  icon: React.ElementType
  label: string
  path: string
  count?: number
  isActive?: boolean
}

interface NavbarProps {
  onCreateTask?: () => void
  onToggleTheme?: () => void
  isDarkMode?: boolean
  pendingCount?: number
}

export const Navbar: React.FC<NavbarProps> = ({
  onCreateTask,
  onToggleTheme,
  isDarkMode = false,
  pendingCount = 0,
}) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const profileMenuRef = useRef<HTMLDivElement>(null)

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navigationItems: NavItem[] = [
    {
      icon: Home,
      label: 'Dashboard',
      path: '/dashboard',
      isActive: location.pathname === '/dashboard',
    },
    {
      icon: CheckSquare,
      label: 'Tasks',
      path: '/tasks',
      count: pendingCount,
      isActive: location.pathname === '/tasks',
    },
    {
      icon: Folder,
      label: 'Categories',
      path: '/dashboard/categories',
      isActive: location.pathname.includes('/categories'),
    },
    {
      icon: Tags,
      label: 'Tags',
      path: '/dashboard/tags',
      isActive: location.pathname.includes('/tags'),
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      path: '/dashboard/analytics',
      isActive: location.pathname.includes('/analytics'),
    },
  ]

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      logout()
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery)
  }

  return (
    <nav className={styles.navbar}>
      {/* Desktop Navigation */}
      <div className={styles.desktopNav}>
        {/* Brand Section */}
        <div className={styles.brand}>
          <Link to='/dashboard' className={styles.brandLink}>
            <CheckSquare className={styles.brandIcon} size={28} />
            <span className={styles.brandText}>TodoApp</span>
          </Link>
          <span className={styles.brandSubtext}>Pro</span>
        </div>

        {/* Main Navigation Links */}
        <div className={styles.navLinks}>
          {navigationItems.map((item) => {
            const IconComponent = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`${styles.navLink} ${
                  item.isActive ? styles.navLinkActive : ''
                }`}
              >
                <IconComponent size={20} />
                <span>{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className={styles.badge}>{item.count}</span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Search Bar */}
        <div className={styles.searchSection}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.searchWrapper}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type='text'
                placeholder='Search tasks...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </form>
        </div>

        {/* Right Section */}
        <div className={styles.rightSection}>
          {/* Quick Actions */}
          <div className={styles.quickActions}>
            <Button
              onClick={onCreateTask}
              variant='primary'
              size='sm'
              className={styles.createButton}
            >
              <Plus size={16} />
              <span className={styles.createButtonText}>New Task</span>
            </Button>

            <button
              onClick={onToggleTheme}
              className={styles.iconButton}
              title={
                isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'
              }
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button className={styles.iconButton} title='Notifications'>
              <Bell size={18} />
              <span className={styles.notificationBadge}>3</span>
            </button>
          </div>

          {/* User Profile */}
          <div className={styles.profileSection} ref={profileMenuRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className={styles.profileButton}
            >
              <div className={styles.userAvatar}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user?.name || 'User'}</span>
                <span className={styles.userEmail}>{user?.email}</span>
              </div>
            </button>

            {/* Profile Dropdown */}
            {isProfileMenuOpen && (
              <div className={styles.profileDropdown}>
                <Link
                  to='/dashboard/profile'
                  className={styles.dropdownItem}
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  <User size={16} />
                  Profile
                </Link>
                <Link
                  to='/dashboard/settings'
                  className={styles.dropdownItem}
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  <Settings size={16} />
                  Settings
                </Link>
                <hr className={styles.dropdownSeparator} />
                <button
                  onClick={handleLogout}
                  className={`${styles.dropdownItem} ${styles.logoutItem}`}
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={styles.mobileNav}>
        {/* Mobile Header */}
        <div className={styles.mobileHeader}>
          <Link to='/dashboard' className={styles.mobileBrand}>
            <CheckSquare size={24} />
            <span>TodoApp</span>
          </Link>

          <div className={styles.mobileActions}>
            <button
              onClick={onCreateTask}
              className={styles.mobileCreateButton}
              title='Create Task'
            >
              <Plus size={20} />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={styles.mobileMenuButton}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className={styles.mobileMenuOverlay}>
            <div className={styles.mobileMenuContent}>
              {/* User Section */}
              <div className={styles.mobileUserSection}>
                <div className={styles.mobileUserAvatar}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className={styles.mobileUserInfo}>
                  <span className={styles.mobileUserName}>
                    {user?.name || 'User'}
                  </span>
                  <span className={styles.mobileUserEmail}>{user?.email}</span>
                </div>
              </div>

              {/* Search */}
              <div className={styles.mobileSearchSection}>
                <form
                  onSubmit={handleSearch}
                  className={styles.mobileSearchForm}
                >
                  <div className={styles.mobileSearchWrapper}>
                    <Search size={18} className={styles.mobileSearchIcon} />
                    <input
                      type='text'
                      placeholder='Search tasks...'
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={styles.mobileSearchInput}
                    />
                  </div>
                </form>
              </div>

              {/* Navigation Links */}
              <div className={styles.mobileNavLinks}>
                {navigationItems.map((item) => {
                  const IconComponent = item.icon
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`${styles.mobileNavLink} ${
                        item.isActive ? styles.mobileNavLinkActive : ''
                      }`}
                    >
                      <IconComponent size={20} />
                      <span>{item.label}</span>
                      {item.count !== undefined && item.count > 0 && (
                        <span className={styles.mobileBadge}>{item.count}</span>
                      )}
                    </Link>
                  )
                })}
              </div>

              {/* Mobile Actions */}
              <div className={styles.mobileActionsSection}>
                <button
                  onClick={onToggleTheme}
                  className={styles.mobileActionButton}
                >
                  {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                  {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
                <button className={styles.mobileActionButton}>
                  <Bell size={18} />
                  Notifications
                  <span className={styles.mobileBadge}>3</span>
                </button>
                <Link
                  to='/dashboard/profile'
                  className={styles.mobileActionButton}
                >
                  <User size={18} />
                  Profile
                </Link>
                <Link
                  to='/dashboard/settings'
                  className={styles.mobileActionButton}
                >
                  <Settings size={18} />
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className={`${styles.mobileActionButton} ${styles.mobileLogoutButton}`}
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
