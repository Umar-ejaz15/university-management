'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface User {
  userId: string;
  email: string;
  name: string;
  role: string;
  staffId?: string;
}

const navItems = [
  { label: 'Dashboard', href: '/uni-dashboard' },
  { label: 'Faculties', href: '/faculties' },
  { label: 'Add Faculty', href: '/add-faculty' },
  { label: 'Admin Review', href: '/admin-review' },
  { label: 'My Profile', href: '/faculty' },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        const userData = data.user;
        setUser(userData);

        // Check if FACULTY user needs onboarding
        if (userData.role === 'FACULTY' && !userData.staffId && !pathname.startsWith('/onboarding')) {
          router.push('/onboarding/teacher');
          return;
        }
      }
    } catch {
      // Not authenticated
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setDropdownOpen(false);
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-[#2d6a4f] text-white">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">

          {/* University logo and app title */}
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="MNSUAM Logo"
              className="w-12 h-12"
            />
            <span className="text-xl font-semibold">Faculty Management</span>
          </Link>

          {/* Main navigation links and auth button */}
          <nav className="flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-gray-200 ${
                  pathname === item.href ? 'text-white' : 'text-white/90'
                }`}
              >
                {item.label}
              </Link>
            ))}

            {loading ? (
              <div className="w-20 h-9 bg-white/20 rounded-md animate-pulse" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-[#c9a961] hover:bg-[#b89850] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <span className="max-w-[120px] truncate">{user.name}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 py-1">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-[#2d6a4f]/10 text-[#2d6a4f] rounded">
                          {user.role}
                        </span>
                      </div>
                      <Link
                        href="/faculty"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        My Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-[#c9a961] hover:bg-[#b89850] text-white px-5 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
