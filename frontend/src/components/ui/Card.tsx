import React from 'react'
import styles from './Card.module.css'

interface CardProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  variant?: 'default' | 'bordered' | 'elevated'
  size?: 'default' | 'compact' | 'spacious'
  seamless?: boolean
}

interface CardHeaderProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  className?: string
}

interface CardBodyProps {
  children: React.ReactNode
  className?: string
}

interface CardFooterProps {
  children: React.ReactNode
  className?: string
}

const Card: React.FC<CardProps> = ({
  children,
  onClick,
  className = '',
  variant = 'default',
  size = 'default',
  seamless = false,
}) => {
  const cardClasses = [
    styles.card,
    variant !== 'default' ? styles[variant] : '',
    size !== 'default' ? styles[size] : '',
    seamless ? styles.seamless : '',
    onClick ? styles.clickable : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={cardClasses} onClick={onClick}>
      {children}
    </div>
  )
}

const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  title,
  subtitle,
  className = '',
}) => {
  return (
    <div className={`${styles.header} ${className}`}>
      {title && <h3 className={styles.title}>{title}</h3>}
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      {children}
    </div>
  )
}

const CardBody: React.FC<CardBodyProps> = ({ children, className = '' }) => {
  return <div className={`${styles.body} ${className}`}>{children}</div>
}

const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = '',
}) => {
  return <div className={`${styles.footer} ${className}`}>{children}</div>
}

export { Card, CardHeader, CardBody, CardFooter }
export default Card
