import React from 'react'
import type { InputProps } from '../../types'
import styles from './Input.module.css'

interface ExtendedInputProps extends InputProps {
  icon?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const Input: React.FC<ExtendedInputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  label,
  required = false,
  disabled = false,
  className = '',
  icon,
  size = 'md',
  ...props
}) => {
  const inputClasses = [
    styles.input,
    styles[size],
    error ? styles.error : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const wrapperClasses = icon ? styles.inputWithIcon : ''

  return (
    <div className={styles.inputGroup}>
      {label && (
        <label className={`${styles.label} ${required ? styles.required : ''}`}>
          {label}
        </label>
      )}
      <div className={wrapperClasses}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={inputClasses}
          {...props}
        />
      </div>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  )
}

export default Input
