import { useState, useMemo } from 'react';
import { SessionListItem } from '../types/sessionTypes';

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

const defaultFilters: FilterState = {
  searchQuery: '',
  dateFilter: 'all',
  sessionType: 'all',
  sortBy: 'date-desc',
};

export const useSessionFilters = (sessions: SessionListItem[]) => {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const filteredSessions = useMemo(() => {
    let filtered = [...sessions];

    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase().trim();
      filtered = filtered.filter((session) =>
        session.name.toLowerCase().includes(query)
      );
    }

    if (filters.dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter((session) => {
        const sessionDate = new Date(session.date);

        switch (filters.dateFilter) {
          case 'today':
            const todayEnd = new Date(today);
            todayEnd.setDate(today.getDate() + 1);
            return sessionDate >= today && sessionDate < todayEnd;

          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(today.getDate() - 7);
            return sessionDate >= weekAgo && sessionDate <= now;

          case 'month':
            const monthAgo = new Date(today);
            monthAgo.setDate(today.getDate() - 30);
            return sessionDate >= monthAgo && sessionDate <= now;

          case 'quarter':
            const quarterAgo = new Date(today);
            quarterAgo.setDate(today.getDate() - 90);
            return sessionDate >= quarterAgo && sessionDate <= now;

          default:
            return true;
        }
      });
    }

    if (filters.sessionType !== 'all') {
      filtered = filtered.filter((session) => {
        switch (filters.sessionType) {
          case 'individual':
            return session.participantCount === 1;
          case 'group':
            return session.participantCount >= 2;
          default:
            return true;
        }
      });
    }

    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'duration-desc':
          return b.durationMinutes - a.durationMinutes;
        case 'duration-asc':
          return a.durationMinutes - b.durationMinutes;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [sessions, filters]);

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  const hasActiveFilters =
    filters.searchQuery.trim() !== '' ||
    filters.dateFilter !== 'all' ||
    filters.sessionType !== 'all';

  return {
    filters,
    setFilters,
    filteredSessions,
    clearFilters,
    hasActiveFilters,
    totalSessions: sessions.length,
    filteredCount: filteredSessions.length,
  };
};
