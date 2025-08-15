import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { Mail, Lock, AlertCircle, CheckSquare } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Input, Button } from '../components/ui'
import { getErrorMessage } from '../utils/helpers'
import type { LoginCredentials } from '../types'
import styles from './Login.module.css'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Email is not valid'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must have at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true)
      setError(null)

      const credentials: LoginCredentials = {
        email: data.email,
        password: data.password,
      }

      await login(credentials)

      // Show success notification
      toast.success('¡Bienvenido! Has iniciado sesión correctamente', {
        duration: 3000,
      })

      navigate('/dashboard')
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err)
      setError(errorMessage)

      // Show error notification
      toast.error(`Error al iniciar sesión: ${errorMessage}`, {
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <CheckSquare size={32} />
          </div>
          <h1 className={styles.title}>Sign In</h1>
          <p className={styles.subtitle}>
            Access your account to manage your tasks
          </p>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className={styles.form}
        >
          <Input
            type='email'
            label='Email'
            placeholder='your@email.com'
            icon={<Mail size={16} />}
            error={errors.email?.message}
            required
            {...register('email')}
          />

          <Input
            type='password'
            label='Password'
            placeholder='••••••••'
            icon={<Lock size={16} />}
            error={errors.password?.message}
            required
            {...register('password')}
          />

          <Button
            type='submit'
            loading={isLoading}
            className={styles.submitButton}
            variant='primary'
            size='lg'
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className={styles.divider}>
          <span className={styles.dividerText}>Don't have an account?</span>
        </div>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            <Link to='/register' className={styles.footerLink}>
              Create a new account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
