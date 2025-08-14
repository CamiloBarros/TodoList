import React, { useEffect, useState } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import type { Notification as NotificationType } from '../../types'
import { useNotifications } from '../../hooks/useNotifications'
import styles from './Notification.module.css'

interface NotificationItemProps {
  notification: NotificationType
  onRemove: (id: string) => void
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onRemove,
}) => {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (!notification.duration || notification.duration <= 0) return

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - 100 / (notification.duration! / 100)
        if (newProgress <= 0) {
          onRemove(notification.id)
          return 0
        }
        return newProgress
      })
    }, 100)

    return () => clearInterval(interval)
  }, [notification.duration, notification.id, onRemove])

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className={styles.icon} />
      case 'error':
        return <AlertCircle className={styles.icon} />
      case 'warning':
        return <AlertTriangle className={styles.icon} />
      case 'info':
        return <Info className={styles.icon} />
      default:
        return <Info className={styles.icon} />
    }
  }

  const notificationClasses = [
    styles.notification,
    styles[notification.type],
  ].join(' ')

  return (
    <div className={notificationClasses}>
      <div className={styles.header}>
        {getIcon()}
        <div className={styles.content}>
          <h4 className={styles.title}>{notification.title}</h4>
          {notification.message && (
            <p className={styles.message}>{notification.message}</p>
          )}
        </div>
        <button
          type='button'
          className={styles.closeButton}
          onClick={() => onRemove(notification.id)}
          aria-label='Cerrar notificación'
        >
          <X size={14} />
        </button>
      </div>
      {notification.duration && notification.duration > 0 && (
        <div
          className={styles.progressBar}
          style={{
            width: `${progress}%`,
            animationDuration: `${notification.duration}ms`,
          }}
        />
      )}
    </div>
  )
}

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications()

  if (notifications.length === 0) return null

  return (
    <div className={styles.notificationContainer}>
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  )
}

export { NotificationContainer }
export default NotificationItem
