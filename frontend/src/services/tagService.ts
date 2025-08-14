import api from './api'
import type { Tag, TagCreate, ApiResponse } from '../types'

export const tagService = {
  // Get all user tags
  async getTags(): Promise<Tag[]> {
    const response = await api.get<ApiResponse<Tag[]>>('/etiquetas')
    return response.data.data
  },

  // Get a tag by ID
  async getTag(id: number): Promise<Tag> {
    const response = await api.get<ApiResponse<Tag>>(`/etiquetas/${id}`)
    return response.data.data
  },

  // Create a new tag
  async createTag(tag: TagCreate): Promise<Tag> {
    const response = await api.post<ApiResponse<Tag>>('/etiquetas', tag)
    return response.data.data
  },

  // Update a tag
  async updateTag(id: number, tag: Partial<TagCreate>): Promise<Tag> {
    const response = await api.put<ApiResponse<Tag>>(`/etiquetas/${id}`, tag)
    return response.data.data
  },

  // Delete a tag
  async deleteTag(id: number): Promise<void> {
    await api.delete(`/etiquetas/${id}`)
  },
}
