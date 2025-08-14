// Utility to extract error messages from the API
export const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const apiError = error as {
      response?: {
        data?: {
          message?: string
        }
      }
    }
    return apiError.response?.data?.message || 'An error occurred'
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'An unknown error occurred'
}

// Utility to format dates
export const formatDate = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Utility to format date and time
export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Utility to get priority color
export const getPriorityColor = (
  priority: 'low' | 'medium' | 'high'
): string => {
  switch (priority) {
    case 'high':
      return '#ef4444' // red-500
    case 'medium':
      return '#f59e0b' // amber-500
    case 'low':
      return '#10b981' // emerald-500
    default:
      return '#6b7280' // gray-500
  }
}

// Utility to get priority text
export const getPriorityText = (
  priority: 'low' | 'medium' | 'high'
): string => {
  switch (priority) {
    case 'high':
      return 'High'
    case 'medium':
      return 'Medium'
    case 'low':
      return 'Low'
    default:
      return 'No priority'
  }
}

// Utility to generate random colors for categories/tags
export const generateRandomColor = (): string => {
  const colors = [
    '#ef4444',
    '#f97316',
    '#f59e0b',
    '#eab308',
    '#84cc16',
    '#22c55e',
    '#10b981',
    '#14b8a6',
    '#06b6d4',
    '#0ea5e9',
    '#3b82f6',
    '#6366f1',
    '#8b5cf6',
    '#a855f7',
    '#d946ef',
    '#ec4899',
    '#f43f5e',
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// Utility to validate email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Utility for debounce (useful for searches)
export const debounce = <T extends unknown[]>(
  func: (...args: T) => void,
  wait: number
): ((...args: T) => void) => {
  let timeout: NodeJS.Timeout
  return (...args: T) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Utility to check if a task is overdue
export const isTaskOverdue = (task: {
  due_date?: string
  completed: boolean
}): boolean => {
  if (!task.due_date || task.completed) {
    return false
  }
  return new Date(task.due_date) < new Date()
}
