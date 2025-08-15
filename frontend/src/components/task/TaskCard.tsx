import React from 'react'
import {
  Calendar,
  CheckCircle2,
  Edit3,
  Trash2,
  Tag,
  FolderOpen,
  Clock,
  AlertTriangle,
  Star,
  MoreVertical,
} from 'lucide-react'
import type { Task } from '../../types'
import { formatDate, getContrastingTextColor } from '../../utils/helpers'
import styles from './TaskCard.module.css'

interface TaskCardProps {
  task: Task
  onToggleComplete: (id: number) => void
  onEdit: (task: Task) => void
  onDelete: (id: number) => void
  view?: 'card' | 'list'
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  view = 'card',
}) => {
  const isOverdue = (): boolean => {
    if (!task.due_date || task.completed) return false
    return new Date(task.due_date) < new Date()
  }

  const isToday = (): boolean => {
    if (!task.due_date) return false
    const today = new Date()
    const dueDate = new Date(task.due_date)
    return (
      today.getDate() === dueDate.getDate() &&
      today.getMonth() === dueDate.getMonth() &&
      today.getFullYear() === dueDate.getFullYear()
    )
  }

  const getDaysUntilDue = (): number => {
    if (!task.due_date) return 0
    const today = new Date()
    const dueDate = new Date(task.due_date)
    const diffTime = dueDate.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const getDueDateStatus = () => {
    if (!task.due_date) return null
    if (isOverdue()) return 'overdue'
    if (isToday()) return 'today'
    const days = getDaysUntilDue()
    if (days <= 3) return 'soon'
    return 'normal'
  }

  const getPriorityIcon = () => {
    switch (task.priority) {
      case 'high':
        return <AlertTriangle size={14} />
      case 'medium':
        return <Star size={14} />
      default:
        return null
    }
  }

  const cardClasses = [
    styles.taskCard,
    styles[view],
    task.completed && styles.completed,
    isOverdue() && styles.overdue,
    styles[`priority-${task.priority}`],
  ]
    .filter(Boolean)
    .join(' ')

  if (view === 'list') {
    return (
      <div className={cardClasses}>
        <div className={styles.listContent}>
          <div className={styles.listMain}>
            <div className={styles.taskStatus}>
              <button
                className={`${styles.statusButton} ${
                  task.completed ? styles.completed : ''
                }`}
                onClick={() => onToggleComplete(task.id)}
                title={task.completed ? 'Mark as pending' : 'Mark as completed'}
              >
                <CheckCircle2
                  size={20}
                  className={task.completed ? styles.checkedIcon : ''}
                />
              </button>
            </div>

            <div className={styles.taskInfo}>
              <div className={styles.titleRow}>
                <h3 className={styles.taskTitle} onClick={() => onEdit(task)}>
                  {task.title}
                </h3>
                <div className={styles.priorityIndicator}>
                  {getPriorityIcon()}
                </div>
              </div>

              {task.description && (
                <p className={styles.taskDescription}>{task.description}</p>
              )}

              <div className={styles.taskMeta}>
                {task.category && (
                  <div className={styles.metaItem}>
                    <FolderOpen size={14} />
                    <span>{task.category.name}</span>
                  </div>
                )}

                {task.due_date && (
                  <div
                    className={`${styles.metaItem} ${styles.dueDate} ${
                      styles[getDueDateStatus() || '']
                    }`}
                  >
                    <Calendar size={14} />
                    <span>{formatDate(task.due_date)}</span>
                  </div>
                )}

                {task.tags && task.tags.length > 0 && (
                  <div className={styles.tagContainer}>
                    {task.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag.id}
                        className={styles.miniTag}
                        style={{
                          backgroundColor: tag.color || '#e5e7eb',
                          color: tag.color
                            ? getContrastingTextColor(tag.color)
                            : '#374151',
                        }}
                      >
                        {tag.name}
                      </span>
                    ))}
                    {task.tags.length > 2 && (
                      <span className={styles.tagMore}>
                        +{task.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.listActions}>
            <button
              className={`${styles.actionButton} ${styles.edit}`}
              onClick={() => onEdit(task)}
              title='Edit task'
            >
              <Edit3 size={16} />
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
    )
  }

  return (
    <div className={cardClasses}>
      <div className={styles.cardHeader}>
        <div className={styles.priorityBadge}>
          {getPriorityIcon()}
          <span>{task.priority}</span>
        </div>

        <div className={styles.cardActions}>
          <button
            className={`${styles.actionButton} ${styles.more}`}
            title='More options'
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.taskTitle} onClick={() => onEdit(task)}>
          {task.title}
        </h3>

        {task.description && (
          <p className={styles.taskDescription}>{task.description}</p>
        )}

        {task.category && (
          <div className={styles.categoryBadge}>
            <FolderOpen size={12} />
            <span>{task.category.name}</span>
          </div>
        )}
      </div>

      {task.tags && task.tags.length > 0 && (
        <div className={styles.cardTags}>
          {task.tags.map((tag) => (
            <span
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
              {tag.name}
            </span>
          ))}
        </div>
      )}

      <div className={styles.cardFooter}>
        <div className={styles.dueDateInfo}>
          {task.due_date && (
            <div
              className={`${styles.dueDate} ${
                styles[getDueDateStatus() || '']
              }`}
            >
              <Clock size={14} />
              <span>{formatDate(task.due_date)}</span>
              {isOverdue() && (
                <span className={styles.overdueLabel}>Overdue</span>
              )}
              {isToday() && <span className={styles.todayLabel}>Today</span>}
            </div>
          )}
        </div>

        <div className={styles.footerActions}>
          <button
            className={`${styles.actionButton} ${styles.complete}`}
            onClick={() => onToggleComplete(task.id)}
            title={task.completed ? 'Mark as pending' : 'Mark as completed'}
          >
            <CheckCircle2
              size={18}
              className={task.completed ? styles.checkedIcon : ''}
            />
          </button>

          <button
            className={`${styles.actionButton} ${styles.edit}`}
            onClick={() => onEdit(task)}
            title='Edit task'
          >
            <Edit3 size={16} />
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
  )
}

export default TaskCard
