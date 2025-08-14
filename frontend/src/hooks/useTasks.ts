import { useState, useEffect, useCallback } from 'react'
import { taskService } from '../services'
import { useNotifications } from './useNotifications'
import { getErrorMessage } from '../utils/helpers'
import type {
  Task,
  TaskCreate,
  TaskUpdate,
  TaskFilters,
  PaginationParams,
} from '../types'

interface UseTasksOptions {
  autoFetch?: boolean
  initialFilters?: TaskFilters
  initialPagination?: PaginationParams
}

export const useTasks = (options: UseTasksOptions = {}) => {
  const {
    autoFetch = true,
    initialFilters = {},
    initialPagination = {},
  } = options
  const { addNotification } = useNotifications()

  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    ...initialPagination,
  })

  const fetchTasks = useCallback(
    async (filters?: TaskFilters & PaginationParams) => {
      try {
        setLoading(true)
        setError(null)

        const params = { ...initialFilters, ...filters }
        const response = await taskService.getTasks(params)

        setTasks(response.data)
        setPagination({
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        })
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(err)
        setError(errorMessage)
        addNotification({
          type: 'error',
          title: 'Error',
          message: errorMessage,
        })
      } finally {
        setLoading(false)
      }
    },
    [initialFilters, addNotification]
  )

  const createTask = async (task: TaskCreate) => {
    try {
      setLoading(true)
      const newTask = await taskService.createTask(task)
      setTasks((prev) => [newTask, ...prev])

      addNotification({
        type: 'success',
        title: 'Task created',
        message: `Task "${newTask.title}" has been created successfully`,
      })
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err)
      addNotification({
        type: 'error',
        title: 'Error',
        message: errorMessage,
      })
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateTask = async (id: number, task: TaskUpdate) => {
    try {
      setLoading(true)
      const updatedTask = await taskService.updateTask(id, task)
      setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)))

      addNotification({
        type: 'success',
        title: 'Task updated',
        message: `Task "${updatedTask.title}" has been updated`,
      })
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err)
      addNotification({
        type: 'error',
        title: 'Error',
        message: errorMessage,
      })
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteTask = async (id: number) => {
    try {
      setLoading(true)
      await taskService.deleteTask(id)
      setTasks((prev) => prev.filter((t) => t.id !== id))

      addNotification({
        type: 'success',
        title: 'Task deleted',
        message: 'Task has been deleted successfully',
      })
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err)
      addNotification({
        type: 'error',
        title: 'Error',
        message: errorMessage,
      })
      throw err
    } finally {
      setLoading(false)
    }
  }

  const toggleTask = async (id: number) => {
    try {
      const updatedTask = await taskService.toggleTask(id)
      setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)))

      const message = updatedTask.completed ? 'completed' : 'marked as pending'
      addNotification({
        type: 'success',
        title: 'Task updated',
        message: `Task "${updatedTask.title}" has been ${message}`,
      })
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err)
      addNotification({
        type: 'error',
        title: 'Error',
        message: errorMessage,
      })
      throw err
    }
  }

  useEffect(() => {
    if (autoFetch) {
      fetchTasks()
    }
  }, [autoFetch, fetchTasks])

  return {
    tasks,
    loading,
    error,
    pagination,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
  }
}
