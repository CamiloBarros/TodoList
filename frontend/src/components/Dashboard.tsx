import { useState, useEffect } from 'react';
import type { EstadisticasTareas, ApiError } from '../types';
import { apiService } from '../services/api';

export function Dashboard() {
  const [estadisticas, setEstadisticas] = useState<EstadisticasTareas | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        const data = await apiService.obtenerEstadisticasTareas();
        setEstadisticas(data);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || 'Error al cargar estadísticas');
      } finally {
        setIsLoading(false);
      }
    };

    cargarEstadisticas();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Cargando estadísticas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (!estadisticas) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No hay datos disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600">Resumen de tus tareas</p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-medium text-sm">📋</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">{estadisticas.total}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-medium text-sm">✅</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completadas</p>
              <p className="text-2xl font-bold text-gray-900">{estadisticas.completadas}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 font-medium text-sm">⏳</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">{estadisticas.pendientes}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 font-medium text-sm">⚠️</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Vencidas</p>
              <p className="text-2xl font-bold text-gray-900">{estadisticas.vencidas}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Por prioridad */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Por Prioridad</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="priority-alta p-4 rounded-lg bg-red-50">
              <p className="text-2xl font-bold text-red-700">{estadisticas.por_prioridad.alta}</p>
              <p className="text-sm text-red-600">Alta</p>
            </div>
          </div>
          <div className="text-center">
            <div className="priority-media p-4 rounded-lg bg-yellow-50">
              <p className="text-2xl font-bold text-yellow-700">{estadisticas.por_prioridad.media}</p>
              <p className="text-sm text-yellow-600">Media</p>
            </div>
          </div>
          <div className="text-center">
            <div className="priority-baja p-4 rounded-lg bg-green-50">
              <p className="text-2xl font-bold text-green-700">{estadisticas.por_prioridad.baja}</p>
              <p className="text-sm text-green-600">Baja</p>
            </div>
          </div>
        </div>
      </div>

      {/* Por categoría */}
      {estadisticas.por_categoria.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Por Categoría</h3>
          <div className="space-y-2">
            {estadisticas.por_categoria.map((categoria: { categoria_id: number; categoria_nombre: string; total: number }) => (
              <div 
                key={categoria.categoria_id} 
                className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg"
              >
                <span className="text-sm font-medium text-gray-700">
                  {categoria.categoria_nombre}
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {categoria.total}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Acciones rápidas */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn-primary">
            ➕ Nueva Tarea
          </button>
          <button className="btn-secondary">
            🏷️ Nueva Categoría
          </button>
          <button className="btn-secondary">
            🔖 Nueva Etiqueta
          </button>
        </div>
      </div>
    </div>
  );
}
