import React, { useState, useEffect } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { Search } from 'lucide-react'
import { Input, Select } from '@/components/common'
import { categoryService, tagService } from '@/services'
import type { TaskFilters, Category, Tag } from '@/types'
import styles from './TaskFilters.module.css'

interface TaskFiltersProps {
  filters: TaskFilters
  onFiltersChange: (filters: TaskFilters) => void
  onReset: () => void
}

const TaskFiltersComponent: React.FC<TaskFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
}) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [searchTerm, setSearchTerm] = useState(filters.search || '')
  const debouncedSearch = useDebounce(searchTerm, 400)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesData, tagsData] = await Promise.all([
          categoryService.getCategories(),
          tagService.getTags(),
        ])

        // Validate that the response is an array before setting state
        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData)
        } else {
          console.warn('Categories data is not an array:', categoriesData)
          setCategories([])
        }

        if (Array.isArray(tagsData)) {
          setTags(tagsData)
        } else {
          console.warn('Tags data is not an array:', tagsData)
          setTags([])
        }
      } catch (error) {
        console.error('Error loading filter data:', error)
        // Set empty arrays as fallback
        setCategories([])
        setTags([])
      }
    }
    loadData()
  }, [])

  const handleFilterChange = (
    key: keyof TaskFilters,
    value: string | number | boolean | undefined
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value === '' ? undefined : value,
    })
  }

  const handleReset = () => {
    setSearchTerm('')
    onFiltersChange({ ...filters, search: undefined })
    onReset()
  }

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined
  )

  const statusOptions = [
    { value: '', label: 'All Tasks' },
    { value: 'false', label: 'Pending' },
    { value: 'true', label: 'Completed' },
  ]

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ]

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...(Array.isArray(categories) ? categories : []).map((category) => ({
      value: category.id.toString(),
      label: category.name,
    })),
  ]

  const tagOptions = [
    { value: '', label: 'All Tags' },
    ...(Array.isArray(tags) ? tags : []).map((tag) => ({
      value: tag.id.toString(),
      label: tag.name,
    })),
  ]

  // Actualizar el filtro solo cuando debouncedSearch cambie
  useEffect(() => {
    onFiltersChange({ ...filters, search: debouncedSearch || undefined })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  return (
    <div className={styles.taskFilters}>
      <div className={`${styles.filterGroup} ${styles.wide}`}>
        <Input
          type='text'
          placeholder='Search tasks...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search size={16} />}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.filterGroup}>
        <Select
          options={statusOptions}
          value={filters.completed?.toString() || ''}
          onChange={(value) =>
            handleFilterChange(
              'completed',
              value === '' ? undefined : value === 'true'
            )
          }
          placeholder='Status'
        />
      </div>

      <div className={styles.filterGroup}>
        <Select
          options={priorityOptions}
          value={filters.priority || ''}
          onChange={(value) => handleFilterChange('priority', value)}
          placeholder='Priority'
        />
      </div>

      <div className={styles.filterGroup}>
        <Select
          options={categoryOptions}
          value={filters.category?.toString() || ''}
          onChange={(value) =>
            handleFilterChange(
              'category',
              value === '' ? undefined : Number(value)
            )
          }
          placeholder='Category'
        />
      </div>

      <div className={styles.filterGroup}>
        <Select
          options={tagOptions}
          value={filters.tags || ''}
          onChange={(value) =>
            handleFilterChange('tags', value === '' ? undefined : value)
          }
          placeholder='Tag'
        />
      </div>

      <div className={styles.filterGroup}>
        <Input
          type='date'
          value={filters.date_from || ''}
          onChange={(e) => handleFilterChange('date_from', e.target.value)}
          label='From Date'
        />
      </div>

      <div className={styles.filterGroup}>
        <Input
          type='date'
          value={filters.date_to || ''}
          onChange={(e) => handleFilterChange('date_to', e.target.value)}
          label='To Date'
        />
      </div>

      <div className={styles.filterActions}>
        <button
          type='button'
          className={styles.clearButton}
          onClick={handleReset}
          disabled={!hasActiveFilters}
        >
          Clear Filters
        </button>
      </div>
    </div>
  )
}

export default TaskFiltersComponent
