import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Usuario, LoginDto, RegistroDto, AuthContextType } from '../types';
import { apiService } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar si hay un token almacenado al inicializar
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = apiService.getToken();
      
      if (storedToken) {
        try {
          setToken(storedToken);
          const userData = await apiService.perfil();
          setUsuario(userData);
        } catch (error) {
          console.error('Error al verificar token:', error);
          // Token inválido, limpiar
          apiService.logout();
          setToken(null);
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginDto): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await apiService.login(credentials);
      setToken(response.token);
      setUsuario(response.usuario);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const registro = async (userData: RegistroDto): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await apiService.registro(userData);
      setToken(response.token);
      setUsuario(response.usuario);
    } catch (error) {
      console.error('Error al registrarse:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    apiService.logout();
    setToken(null);
    setUsuario(null);
  };

  const value: AuthContextType = {
    usuario,
    token,
    login,
    registro,
    logout,
    isLoading,
    isAuthenticated: !!usuario && !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
