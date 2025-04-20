"use client";

import { useEffect, useState } from 'react';
import Head from 'next/head';
import DashboardHeader from '@/components/home/HomeHeader';
import SessionCards from '@/components/home/SessionCards';
import { SessionData } from '../types/sessionTypes';
import { useSession } from 'next-auth/react';

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { data: session, status } = useSession();

  useEffect(() => {
    if (!session?.user?.userId) return;

    const fetchSessions = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:4000/api/sessions?userId=${session.user.userId}`);
        const data = await response.json();
        setSessions(data);
        setError(null);
      } catch (err) {
        setError('Failed to load sessions. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, [session?.user?.userId]);

  const filteredSessions = searchQuery
  ? sessions.filter(session =>
      (session.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()))
  : sessions;

  // ✅ If not logged in
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] text-center px-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">Please log in to view your sessions</h1>
          <p className="text-gray-600">You must be signed in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  // ✅ While loading the session
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // ✅ Main dashboard
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <main className="container mx-auto px-4 py-6">
        <DashboardHeader name={session.user.name} />

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Recent Sessions</h2>
            <div className="relative">
              <div className="flex items-center bg-white rounded-lg shadow-sm px-3 py-2">
                <div className="w-5 h-5 flex items-center justify-center text-gray-400">
                  <i className="ri-search-line"></i>
                </div>
                <input 
                  type="text" 
                  placeholder="Search sessions" 
                  className="ml-2 text-sm border-none bg-transparent w-40 md:w-60"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-10">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading sessions...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-10 h-10 flex items-center justify-center text-gray-400 mx-auto mb-2">
                <i className="ri-file-list-3-line ri-2x"></i>
              </div>
              <p className="text-gray-600">No sessions found</p>
            </div>
          ) : (
            <SessionCards sessions={filteredSessions} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
