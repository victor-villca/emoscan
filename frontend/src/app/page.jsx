'use client';

import { useEffect, useState } from 'react';
import Head from 'next/head';
import DashboardHeader from '@/components/home/HomeHeader';
import SessionCards from '@/components/home/SessionCards';
import SessionCardSkeleton from '@/components/home/SessionCardSkeleton';
import PaginationControls from '@/components/home/PaginationControls';

import { SessionData } from '../types/sessionTypes';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const SESSIONS_PER_PAGE = 6;
const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { data: session, status } = useSession();

  useEffect(() => {
    if (!session?.user?.userId) return;

    const fetchSessions = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sessions?userId=${session.user.userId}&page=${currentPage}&limit=${SESSIONS_PER_PAGE}`
        );
        const data = await response.json();
        setSessions(data.sessions || []);
        setTotalPages(data.totalPages || 1);
        setError(null);
      } catch (err) {
        setError('Failed to load sessions. Please try again later.');
        setSessions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, [session?.user?.userId, currentPage]);

  const filteredSessions = searchQuery
    ? sessions.filter((session) =>
        (session.name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
      )
    : sessions;

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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Recent Sessions
              </h2>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <SessionCardSkeleton key={i} />
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-10">...</div>
            ) : (
              <>
                <SessionCards sessions={filteredSessions} />
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </motion.div>
        </main>
      </div>
    </>
  );
};

export default Dashboard;
