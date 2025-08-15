import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

type ErrorBoundaryProps = {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(/* error: Error, errorInfo: React.ErrorInfo */) {
    // Aquí puedes loguear el error a un servicio externo si lo deseas
    // console.error('ErrorBoundary atrapó un error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div style={{ padding: 32, textAlign: 'center' }}>
            <h2>¡Ha ocurrido un error inesperado!</h2>
            <pre style={{ color: '#c00', marginTop: 16 }}>
              {this.state.error?.message}
            </pre>
            <p>Por favor, recarga la página o contacta soporte.</p>
          </div>
        )
      )
    }
    return this.props.children
  }
}
