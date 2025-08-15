import axios from 'axios'
import type { AxiosResponse, AxiosError } from 'axios'
import type { ApiResponse, ApiError } from '../types'

// Axios base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor to include token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor to handle responses and errors
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    return response
  },
  (error: AxiosError<ApiError>) => {
    // Only redirect to login if it's a 401 error AND it's NOT a login/register request
    if (error.response?.status === 401) {
      const isAuthRequest =
        error.config?.url?.includes('/auth/login') ||
        error.config?.url?.includes('/auth/register')

      // If it's NOT an auth request (login/register), then it's likely an expired token
      if (!isAuthRequest) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
      // If it IS an auth request, just let the error propagate normally
      // without redirecting (let the login form handle the error)
    }

    return Promise.reject(error)
  }
)

export default api
