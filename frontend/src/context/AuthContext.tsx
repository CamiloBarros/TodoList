import React, { createContext, useState, useEffect } from 'react'
import type {
  AuthContextType,
  LoginCredentials,
  RegisterCredentials,
  User,
} from '../types'
import { authService } from '../services'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const isAuthenticated = !!(user && token)

  // Initialize state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = authService.getToken()
        const savedUser = authService.getUser()

        if (savedToken && savedUser) {
          setToken(savedToken)
          setUser(savedUser)

          // Verify that the token is still valid
          try {
            const currentUser = await authService.getProfile()
            setUser(currentUser)
          } catch (error) {
            // Invalid token, clear state
            console.error('Invalid token:', error)
            logout()
          }
        }
      } catch (error) {
        console.error('Error initializing authentication:', error)
        logout()
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setLoading(true)
      const authData = await authService.login(credentials)

      setToken(authData.token)
      setUser(authData.user)
      authService.saveAuthData(authData)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (credentials: RegisterCredentials): Promise<void> => {
    try {
      setLoading(true)
      const authData = await authService.register(credentials)

      setToken(authData.token)
      setUser(authData.user)
      authService.saveAuthData(authData)
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = (): void => {
    setToken(null)
    setUser(null)
    authService.logout()
  }

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthContext }
