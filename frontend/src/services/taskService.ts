import api from './api'
import type {
  Task,
  TaskCreate,
  TaskUpdate,
  TaskFilters,
  PaginationParams,
  PaginatedResponse,
  Statistics,
  ApiResponse,
} from '../types'

export const taskService = {
  // Get all tasks with filters and pagination
  async getTasks(
    params?: TaskFilters & PaginationParams
  ): Promise<PaginatedResponse<Task>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Task>>>(
      '/tareas',
      { params }
    )
    return response.data.data
  },

  // Get a task by ID
  async getTask(id: number): Promise<Task> {
    const response = await api.get<ApiResponse<Task>>(`/tareas/${id}`)
    return response.data.data
  },

  // Create a new task
  async createTask(task: TaskCreate): Promise<Task> {
    const response = await api.post<ApiResponse<Task>>('/tareas', task)
    return response.data.data
  },

  // Update a task
  async updateTask(id: number, task: TaskUpdate): Promise<Task> {
    const response = await api.put<ApiResponse<Task>>(`/tareas/${id}`, task)
    return response.data.data
  },

  // Delete a task
  async deleteTask(id: number): Promise<void> {
    await api.delete(`/tareas/${id}`)
  },

  // Toggle task completion status
  async toggleTask(id: number): Promise<Task> {
    const response = await api.patch<ApiResponse<Task>>(`/tareas/${id}/toggle`)
    return response.data.data
  },

  // Get user statistics
  async getStatistics(): Promise<Statistics> {
    const response = await api.get<ApiResponse<Statistics>>(
      '/tareas/estadisticas'
    )
    return response.data.data
  },
}
