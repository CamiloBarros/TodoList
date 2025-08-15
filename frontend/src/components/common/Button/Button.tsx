import React from 'react'
import type { ButtonProps } from '@/types'
import styles from './Button.module.css'

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  children,
  onClick,
  className = '',
  ...props
}) => {
  const handleClick = () => {
    if (!loading && !disabled && onClick) {
      onClick()
    }
  }

  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    loading ? styles.loading : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
