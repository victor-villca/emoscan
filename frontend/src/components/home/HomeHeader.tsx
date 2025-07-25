'use client';

import { FC } from 'react';
import { useRouter } from 'next/navigation'; // si usas App Router
import { useSession } from 'next-auth/react';

interface DashboardHeaderProps {
  name: string;
}

const DashboardHeader: FC<DashboardHeaderProps> = ({ name }) => {
  const currentDate = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  const formattedDate = currentDate.toLocaleDateString('en-US', options);

  const { data: session } = useSession();
  const router = useRouter();

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
        name: 'Session Name',
        date: new Date().toISOString().split('T')[0],
        start_time: '09:00',
        end_time: '10:00',
        code,
      }),
    });

    if (!res.ok) {
      console.error('Error creating session');
      return;
    }

    router.push(`/live-session/${code}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Hello, Dr. {name}
          </h1>
          <p className="text-gray-500 mt-1">{formattedDate}</p>
        </div>
        <button
          onClick={createNewSession}
          className="btn-primary text-white font-medium px-6 py-3 rounded-full mt-4 md:mt-0 whitespace-nowrap rounded-button flex items-center"
        >
          <div className="w-5 h-5 flex items-center justify-center mr-2">
            <i className="ri-add-line"></i>
          </div>
          Start New Session
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;
