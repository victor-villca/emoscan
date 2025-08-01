'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const remixLink = document.createElement('link');
    remixLink.href = 'https://cdn.jsdelivr.net/npm/remixicon@4.5.0/fonts/remixicon.css';
    remixLink.rel = 'stylesheet';
    document.head.appendChild(remixLink);

    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Pacifico&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    return () => {
      document.head.removeChild(remixLink);
      document.head.removeChild(fontLink);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const userInitials = session?.user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U';

  const navLinks = [
    { href: '/', label: 'Dashboard' },
    { href: '/help', label: 'Help Center' },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" style={{ fontFamily: "'Pacifico', cursive" }} className="text-[#4A90E2] text-2xl">
            EmoScan
          </Link>
          <nav className="ml-10 hidden md:block">
            <ul className="flex space-x-8">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={`font-medium transition-colors ${pathname === link.href ? 'text-[#4A90E2]' : 'text-gray-600 hover:text-[#4A90E2]'}`}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {session?.user ? (
          <div className="flex items-center space-x-4 relative" ref={dropdownRef}>
            <div className="w-10 h-10 flex items-center justify-center text-gray-500 cursor-pointer hover:text-[#4A90E2]">
              <i className="ri-notification-3-line text-xl"></i>
            </div>

            <div onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center space-x-3 cursor-pointer">
              {session.user.image ? (
                <Image src={session.user.image} alt="User Avatar" width={40} height={40} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#4A90E2]/10 flex items-center justify-center text-[#4A90E2] font-bold">
                  {userInitials}
                </div>
              )}
              <span className="hidden md:inline text-sm font-medium text-gray-700">
                {session.user.name}
              </span>
              <i className={`ri-arrow-down-s-line text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}></i>
            </div>
            
            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2">
                <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  My Profile
                </Link>
                <button onClick={() => signOut({ callbackUrl: '/' })} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className="bg-gradient-to-r from-[#4A90E2] to-[#357ABD] text-white font-medium px-6 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm">
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}