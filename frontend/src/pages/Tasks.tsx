import React, { useState } from 'react'
import { Plus, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useTasks } from '../hooks/useTasks'
import { Button, Modal } from '../components/ui'
import { TaskForm, TaskView } from '../components/task'
import { DashboardLayout } from '../components/layout'
import type { Task, TaskCreate, TaskUpdate } from '../types'
import { getErrorMessage } from '../utils/helpers'
import styles from './Tasks.module.css'

const TasksPage: React.FC = () => {
  const navigate = useNavigate()
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [taskFormLoading, setTaskFormLoading] = useState(false)

  const {
    tasks,
    loading,
    error,
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

  const handleCloseModal = () => {
    setShowTaskModal(false)
    setEditingTask(null)
  }

  const handleBackToDashboard = () => {
    navigate('/dashboard')
  }

  // Calculate task statistics
  const taskStats = {
    total: tasks.length,
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
      <div className={styles.tasksPage}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <button
              className={styles.backButton}
              onClick={handleBackToDashboard}
              title='Back to Dashboard'
            >
              <ArrowLeft size={20} />
              <span>Back to Dashboard</span>
            </button>

            <div className={styles.headerActions}>
              <Button onClick={handleCreateTask} variant='primary' size='lg'>
                <Plus size={20} />
                New Task
              </Button>
            </div>
          </div>

          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <h1>Task Management</h1>
              <p className={styles.subtitle}>
                Organize, track, and complete your tasks efficiently
              </p>
            </div>

            {/* Quick Stats */}
            <div className={styles.quickStats}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{taskStats.total}</span>
                <span className={styles.statLabel}>Total</span>
              </div>
              <div className={styles.statItem}>
                <span className={`${styles.statValue} ${styles.pending}`}>
                  {taskStats.pending}
                </span>
                <span className={styles.statLabel}>Pending</span>
              </div>
              <div className={styles.statItem}>
                <span className={`${styles.statValue} ${styles.completed}`}>
                  {taskStats.completed}
                </span>
                <span className={styles.statLabel}>Completed</span>
              </div>
              {taskStats.overdue > 0 && (
                <div className={styles.statItem}>
                  <span className={`${styles.statValue} ${styles.overdue}`}>
                    {taskStats.overdue}
                  </span>
                  <span className={styles.statLabel}>Overdue</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Error Display */}
        {error && (
          <div className={styles.error}>
            <span>Error: {getErrorMessage(error)}</span>
          </div>
        )}

        {/* Main Task View */}
        <main className={styles.mainContent}>
          <TaskView
            tasks={tasks}
            onToggleComplete={handleToggleTask}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            loading={loading}
          />
        </main>

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

export default TasksPage
