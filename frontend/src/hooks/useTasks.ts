import { useState, useEffect, useCallback, useRef } from 'react'
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

let tempIdCounter = -1 // Para ids temporales únicos

export const useTasks = (options: UseTasksOptions = {}) => {
  const {
    autoFetch = true,
    initialFilters = {},
    initialPagination = {},
  } = options
  const { addNotification } = useNotifications()

  // Use ref to avoid including initialFilters in dependencies
  const initialFiltersRef = useRef(initialFilters)
  initialFiltersRef.current = initialFilters

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

        const params = { ...initialFiltersRef.current, ...filters }
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
    [addNotification]
  )

  const createTask = async (task: TaskCreate) => {
    // Crear tarea optimista con id temporal
    const optimisticTask: Task = {
      id: tempIdCounter--,
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      due_date: task.due_date || '',
      completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: [],
      category: undefined,
      category_id: task.category_id,
      user_id: 0,
    }

    setTasks((prev) => [optimisticTask, ...prev])
    try {
      setLoading(true)
      const newTask = await taskService.createTask(task)
      // Reemplazar la tarea temporal por la real
      if (newTask) {
        setTasks((prev) => [
          newTask,
          ...prev.filter((t) => t.id !== optimisticTask.id),
        ])
      }

      addNotification({
        type: 'success',
        title: 'Task created',
        message: `Task "${newTask.title}" has been created successfully`,
      })
    } catch (err: unknown) {
      // Rollback: eliminar la tarea optimista
      setTasks((prev) => prev.filter((t) => t.id !== optimisticTask.id))
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
    // Optimista: eliminar de inmediato y guardar referencia para rollback
    let removedTask: Task | undefined
    setTasks((prev) => {
      removedTask = prev.find((t) => t.id === id)
      return prev.filter((t) => t.id !== id)
    })
    try {
      setLoading(true)
      await taskService.deleteTask(id)
      addNotification({
        type: 'success',
        title: 'Task deleted',
        message: 'Task has been deleted successfully',
      })
    } catch (err: unknown) {
      // Rollback: restaurar la tarea eliminada
      if (removedTask) {
        setTasks((prev) => [removedTask!, ...prev])
      }
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
