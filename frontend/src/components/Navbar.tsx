'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useEffect } from 'react';

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();

  // Load Remix Icon and other external styles
  useEffect(() => {
    // Load Remix Icon CSS
    const remixLink = document.createElement('link');
    remixLink.href =
      'https://cdn.jsdelivr.net/npm/remixicon@4.5.0/fonts/remixicon.css';
    remixLink.rel = 'stylesheet';
    document.head.appendChild(remixLink);

    // Load Pacifico font
    const fontLink = document.createElement('link');
    fontLink.href =
      'https://fonts.googleapis.com/css2?family=Pacifico&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    return () => {
      document.head.removeChild(remixLink);
      document.head.removeChild(fontLink);
    };
  }, []);

  const userInitials =
    session?.user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'JM';

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link
            href="/"
            style={{ fontFamily: "'Pacifico', cursive" }}
            className="text-[#4A90E2] text-2xl"
          >
            EmotiSense
          </Link>
          <nav className="ml-10 hidden md:block">
            <ul className="flex space-x-8">
              <li>
                <Link href="/dashboard" className="text-[#4A90E2] font-medium">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/sessions"
                  className="text-gray-600 hover:text-[#4A90E2]"
                >
                  Sessions
                </Link>
              </li>
              <li>
                <Link
                  href="/reports"
                  className="text-gray-600 hover:text-[#4A90E2]"
                >
                  Reports
                </Link>
              </li>
              <li>
                <Link
                  href="/resources"
                  className="text-gray-600 hover:text-[#4A90E2]"
                >
                  Resources
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {session?.user ? (
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-10 h-10 flex items-center justify-center text-gray-500 cursor-pointer hover:text-[#4A90E2]">
                <i className="ri-notification-3-line text-lg"></i>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt="User Avatar"
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#4A90E2]/10 flex items-center justify-center text-[#4A90E2] font-medium">
                  {userInitials}
                </div>
              )}
              <span className="hidden md:inline text-sm font-medium">
                {session.user.name || 'Dr. Jennifer Miller'}
              </span>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="bg-gradient-to-r from-[#4A90E2] to-[#357ABD] text-white font-medium px-6 py-3 rounded-lg hover:scale-[1.03] transition-all shadow-md hover:shadow-lg hover:shadow-[#4A90E2]/30 text-sm"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={() => router.push('/login')}
            className="bg-gradient-to-r from-[#4A90E2] to-[#357ABD] text-white font-medium px-6 py-3 rounded-lg hover:scale-[1.03] transition-all shadow-md hover:shadow-lg hover:shadow-[#4A90E2]/30 text-sm"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
