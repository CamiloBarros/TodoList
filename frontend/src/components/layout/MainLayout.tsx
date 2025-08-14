import type { ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { usuario, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo y título */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                TodoList
              </h1>
            </div>

            {/* Navegación y usuario */}
            <div className="flex items-center space-x-4">
              {usuario && (
                <>
                  <span className="text-sm text-gray-700">
                    Hola, {usuario.nombre}
                  </span>
                  <button
                    onClick={logout}
                    className="btn-secondary text-sm"
                  >
                    Cerrar Sesión
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © 2024 TodoList. Organiza tu vida, una tarea a la vez.
          </p>
        </div>
      </footer>
    </div>
  );
}
