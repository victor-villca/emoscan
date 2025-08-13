'use client';

import { useEffect, useState, useMemo } from 'react';
import DashboardHeader from '@/components/home/HomeHeader';
import SessionCards from '@/components/home/SessionCards';
import SessionCardSkeleton from '@/components/home/SessionCardSkeleton';
import PaginationControls from '@/components/home/PaginationControls';
import SessionControlsBar from '@/components/home/SessionControlsBar';
import EmptyState from '@/components/home/EmptyState';

import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { useSessionFilters } from '@/hooks/useSessionFilters';

const SESSIONS_PER_PAGE = 6;

const Dashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { data: session, status } = useSession();

  const {
    filters,
    setFilters,
    filteredSessions,
    clearFilters,
    hasActiveFilters,
    totalSessions,
    filteredCount,
  } = useSessionFilters(sessions);

  useEffect(() => {
    if (!session?.user?.userId) return;

    const fetchSessions = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sessions?userId=${session.user.userId}&page=1&limit=1000`
        );
        const data = await response.json();
        setSessions(data.sessions || []);
        const totalSessionsCount = data.sessions?.length || 0;
        setTotalPages(Math.ceil(totalSessionsCount / SESSIONS_PER_PAGE));
        setError(null);
      } catch (err) {
        setError('Failed to load sessions. Please try again later.');
        setSessions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, [session?.user?.userId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const paginatedSessions = useMemo(() => {
    const startIndex = (currentPage - 1) * SESSIONS_PER_PAGE;
    const endIndex = startIndex + SESSIONS_PER_PAGE;
    return filteredSessions.slice(startIndex, endIndex);
  }, [filteredSessions, currentPage]);

  const actualTotalPages = useMemo(() => {
    return Math.ceil(filteredSessions.length / SESSIONS_PER_PAGE);
  }, [filteredSessions.length]);

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] text-center px-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">
            Please log in to view your sessions
          </h1>
          <p className="text-gray-600">
            You must be signed in to access the dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const renderSessionsContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <SessionCardSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-10">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Reintentar
          </button>
        </div>
      );
    }

    if (totalSessions === 0) {
      return <EmptyState type="no-sessions" />;
    }

    if (filteredCount === 0) {
      return (
        <EmptyState
          type="no-results"
          onClearFilters={clearFilters}
          searchQuery={filters.searchQuery}
          hasActiveFilters={hasActiveFilters}
        />
      );
    }

    return (
      <>
        <SessionCards sessions={paginatedSessions} />
        {actualTotalPages > 1 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={actualTotalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-[#F8F9FA]">
        <main className="container mx-auto px-4 py-6">
          <DashboardHeader name={session?.user?.name} />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Sesiones</h2>
            </div>

            {totalSessions > 0 && (
              <SessionControlsBar
                filters={filters}
                onFiltersChange={setFilters}
                resultsCount={filteredCount}
                totalCount={totalSessions}
                currentPage={currentPage}
                totalPages={actualTotalPages}
                sessionsPerPage={SESSIONS_PER_PAGE}
              />
            )}
            {renderSessionsContent()}
          </motion.div>
        </main>
      </div>
    </>
  );
};

export default Dashboard;
