'use client';
import { useSession } from 'next-auth/react';

export function AuthenticationVerify({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
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

  return <div>{children}</div>;
}
