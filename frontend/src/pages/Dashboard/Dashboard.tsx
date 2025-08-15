import React, { useState } from 'react'
import { Plus, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { useTasks } from '@/hooks/useTasks'
import { Button, Modal } from '@/components/common'
import { TaskForm, TaskView, TaskFilters } from '@/components/task'
import { DashboardLayout } from '@/components/layout'
import type {
  Task,
  TaskFilters as TaskFiltersType,
  TaskCreate,
  TaskUpdate,
} from '@/types'
import { getErrorMessage } from '@/utils/helpers'
import styles from './Dashboard.module.css'

const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [filters, setFilters] = useState<TaskFiltersType>({})
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [taskFormLoading, setTaskFormLoading] = useState(false)

  const {
    tasks,
    loading,
    error,
    pagination,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
  } = useTasks({
    autoFetch: true,
  })

  const handleCreateTask = () => {
    setEditingTask(null)
    setShowTaskModal(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setShowTaskModal(true)
  }

  const handleTaskSubmit = async (data: TaskCreate | TaskUpdate) => {
    try {
      setTaskFormLoading(true)

      if (editingTask) {
        await updateTask(editingTask.id, data as TaskUpdate)
        toast.success('Tarea actualizada correctamente', {
          duration: 3000,
        })
      } else {
        await createTask(data as TaskCreate)
        toast.success('Nueva tarea creada exitosamente', {
          duration: 3000,
        })
      }

      setShowTaskModal(false)
      setEditingTask(null)
    } catch (err) {
      const errorMessage = getErrorMessage(err)
      console.error('Error submitting task:', errorMessage)

      toast.error(
        `Error al ${editingTask ? 'actualizar' : 'crear'} la tarea: ${errorMessage}`,
        {
          duration: 4000,
        }
      )
    } finally {
      setTaskFormLoading(false)
    }
  }

  const handleDeleteTask = async (taskId: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      try {
        await deleteTask(taskId)
        toast.success('Tarea eliminada correctamente', {
          duration: 3000,
        })
      } catch (err) {
        const errorMessage = getErrorMessage(err)
        console.error('Error deleting task:', errorMessage)
        toast.error(`Error al eliminar la tarea: ${errorMessage}`, {
          duration: 4000,
        })
      }
    }
  }

  const handleToggleTask = async (taskId: number) => {
    try {
      const task = tasks.find((t) => t.id === taskId)
      await toggleTask(taskId)

      if (task) {
        toast.success(
          task.completed
            ? 'Tarea marcada como pendiente'
            : 'Tarea completada exitosamente',
          {
            duration: 2000,
          }
        )
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err)
      console.error('Error toggling task:', errorMessage)
      toast.error(`Error al cambiar el estado de la tarea: ${errorMessage}`, {
        duration: 4000,
      })
    }
  }

  const handleFiltersChange = (newFilters: TaskFiltersType) => {
    setFilters(newFilters)
    // Fetch tasks with new filters
    fetchTasks({ ...newFilters, page: 1 })
  }

  const handleResetFilters = () => {
    setFilters({})
    // Fetch all tasks without filters
    fetchTasks({ page: 1 })
  }

  const handleGoToTasks = () => {
    navigate('/tasks')
  }

  const handleCloseModal = () => {
    setShowTaskModal(false)
    setEditingTask(null)
  }

  // Calculate task statistics
  const taskStats = {
    total: pagination.total || 0,
    completed: tasks.filter((task) => task.completed).length,
    pending: tasks.filter((task) => !task.completed).length,
    overdue: tasks.filter((task) => {
      if (!task.due_date || task.completed) return false
      return new Date(task.due_date) < new Date()
    }).length,
  }

  return (
    <DashboardLayout
      onCreateTask={handleCreateTask}
      pendingCount={taskStats.pending}
    >
      <div className={styles.dashboard}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1>Task Dashboard</h1>
            <p className={styles.subtitle}>
              Welcome back, {user?.name || 'User'}!
            </p>

            <div className={styles.quickActions}>
              <Button onClick={handleCreateTask} variant='primary' size='lg'>
                <Plus size={20} />
                Add New Task
              </Button>
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant='secondary'
                size='md'
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>
          </div>
        </header>

        {/* Task Statistics */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3>Total Tasks</h3>
            <span className={styles.statNumber}>{taskStats.total}</span>
          </div>
          <div className={styles.statCard}>
            <h3>Completed</h3>
            <span className={`${styles.statNumber} ${styles.completed}`}>
              {taskStats.completed}
            </span>
          </div>
          <div className={styles.statCard}>
            <h3>Pending</h3>
            <span className={`${styles.statNumber} ${styles.inProgress}`}>
              {taskStats.pending}
            </span>
          </div>
          <div className={styles.statCard}>
            <h3>Overdue</h3>
            <span className={`${styles.statNumber} ${styles.overdue}`}>
              {taskStats.overdue}
            </span>
          </div>
          <div className={styles.statCard} onClick={handleGoToTasks}>
            <h3>Task Manager</h3>
            <div className={styles.statAction}>
              <ArrowRight size={24} />
              <span>View All Tasks</span>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className={styles.filtersSection}>
            <TaskFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onReset={handleResetFilters}
            />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className={styles.error}>Error: {getErrorMessage(error)}</div>
        )}

        {/* Task Management with Modern View */}
        <div className={styles.taskManagement}>
          <TaskView
            tasks={tasks}
            onToggleComplete={handleToggleTask}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            loading={loading}
          />
        </div>

        {/* Task Form Modal */}
        <Modal
          isOpen={showTaskModal}
          onClose={handleCloseModal}
          title={editingTask ? 'Edit Task' : 'Create New Task'}
          size='md'
        >
          <TaskForm
            task={editingTask || undefined}
            onSubmit={handleTaskSubmit}
            onCancel={handleCloseModal}
            loading={taskFormLoading}
          />
        </Modal>
      </div>
    </DashboardLayout>
  )
}

export default DashboardPage
