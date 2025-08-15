import React from 'react'
import {
  Calendar,
  CheckCircle,
  Edit,
  Trash2,
  Tag,
  FolderOpen,
} from 'lucide-react'
import type { Task } from '../../types'
import { formatDate, getContrastingTextColor } from '../../utils/helpers'
import styles from './TaskList.module.css'

interface TaskListProps {
  tasks: Task[]
  onToggleComplete: (id: number) => void
  onEdit: (task: Task) => void
  onDelete: (id: number) => void
  loading?: boolean
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onToggleComplete,
  onEdit,
  onDelete,
  loading = false,
}) => {
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

  const getDueDateClass = (task: Task): string => {
    if (isOverdue(task)) return styles.overdue
    if (isToday(task)) return styles.today
    return ''
  }

  if (loading) {
    return (
      <div className={styles.taskList}>
        <p>Loading tasks...</p>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h3>No tasks found</h3>
        <p>Create your first task to get started!</p>
      </div>
    )
  }

  return (
    <div className={styles.taskList}>
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`${styles.taskItem} ${
            task.completed ? styles.completed : ''
          } ${isOverdue(task) ? styles.overdue : ''}`}
        >
          <div className={styles.taskHeader}>
            <div className={styles.taskContent}>
              <h3
                className={`${styles.taskTitle} ${
                  task.completed ? styles.completed : ''
                }`}
                onClick={() => onEdit(task)}
              >
                {task.title}
              </h3>

              {task.description && (
                <p className={styles.taskDescription}>{task.description}</p>
              )}

              <div className={styles.taskMeta}>
                <div
                  className={`${styles.priorityBadge} ${styles[task.priority]}`}
                >
                  {task.priority}
                </div>

                {task.category && (
                  <div className={styles.categoryBadge}>
                    <FolderOpen size={12} />
                    <span>{task.category.name}</span>
                  </div>
                )}

                {task.due_date && (
                  <div
                    className={`${styles.dueDateBadge} ${getDueDateClass(task)}`}
                  >
                    <Calendar size={12} />
                    <span>{formatDate(task.due_date)}</span>
                    {isOverdue(task) && <span>(Overdue)</span>}
                    {isToday(task) && <span>(Today)</span>}
                  </div>
                )}

                {task.tags && task.tags.length > 0 && (
                  <div className={styles.tagList}>
                    {task.tags.map((tag) => (
                      <div
                        key={tag.id}
                        className={styles.tag}
                        style={{
                          backgroundColor: tag.color || '#e5e7eb',
                          borderColor: tag.color || '#d1d5db',
                          color: tag.color
                            ? getContrastingTextColor(tag.color)
                            : '#374151',
                        }}
                      >
                        <Tag size={10} />
                        <span>{tag.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.taskActions}>
              <button
                className={`${styles.actionButton} ${styles.complete}`}
                onClick={() => onToggleComplete(task.id)}
                title={task.completed ? 'Mark as pending' : 'Mark as completed'}
              >
                <CheckCircle size={16} />
              </button>

              <button
                className={`${styles.actionButton} ${styles.edit}`}
                onClick={() => onEdit(task)}
                title='Edit task'
              >
                <Edit size={16} />
              </button>

              <button
                className={`${styles.actionButton} ${styles.delete}`}
                onClick={() => onDelete(task.id)}
                title='Delete task'
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default TaskList
