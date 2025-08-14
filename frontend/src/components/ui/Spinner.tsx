import React from 'react'
import styles from './Spinner.module.css'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning'
  text?: string
  fullscreen?: boolean
  className?: string
}

const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  text,
  fullscreen = false,
  className = '',
}) => {
  const spinnerClasses = [
    styles.spinner,
    styles[size],
    styles[color],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const spinner = <div className={spinnerClasses} />

  const content = text ? (
    <div className={styles.withText}>
      {spinner}
      <span className={styles.text}>{text}</span>
    </div>
  ) : (
    spinner
  )

  if (fullscreen) {
    return (
      <div className={`${styles.container} ${styles.containerFullscreen}`}>
        {content}
      </div>
    )
  }

  return content
}

export default Spinner
