// Tipos de la API

export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  creado_en: string;
  actualizado_en: string;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  color: string;
  usuario_id: number;
  creado_en: string;
  actualizado_en: string;
}

export interface Etiqueta {
  id: number;
  nombre: string;
  color: string;
  usuario_id: number;
  creado_en: string;
  actualizado_en: string;
}

export interface Tarea {
  id: number;
  titulo: string;
  descripcion?: string;
  completada: boolean;
  prioridad: 'baja' | 'media' | 'alta';
  fecha_vencimiento?: string;
  categoria_id?: number;
  usuario_id: number;
  creado_en: string;
  actualizado_en: string;
  categoria?: Categoria;
  etiquetas?: Etiqueta[];
}

// Tipos para formularios
export interface CrearTareaDto {
  titulo: string;
  descripcion?: string;
  prioridad: 'baja' | 'media' | 'alta';
  fecha_vencimiento?: string;
  categoria_id?: number;
  etiquetas?: number[];
}

export interface ActualizarTareaDto extends Partial<CrearTareaDto> {
  completada?: boolean;
}

export interface CrearCategoriaDto {
  nombre: string;
  descripcion?: string;
  color: string;
}

export type ActualizarCategoriaDto = Partial<CrearCategoriaDto>;

export interface CrearEtiquetaDto {
  nombre: string;
  color: string;
}

export type ActualizarEtiquetaDto = Partial<CrearEtiquetaDto>;

// Tipos para autenticación
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegistroDto {
  email: string;
  password: string;
  nombre: string;
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
}

// Tipos para contexto de autenticación
export interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  login: (credentials: LoginDto) => Promise<void>;
  registro: (userData: RegistroDto) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Tipos para respuestas de API
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// Tipos para filtros y parámetros
export interface TareasFilter {
  completada?: boolean;
  prioridad?: 'baja' | 'media' | 'alta';
  categoria_id?: number;
  etiqueta_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  buscar?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Tipos para estadísticas
export interface EstadisticasTareas {
  total: number;
  completadas: number;
  pendientes: number;
  vencidas: number;
  por_prioridad: {
    alta: number;
    media: number;
    baja: number;
  };
  por_categoria: Array<{
    categoria_id: number;
    categoria_nombre: string;
    total: number;
  }>;
}

// Tipos para errores
export interface ApiError {
  message: string;
  status: number;
  details?: Record<string, unknown>;
}

// Tipos para componentes
export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Tipos para estado de carga
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Tipos para modales
export interface ModalProps extends ComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

// Tipos para formularios
export interface FormState<T> extends LoadingState {
  data: T;
  errors: Partial<Record<keyof T, string>>;
}

// Color predefinidos para categorías y etiquetas
export const COLORES_DISPONIBLES = [
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#f59e0b', // amber-500
  '#eab308', // yellow-500
  '#84cc16', // lime-500
  '#22c55e', // green-500
  '#06b6d4', // cyan-500
  '#3b82f6', // blue-500
  '#6366f1', // indigo-500
  '#8b5cf6', // violet-500
  '#d946ef', // fuchsia-500
  '#ec4899', // pink-500
] as const;

export type ColorDisponible = typeof COLORES_DISPONIBLES[number];
