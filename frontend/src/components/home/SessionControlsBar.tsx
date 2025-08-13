import React, { useState } from 'react';
import {
  Search,
  Calendar,
  Users,
  SortAsc,
  SortDesc,
  Filter,
} from 'lucide-react';

export interface FilterState {
  searchQuery: string;
  dateFilter: 'all' | 'today' | 'week' | 'month' | 'quarter';
  sessionType: 'all' | 'individual' | 'group';
  sortBy:
    | 'date-desc'
    | 'date-asc'
    | 'duration-desc'
    | 'duration-asc'
    | 'name-asc'
    | 'name-desc';
}

interface SessionControlsBarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  resultsCount: number;
  totalCount: number;
  currentPage?: number;
  totalPages?: number;
  sessionsPerPage?: number;
}

const SessionControlsBar: React.FC<SessionControlsBarProps> = ({
  filters,
  onFiltersChange,
  resultsCount,
  totalCount,
  currentPage = 1,
  totalPages = 1,
  sessionsPerPage = 6,
}) => {
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const updateFilter = (key: keyof FilterState, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      searchQuery: '',
      dateFilter: 'all',
      sessionType: 'all',
      sortBy: 'date-desc',
    });
  };

  const hasActiveFilters =
    filters.searchQuery ||
    filters.dateFilter !== 'all' ||
    filters.sessionType !== 'all';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar sesiones por nombre..."
            value={filters.searchQuery}
            onChange={(e) => updateFilter('searchQuery', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600 whitespace-nowrap">
            {totalPages > 1 ? (
              <span>
                Mostrando{' '}
                {Math.min(
                  (currentPage - 1) * sessionsPerPage + 1,
                  resultsCount
                )}
                -{Math.min(currentPage * sessionsPerPage, resultsCount)} de{' '}
                {resultsCount}
                {resultsCount !== totalCount && ` (${totalCount} total)`}
              </span>
            ) : (
              <span>
                {resultsCount} de {totalCount} sesiones
              </span>
            )}
          </div>

          <button
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-colors ${
              hasActiveFilters
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filtros
            {hasActiveFilters && (
              <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                {
                  [
                    filters.dateFilter !== 'all',
                    filters.sessionType !== 'all',
                    filters.searchQuery.trim() !== '',
                  ].filter(Boolean).length
                }
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {isFilterExpanded && (
        <div className="border-t pt-4 space-y-4 md:space-y-0 md:flex md:items-center md:gap-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <select
              value={filters.dateFilter}
              onChange={(e) => updateFilter('dateFilter', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="all">Todas las fechas</option>
              <option value="today">Hoy</option>
              <option value="week">Última semana</option>
              <option value="month">Último mes</option>
              <option value="quarter">Últimos 3 meses</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-400" />
            <select
              value={filters.sessionType}
              onChange={(e) => updateFilter('sessionType', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="all">Todos los tipos</option>
              <option value="individual">Individual (1 participante)</option>
              <option value="group">Grupal (2+ participantes)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            {filters.sortBy.includes('-desc') ? (
              <SortDesc className="h-4 w-4 text-gray-400" />
            ) : (
              <SortAsc className="h-4 w-4 text-gray-400" />
            )}
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="date-desc">Más recientes</option>
              <option value="date-asc">Más antiguos</option>
              <option value="duration-desc">Mayor duración</option>
              <option value="duration-asc">Menor duración</option>
              <option value="name-asc">Nombre A-Z</option>
              <option value="name-desc">Nombre Z-A</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionControlsBar;
