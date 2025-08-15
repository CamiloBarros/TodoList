import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { toast } from 'react-hot-toast'

import { tagService } from '../../services/tagService'
import type { Tag, TagCreate } from '../../types'
import Button from '../ui/Button'
import Input from '../ui/Input'
import styles from './CreateTagModal.module.css'

interface CreateTagModalProps {
  isOpen: boolean
  onClose: () => void
  onTagCreated: (tag: Tag) => void
}

const createTagSchema = z.object({
  name: z
    .string()
    .min(1, 'Tag name is required')
    .max(50, 'Tag name must be less than 50 characters'),
  color: z.string().optional(),
})

type CreateTagFormData = z.infer<typeof createTagSchema>

const CreateTagModal: React.FC<CreateTagModalProps> = ({
  isOpen,
  onClose,
  onTagCreated,
}) => {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateTagFormData>({
    resolver: zodResolver(createTagSchema),
  })

  const onSubmit = async (data: CreateTagFormData) => {
    setLoading(true)
    try {
      const tagData: TagCreate = {
        name: data.name,
        color: data.color,
      }

      const newTag = await tagService.createTag(tagData)
      toast.success('Tag created successfully!')
      onTagCreated(newTag)
      reset()
      onClose()
    } catch (error) {
      console.error('Error creating tag:', error)
      toast.error('Failed to create tag')
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
          <h2>Create New Tag</h2>
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
            placeholder='Enter tag name'
            error={errors.name?.message}
            disabled={loading}
            {...register('name')}
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
              Create Tag
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateTagModal
