import type { 
  Usuario, 
  Tarea, 
  Categoria, 
  Etiqueta,
  LoginDto,
  RegistroDto,
  CrearTareaDto,
  ActualizarTareaDto,
  CrearCategoriaDto,
  ActualizarCategoriaDto,
  CrearEtiquetaDto,
  ActualizarEtiquetaDto,
  AuthResponse,
  ApiResponse,
  PaginatedResponse,
  TareasFilter,
  PaginationParams,
  EstadisticasTareas,
  ApiError
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    // Recuperar token del localStorage al inicializar
    this.token = localStorage.getItem('token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: ApiError = {
          message: errorData.message || `Error ${response.status}: ${response.statusText}`,
          status: response.status,
          details: errorData,
        };
        throw error;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error && 'status' in error) {
        throw error;
      }
      
      // Error de red o parsing
      const apiError: ApiError = {
        message: error instanceof Error ? error.message : 'Error de conexión',
        status: 0,
        details: { originalError: error },
      };
      throw apiError;
    }
  }

  private async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  private async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  private async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  private async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  private async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // === AUTENTICACIÓN ===
  async login(credentials: LoginDto): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/auth/login', credentials);
    this.setToken(response.token);
    return response;
  }

  async registro(userData: RegistroDto): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/auth/registro', userData);
    this.setToken(response.token);
    return response;
  }

  async perfil(): Promise<Usuario> {
    return this.get<Usuario>('/auth/perfil');
  }

  logout(): void {
    this.setToken(null);
  }

  // === TAREAS ===
  async obtenerTareas(filter: TareasFilter = {}, pagination: PaginationParams = {}): Promise<PaginatedResponse<Tarea>> {
    const searchParams = new URLSearchParams();
    
    // Agregar filtros
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });

    // Agregar paginación
    if (pagination.page) searchParams.append('page', String(pagination.page));
    if (pagination.limit) searchParams.append('limit', String(pagination.limit));

    const queryString = searchParams.toString();
    const endpoint = `/tareas${queryString ? `?${queryString}` : ''}`;
    
    return this.get<PaginatedResponse<Tarea>>(endpoint);
  }

  async obtenerTarea(id: number): Promise<Tarea> {
    return this.get<Tarea>(`/tareas/${id}`);
  }

  async crearTarea(data: CrearTareaDto): Promise<Tarea> {
    return this.post<Tarea>('/tareas', data);
  }

  async actualizarTarea(id: number, data: ActualizarTareaDto): Promise<Tarea> {
    return this.put<Tarea>(`/tareas/${id}`, data);
  }

  async marcarTareaCompletada(id: number): Promise<Tarea> {
    return this.patch<Tarea>(`/tareas/${id}/completar`);
  }

  async eliminarTarea(id: number): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`/tareas/${id}`);
  }

  async obtenerEstadisticasTareas(): Promise<EstadisticasTareas> {
    return this.get<EstadisticasTareas>('/tareas/estadisticas');
  }

  // === CATEGORÍAS ===
  async obtenerCategorias(): Promise<Categoria[]> {
    return this.get<Categoria[]>('/categorias');
  }

  async obtenerCategoria(id: number): Promise<Categoria> {
    return this.get<Categoria>(`/categorias/${id}`);
  }

  async crearCategoria(data: CrearCategoriaDto): Promise<Categoria> {
    return this.post<Categoria>('/categorias', data);
  }

  async actualizarCategoria(id: number, data: ActualizarCategoriaDto): Promise<Categoria> {
    return this.put<Categoria>(`/categorias/${id}`, data);
  }

  async eliminarCategoria(id: number): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`/categorias/${id}`);
  }

  // === ETIQUETAS ===
  async obtenerEtiquetas(): Promise<Etiqueta[]> {
    return this.get<Etiqueta[]>('/etiquetas');
  }

  async obtenerEtiqueta(id: number): Promise<Etiqueta> {
    return this.get<Etiqueta>(`/etiquetas/${id}`);
  }

  async crearEtiqueta(data: CrearEtiquetaDto): Promise<Etiqueta> {
    return this.post<Etiqueta>('/etiquetas', data);
  }

  async actualizarEtiqueta(id: number, data: ActualizarEtiquetaDto): Promise<Etiqueta> {
    return this.put<Etiqueta>(`/etiquetas/${id}`, data);
  }

  async eliminarEtiqueta(id: number): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`/etiquetas/${id}`);
  }
}

// Instancia singleton del servicio de API
export const apiService = new ApiService();
export default apiService;
