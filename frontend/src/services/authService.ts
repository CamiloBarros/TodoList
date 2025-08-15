import api from './api'
import type {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  User,
  ApiResponse,
} from '../types'

export const authService = {
  // User registration
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>(
      '/auth/register',
      credentials
    )
    return response.data.data
  },

  // User login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      credentials
    )
    return response.data.data
  },

  // Get user profile
  async getProfile(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/auth/profile')
    return response.data.data
  },

  // Logout (client side)
  logout(): void {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  // Check if there's a valid token
  getToken(): string | null {
    return localStorage.getItem('token')
  },

  // Get user from localStorage
  getUser(): User | null {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  // Save authentication data
  saveAuthData(authData: AuthResponse): void {
    localStorage.setItem('token', authData.token)
    localStorage.setItem('user', JSON.stringify(authData.user))
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken()
    const user = this.getUser()
    return !!(token && user)
  },
}
