import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, User, AlertCircle, CheckSquare } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Input, Button } from '../components/ui'
import { getErrorMessage } from '../utils/helpers'
import type { RegisterCredentials } from '../types'
import styles from './Login.module.css' // Reusing the same styles

const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .min(2, 'Name must have at least 2 characters')
      .max(50, 'Name cannot exceed 50 characters'),
    email: z.string().min(1, 'Email is required').email('Email is not valid'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(6, 'Password must have at least 6 characters')
      .max(100, 'Password cannot exceed 100 characters'),
    confirmPassword: z.string().min(1, 'You must confirm the password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const { register: registerUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true)
      setError(null)

      const credentials: RegisterCredentials = {
        name: data.name,
        email: data.email,
        password: data.password,
      }

      await registerUser(credentials)
      navigate('/dashboard')
    } catch (err: unknown) {
      setError(getErrorMessage(err))
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
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>
            Join us to start managing your tasks
          </p>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <Input
            type='text'
            label='Full name'
            placeholder='Your name'
            icon={<User size={16} />}
            error={errors.name?.message}
            required
            {...register('name')}
          />

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

          <Input
            type='password'
            label='Confirm password'
            placeholder='••••••••'
            icon={<Lock size={16} />}
            error={errors.confirmPassword?.message}
            required
            {...register('confirmPassword')}
          />

          <Button
            type='submit'
            loading={isLoading}
            className={styles.submitButton}
            variant='primary'
            size='lg'
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <div className={styles.divider}>
          <span className={styles.dividerText}>Already have an account?</span>
        </div>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            <Link to='/login' className={styles.footerLink}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
