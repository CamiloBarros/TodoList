// Types for authentication API
export interface User {
  id: number
  name: string
  email: string
  created_at: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: User
}

// Types for categories
export interface Category {
  id: number
  name: string
  description?: string
  color?: string
  user_id: number
  created_at: string
}

export interface CategoryCreate {
  name: string
  description?: string
  color?: string
}

// Types for tags
export interface Tag {
  id: number
  name: string
  color?: string
  user_id: number
  created_at: string
}

export interface TagCreate {
  name: string
  color?: string
}

// Types for tasks
export interface Task {
  id: number
  title: string
  description?: string
  completed: boolean
  due_date?: string
  priority: 'low' | 'medium' | 'high'
  category_id?: number
  user_id: number
  created_at: string
  updated_at: string
  category?: Category
  tags?: Tag[]
}

export interface TaskCreate {
  title: string
  description?: string
  due_date?: string
  priority: 'low' | 'medium' | 'high'
  category_id?: number
  tags?: number[]
}

export interface TaskUpdate {
  title?: string
  description?: string
  completed?: boolean
  due_date?: string
  priority?: 'low' | 'medium' | 'high'
  category_id?: number
  tags?: number[]
}

// Types for filters and queries
export interface TaskFilters {
  category_id?: number // deprecated, use 'category' for backend compatibility
  category?: number // para el backend
  completed?: boolean
  priority?: 'low' | 'medium' | 'high'
  tag_id?: number // deprecated, use 'tags' for backend compatibility
  tags?: string // IDs separados por coma, para el backend
  date_from?: string
  date_to?: string
  search?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Types for statistics
export interface Statistics {
  total_tasks: number
  completed_tasks: number
  pending_tasks: number
  overdue_tasks: number
  tasks_by_priority: {
    high: number
    medium: number
    low: number
  }
  tasks_by_category: Array<{
    category: string
    count: number
  }>
}

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
}

export interface ApiError {
  success: false
  message: string
  errors?: Record<string, string[]>
}

// Types for application context
export interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  logout: () => void
  loading: boolean
}

export interface TaskContextType {
  tasks: Task[]
  loading: boolean
  error: string | null
  fetchTasks: (filters?: TaskFilters & PaginationParams) => Promise<void>
  createTask: (task: TaskCreate) => Promise<void>
  updateTask: (id: number, task: TaskUpdate) => Promise<void>
  deleteTask: (id: number) => Promise<void>
  toggleTask: (id: number) => Promise<void>
}

// Types for form state
export interface FormState {
  loading: boolean
  error: string | null
  success: boolean
}

// Types for UI components
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

export interface InputProps {
  type?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
  label?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export interface SelectProps {
  options: Array<{ value: string | number; label: string }>
  value?: string | number
  onChange?: (value: string | number) => void
  placeholder?: string
  error?: string
  label?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

// Types for notifications
export interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
}

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}
