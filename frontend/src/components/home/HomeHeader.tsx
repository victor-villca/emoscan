'use client';

import { FC, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface DashboardHeaderProps {
  name: string;
}

const DashboardHeader: FC<DashboardHeaderProps> = ({ name }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isModalOpen, setModalOpen] = useState(false);
  const [sessionName, setSessionName] = useState('');

  const generateSessionCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createNewSession = async () => {
    const code = generateSessionCode();

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: session?.user?.userId,
        name: sessionName.trim() || 'Untitled Session',
        date: new Date().toISOString().split('T')[0],
        start_time: '09:00',
        end_time: '10:00',
        code,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Error creating session:', errText);
      return;
    }

    setModalOpen(false);
    const sessionData = await res.json();
    router.push(`/live-session/${code}`);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Hello, Dr. {name}</h1>
            <p className="text-gray-500 mt-1">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="btn-primary text-white font-medium px-6 py-3 rounded-full mt-4 md:mt-0 whitespace-nowrap rounded-button flex items-center"
          >
            <div className="w-5 h-5 flex items-center justify-center mr-2">
              <i className="ri-add-line"></i>
            </div>
            Start New Session
          </button>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Name your session</h2>
            <input
              type="text"
              placeholder="Untitled Session"
              className="w-full border border-gray-300 rounded-md px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={createNewSession}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Start
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardHeader;
