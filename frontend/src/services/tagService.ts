import api from './api'
import type { Tag, TagCreate, ApiResponse } from '../types'

export const tagService = {
  // Get all user tags
  async getTags(): Promise<Tag[]> {
    const response =
      await api.get<ApiResponse<{ tags: Tag[]; total: number }>>('/tags')
    return response.data.data.tags
  },

  // Get a tag by ID
  async getTag(id: number): Promise<Tag> {
    const response = await api.get<ApiResponse<Tag>>(`/tags/${id}`)
    return response.data.data
  },

  // Create a new tag
  async createTag(tag: TagCreate): Promise<Tag> {
    const response = await api.post<ApiResponse<Tag>>('/tags', tag)
    return response.data.data
  },

  // Update a tag
  async updateTag(id: number, tag: Partial<TagCreate>): Promise<Tag> {
    const response = await api.put<ApiResponse<Tag>>(`/tags/${id}`, tag)
    return response.data.data
  },

  // Delete a tag
  async deleteTag(id: number): Promise<void> {
    await api.delete(`/tags/${id}`)
  },
}
