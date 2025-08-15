import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { toast } from 'react-hot-toast'

import { categoryService } from '../../services/categoryService'
import type { Category, CategoryCreate } from '../../types'
import Button from '../ui/Button'
import Input from '../ui/Input'
import styles from './CreateCategoryModal.module.css'

interface CreateCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onCategoryCreated: (category: Category) => void
}

const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(100, 'Category name must be less than 100 characters'),
  description: z
    .string()
    .max(255, 'Description must be less than 255 characters')
    .optional(),
  color: z.string().optional(),
})

type CreateCategoryFormData = z.infer<typeof createCategorySchema>

const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({
  isOpen,
  onClose,
  onCategoryCreated,
}) => {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateCategoryFormData>({
    resolver: zodResolver(createCategorySchema),
  })

  const onSubmit = async (data: CreateCategoryFormData) => {
    setLoading(true)
    try {
      const categoryData: CategoryCreate = {
        name: data.name,
        description: data.description,
        color: data.color,
      }

      const newCategory = await categoryService.createCategory(categoryData)
      toast.success('Category created successfully!')
      onCategoryCreated(newCategory)
      reset()
      onClose()
    } catch (error) {
      console.error('Error creating category:', error)
      toast.error('Failed to create category')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Create New Category</h2>
          <button
            type='button'
            className={styles.closeButton}
            onClick={handleClose}
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <Input
            label='Name'
            placeholder='Enter category name'
            error={errors.name?.message}
            disabled={loading}
            {...register('name')}
          />

          <Input
            label='Description (optional)'
            placeholder='Enter category description'
            error={errors.description?.message}
            disabled={loading}
            {...register('description')}
          />

          <Input
            label='Color (optional)'
            type='color'
            error={errors.color?.message}
            disabled={loading}
            {...register('color')}
          />

          <div className={styles.actions}>
            <Button
              type='button'
              variant='secondary'
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type='submit' variant='primary' loading={loading}>
              Create Category
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateCategoryModal
