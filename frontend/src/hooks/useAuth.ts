import { useContext } from 'react';
import type { AuthContextType } from '../types';
import AuthContext from '../context/AuthContext';

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
