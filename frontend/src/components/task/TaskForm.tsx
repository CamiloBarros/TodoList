import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Plus } from 'lucide-react'
import { Input, Select, Button } from '../ui'
import { categoryService, tagService } from '../../services'
import { getErrorMessage, getContrastingTextColor } from '../../utils/helpers'
import type { TaskCreate, TaskUpdate, Task, Category, Tag } from '../../types'
import CreateCategoryModal from '../category/CreateCategoryModal'
import CreateTagModal from '../tag/CreateTagModal'
import styles from './TaskForm.module.css'

const taskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title cannot exceed 100 characters'),
  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  priority: z.enum(['low', 'medium', 'high']),
  due_date: z
    .string()
    .optional()
    .refine(
      (date) => {
        if (!date) return true // Optional field
        const selectedDate = new Date(date)
        const today = new Date()
        today.setHours(0, 0, 0, 0) // Start of today
        return selectedDate > today
      },
      {
        message: 'Due date must be in the future',
      }
    ),
  category_id: z.number().optional(),
})

type TaskFormData = z.infer<typeof taskSchema>

interface TaskFormProps {
  task?: Task
  onSubmit: (data: TaskCreate | TaskUpdate) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

const TaskForm: React.FC<TaskFormProps> = ({
  task,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showTagModal, setShowTagModal] = useState(false)

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      priority: task?.priority || 'medium',
      due_date: task?.due_date ? task.due_date.split('T')[0] : '',
      category_id: task?.category_id || undefined,
    },
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true)
        const [categoriesData, tagsData] = await Promise.all([
          categoryService.getCategories(),
          tagService.getTags(),
        ])

        console.log('TaskForm - Categories loaded:', categoriesData)
        console.log('TaskForm - Tags loaded:', tagsData)

        // Ensure we always set arrays, even if API returns unexpected data
        setCategories(Array.isArray(categoriesData) ? categoriesData : [])
        setTags(Array.isArray(tagsData) ? tagsData : [])

        if (task?.tags && Array.isArray(task.tags)) {
          setSelectedTags(task.tags)
        }
      } catch (err) {
        console.error('Error loading form data:', err)
        setError(getErrorMessage(err))
        // Set empty arrays on error to prevent crashes
        setCategories([])
        setTags([])
      } finally {
        setLoadingData(false)
      }
    }

    loadData()
  }, [task])

  const handleFormSubmit = async (data: TaskFormData) => {
    try {
      const submitData = {
        ...data,
        due_date: data.due_date || undefined,
        category_id: data.category_id || undefined,
        tags: Array.isArray(selectedTags)
          ? selectedTags.map((tag) => tag.id)
          : [],
      }

      await onSubmit(submitData)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const addTag = (tagId: string) => {
    if (!Array.isArray(tags) || !Array.isArray(selectedTags)) return

    const tag = tags.find((t) => t.id === parseInt(tagId))
    if (tag && !selectedTags.some((t) => t.id === tag.id)) {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const removeTag = (tagId: number) => {
    setSelectedTags(
      (Array.isArray(selectedTags) ? selectedTags : []).filter(
        (t) => t.id !== tagId
      )
    )
  }

  const handleCategoryCreated = (newCategory: Category) => {
    setCategories((prev) => [...prev, newCategory])
    setShowCategoryModal(false)
  }

  const handleTagCreated = (newTag: Tag) => {
    setTags((prev) => [...prev, newTag])
    setShowTagModal(false)
  }

  const categoryOptions = (Array.isArray(categories) ? categories : []).map(
    (category) => ({
      value: category.id,
      label: category.name,
    })
  )

  const tagOptions = (Array.isArray(tags) ? tags : [])
    .filter((tag) => !selectedTags.some((t) => t.id === tag.id))
    .map((tag) => ({
      value: tag.id.toString(),
      label: tag.name,
    }))

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ]

  if (loadingData) {
    return (
      <div className={styles.taskForm}>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className={styles.taskForm}
      >
        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.formRow}>
          <div className={styles.formField}>
            <Input
              label='Title'
              placeholder='Enter task title'
              error={errors.title?.message}
              required
              {...register('title')}
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formField}>
            <Input
              label='Description'
              placeholder='Enter task description (optional)'
              error={errors.description?.message}
              {...register('description')}
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={`${styles.formField} ${styles.half}`}>
            <Controller
              name='priority'
              control={control}
              render={({ field }) => (
                <Select
                  label='Priority'
                  options={priorityOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.priority?.message}
                  className={styles.prioritySelect}
                />
              )}
            />
          </div>
          <div className={`${styles.formField} ${styles.half}`}>
            <Input
              type='date'
              label='Due Date'
              error={errors.due_date?.message}
              className={styles.dateInput}
              {...register('due_date')}
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formField}>
            <div className={styles.fieldWithButton}>
              <Controller
                name='category_id'
                control={control}
                render={({ field }) => (
                  <Select
                    label='Category'
                    placeholder='Select a category (optional)'
                    options={categoryOptions}
                    value={field.value || ''}
                    onChange={(value) =>
                      field.onChange(value ? Number(value) : undefined)
                    }
                    error={errors.category_id?.message}
                  />
                )}
              />
              <Button
                type='button'
                variant='secondary'
                size='sm'
                onClick={() => setShowCategoryModal(true)}
                disabled={loading}
                className={styles.createButton}
              >
                <Plus size={16} />
                New Category
              </Button>
            </div>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formField}>
            <div className={styles.fieldWithButton}>
              <div className={styles.tagSection}>
                <label>Tags</label>
                {tagOptions.length > 0 && (
                  <Select
                    placeholder='Add tags (optional)'
                    options={[
                      { value: '', label: 'Select a tag...' },
                      ...tagOptions,
                    ]}
                    value=''
                    onChange={(value) => value && addTag(value.toString())}
                  />
                )}
                {selectedTags.length > 0 && (
                  <div className={styles.tagContainer}>
                    {selectedTags.map((tag) => (
                      <div
                        key={tag.id}
                        className={styles.tag}
                        style={{
                          backgroundColor: tag.color || '#e5e7eb',
                          borderColor: tag.color || '#d1d5db',
                        }}
                      >
                        <span
                          style={{
                            color: tag.color
                              ? getContrastingTextColor(tag.color)
                              : '#374151',
                          }}
                        >
                          {tag.name}
                        </span>
                        <button
                          type='button'
                          className={styles.tagRemove}
                          onClick={() => removeTag(tag.id)}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Button
                type='button'
                variant='secondary'
                size='sm'
                onClick={() => setShowTagModal(true)}
                disabled={loading}
                className={styles.createButton}
              >
                <Plus size={16} />
                New Tag
              </Button>
            </div>
          </div>
        </div>

        <div className={styles.formActions}>
          <Button
            type='button'
            variant='secondary'
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type='submit' variant='primary' loading={loading}>
            {task ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>

      {/* Category Creation Modal */}
      <CreateCategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onCategoryCreated={handleCategoryCreated}
      />

      {/* Tag Creation Modal */}
      <CreateTagModal
        isOpen={showTagModal}
        onClose={() => setShowTagModal(false)}
        onTagCreated={handleTagCreated}
      />
    </>
  )
}

export default TaskForm
