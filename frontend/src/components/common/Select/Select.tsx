import React from 'react'
import { ChevronDown } from 'lucide-react'
import type { SelectProps } from '@/types'
import styles from './Select.module.css'

interface ExtendedSelectProps extends SelectProps {
  size?: 'sm' | 'md' | 'lg'
}

const Select: React.FC<ExtendedSelectProps> = ({
  options,
  value,
  onChange,
  placeholder,
  error,
  label,
  required = false,
  disabled = false,
  className = '',
  size = 'md',
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      const selectedValue = e.target.value
      onChange(selectedValue === '' ? '' : selectedValue)
    }
  }

  const selectClasses = [
    styles.select,
    styles[size],
    error ? styles.error : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={styles.selectGroup}>
      {label && (
        <label className={`${styles.label} ${required ? styles.required : ''}`}>
          {label}
        </label>
      )}
      <div className={styles.selectWrapper}>
        <select
          value={value || ''}
          onChange={handleChange}
          disabled={disabled}
          className={selectClasses}
          {...props}
        >
          {placeholder && (
            <option value='' disabled className={styles.placeholder}>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className={styles.arrow} size={16} />
      </div>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  )
}

export default Select
