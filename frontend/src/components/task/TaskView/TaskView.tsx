import React, { useState } from 'react'
import { Grid3X3, List, Filter, SortAsc } from 'lucide-react'
import type { Task } from '../../../types'
import { TaskCard } from '../TaskCard/TaskCard'
import styles from './TaskView.module.css'

interface TaskViewProps {
  tasks: Task[]
  onToggleComplete: (id: number) => void
  onEdit: (task: Task) => void
  onDelete: (id: number) => void
  loading?: boolean
}

type ViewMode = 'grid' | 'list'
type SortOption = 'created' | 'due_date' | 'priority' | 'title'
type FilterOption = 'all' | 'pending' | 'completed' | 'overdue' | 'today'

const FILTER_LABELS = {
  all: 'All',
  pending: 'Pending',
  completed: 'Done',
  overdue: 'Overdue',
  today: 'Today',
} as const

const FILTER_LABELS_MOBILE = {
  all: 'All',
  pending: 'Todo',
  completed: 'Done',
  overdue: 'Late',
  today: 'Today',
} as const

export const TaskView: React.FC<TaskViewProps> = ({
  tasks,
  onToggleComplete,
  onEdit,
  onDelete,
  loading = false,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('created')
  const [filterBy, setFilterBy] = useState<FilterOption>('all')

  const isOverdue = (task: Task): boolean => {
    if (!task.due_date || task.completed) return false
    return new Date(task.due_date) < new Date()
  }

  const isToday = (task: Task): boolean => {
    if (!task.due_date) return false
    const today = new Date()
    const dueDate = new Date(task.due_date)
    return (
      today.getDate() === dueDate.getDate() &&
      today.getMonth() === dueDate.getMonth() &&
      today.getFullYear() === dueDate.getFullYear()
    )
  }

  const filterTasks = (tasks: Task[]): Task[] => {
    switch (filterBy) {
      case 'pending':
        return tasks.filter((task) => !task.completed)
      case 'completed':
        return tasks.filter((task) => task.completed)
      case 'overdue':
        return tasks.filter((task) => isOverdue(task))
      case 'today':
        return tasks.filter((task) => isToday(task))
      default:
        return tasks
    }
  }

  const sortTasks = (tasks: Task[]): Task[] => {
    return [...tasks].sort((a, b) => {
      switch (sortBy) {
        case 'due_date':
          if (!a.due_date && !b.due_date) return 0
          if (!a.due_date) return 1
          if (!b.due_date) return -1
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()

        case 'priority': {
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        }

        case 'title':
          return a.title.localeCompare(b.title)

        case 'created':
        default:
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
      }
    })
  }

  const processedTasks = sortTasks(filterTasks(tasks))

  const getFilterCount = (filter: FilterOption): number => {
    switch (filter) {
      case 'pending':
        return tasks.filter((task) => !task.completed).length
      case 'completed':
        return tasks.filter((task) => task.completed).length
      case 'overdue':
        return tasks.filter((task) => isOverdue(task)).length
      case 'today':
        return tasks.filter((task) => isToday(task)).length
      default:
        return tasks.length
    }
  }

  // All filters available
  const allFilters: FilterOption[] = [
    'all',
    'pending',
    'completed',
    'overdue',
    'today',
  ]

  if (loading) {
    return (
      <div className={styles.taskView}>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.taskView}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        {/* Mobile First Row */}
        <div className={styles.toolbarRow}>
          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewButton} ${
                viewMode === 'grid' ? styles.active : ''
              }`}
              onClick={() => setViewMode('grid')}
              title='Grid view'
            >
              <Grid3X3 size={18} />
              <span className={styles.viewLabel}>Grid</span>
            </button>
            <button
              className={`${styles.viewButton} ${
                viewMode === 'list' ? styles.active : ''
              }`}
              onClick={() => setViewMode('list')}
              title='List view'
            >
              <List size={18} />
              <span className={styles.viewLabel}>List</span>
            </button>
          </div>

          <div className={styles.sortSelect}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className={styles.select}
            >
              <option value='created'>Recent</option>
              <option value='due_date'>Due Date</option>
              <option value='priority'>Priority</option>
              <option value='title'>Title</option>
            </select>
            <SortAsc size={16} className={styles.sortIcon} />
          </div>
        </div>

        {/* Filter Tabs Row */}
        <div className={styles.filterRow}>
          <div className={styles.filterTabsContainer}>
            <div className={styles.filterTabs}>
              {allFilters.map((filter) => (
                <button
                  key={filter}
                  className={`${styles.filterTab} ${
                    filterBy === filter ? styles.active : ''
                  }`}
                  onClick={() => setFilterBy(filter)}
                >
                  <span className={styles.filterLabel}>
                    <span className={styles.filterLabelDesktop}>
                      {FILTER_LABELS[filter]}
                    </span>
                    <span className={styles.filterLabelMobile}>
                      {FILTER_LABELS_MOBILE[filter]}
                    </span>
                  </span>
                  <span className={styles.filterCount}>
                    {getFilterCount(filter)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Task Grid/List */}
      {processedTasks.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Filter size={48} />
          </div>
          <h3>No tasks found</h3>
          <p>
            {filterBy === 'all'
              ? 'Create your first task to get started!'
              : `No ${filterBy} tasks found. Try adjusting your filters.`}
          </p>
        </div>
      ) : (
        <div
          className={`${styles.taskContainer} ${
            viewMode === 'grid' ? styles.gridView : styles.listView
          }`}
        >
          {processedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
              onEdit={onEdit}
              onDelete={onDelete}
              view={viewMode === 'grid' ? 'card' : 'list'}
            />
          ))}
        </div>
      )}

      {/* Results Summary */}
      <div className={styles.resultsSummary}>
        <p>
          Showing {processedTasks.length} of {tasks.length} task
          {tasks.length !== 1 ? 's' : ''}
          {filterBy !== 'all' && ` • Filtered by: ${filterBy}`}
          {sortBy !== 'created' && ` • Sorted by: ${sortBy.replace('_', ' ')}`}
        </p>
      </div>
    </div>
  )
}

export default TaskView
