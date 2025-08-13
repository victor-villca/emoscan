import React from 'react';
import { Search, Calendar, Users, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  type: 'no-results' | 'no-sessions';
  onClearFilters?: () => void;
  searchQuery?: string;
  hasActiveFilters?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  onClearFilters,
  searchQuery,
  hasActiveFilters,
}) => {
  if (type === 'no-sessions') {
    return (
      <div className="text-center py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay sesiones aún
          </h3>
          <p className="text-gray-600 mb-4">
            Comienza creando tu primera sesión para ver el historial aquí.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors">
            Crear primera sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="h-8 w-8 text-gray-400" />
        </div>

        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No se encontraron sesiones
        </h3>

        <div className="space-y-2 text-gray-600 mb-6">
          <p>No hay sesiones que coincidan con tus criterios de búsqueda.</p>

          {searchQuery && (
            <p className="text-sm">
              Término buscado:{' '}
              <span className="font-medium">"{searchQuery}"</span>
            </p>
          )}

          <p className="text-sm">
            Intenta con diferentes términos o ajusta los filtros.
          </p>
        </div>

        {hasActiveFilters && onClearFilters && (
          <button
            onClick={onClearFilters}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Limpiar todos los filtros
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
