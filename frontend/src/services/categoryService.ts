import api from './api'
import type { Category, CategoryCreate, ApiResponse } from '../types'

export const categoryService = {
  // Get all user categories
  async getCategories(): Promise<Category[]> {
    const response = await api.get<ApiResponse<Category[]>>('/categories')
    return response.data.data
  },

  // Get a category by ID
  async getCategory(id: number): Promise<Category> {
    const response = await api.get<ApiResponse<Category>>(`/categories/${id}`)
    return response.data.data
  },

  // Create a new category
  async createCategory(category: CategoryCreate): Promise<Category> {
    const response = await api.post<ApiResponse<Category>>(
      '/categories',
      category
    )
    return response.data.data
  },

  // Update a category
  async updateCategory(
    id: number,
    category: Partial<CategoryCreate>
  ): Promise<Category> {
    const response = await api.put<ApiResponse<Category>>(
      `/categories/${id}`,
      category
    )
    return response.data.data
  },

  // Delete a category
  async deleteCategory(id: number): Promise<void> {
    await api.delete(`/categories/${id}`)
  },
}
