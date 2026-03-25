'use client';

/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ChevronDown, LogOut, UserCircle, FlaskConical, Settings } from 'lucide-react';
import { useCurrentUser, useLogout } from '@/lib/queries/auth';

interface NavItem {
  label: string;
  href: string;
  /** Path prefix used for active matching — defaults to href */
  match?: string;
}

// Public nav — shown to everyone
const publicNavItems: NavItem[] = [
  { label: 'Dashboard',       href: '/uni-dashboard' },
  { label: 'Faculties',       href: '/faculties',     match: '/faculties' },
  { label: 'Faculty Members', href: '/staff',         match: '/staff' },
];

const getAdditionalNavItems = (role: string): NavItem[] => {
  if (role === 'ADMIN') {
    return [
      { label: 'Central Lab System', href: '/cls',   match: '/cls'   },
      { label: 'Admin Panel',        href: '/admin', match: '/admin' },
    ];
  }
  if (role === 'FACULTY') {
    return [
      { label: 'Central Lab System', href: '/cls',     match: '/cls'     },
      { label: 'My Profile',         href: '/faculty', match: '/faculty' },
    ];
  }
  return [];
};

const getNavItems = (role: string | undefined): NavItem[] =>
  role ? [...publicNavItems, ...getAdditionalNavItems(role)] : publicNavItems;

/** Returns true when the nav item should be highlighted for the current path */
function isActive(pathname: string, item: NavItem): boolean {
  const prefix = item.match ?? item.href;
  if (prefix === '/uni-dashboard') return pathname === '/uni-dashboard' || pathname === '/';
  return pathname === prefix || pathname.startsWith(prefix + '/');
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function Header() {
  const pathname       = usePathname();
  const router         = useRouter();
  const logout         = useLogout();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Single cached request shared across the entire app —
  // navigating between pages does NOT trigger a new /api/auth/me call.
  const { data: user, isLoading: loading } = useCurrentUser();

  // Redirect faculty users who haven't completed onboarding
  useEffect(() => {
    if (
      user?.role === 'FACULTY' &&
      !user.staffId &&
      !pathname.startsWith('/onboarding')
    ) {
      router.push('/onboarding/teacher');
    }
  }, [user, pathname, router]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    router.push('/');
    router.refresh();
  };

  const navItems = getNavItems(user?.role);

  return (
    <header className="bg-[#2d6a4f] text-white shadow-md">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Brand ─────────────────────────────────────────────────────── */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <img
              src="/logo.png"
              alt="MNSUAM Logo"
              className="w-10 h-10 rounded-lg object-contain"
            />
            <div className="leading-none">
              <span className="block text-base font-bold tracking-tight text-white group-hover:text-white/90 transition-colors">
                Peer Review Dashboard
              </span>
              <span className="block text-[10px] text-white/55 font-medium tracking-wide uppercase mt-0.5">
                MNSUAM · Faculty Portal
              </span>
            </div>
          </Link>

          {/* ── Nav links ─────────────────────────────────────────────────── */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = isActive(pathname, item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'text-white bg-white/15'
                      : 'text-white/75 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-0.5 bg-[#c9a961] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── Auth area ─────────────────────────────────────────────────── */}
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="w-24 h-9 bg-white/20 rounded-lg animate-pulse" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all"
                >
                  <span className="w-6 h-6 rounded-full bg-[#c9a961] text-[#1a3d2b] flex items-center justify-center text-xs font-bold shrink-0">
                    {getInitials(user.name)}
                  </span>
                  <span className="max-w-28 truncate hidden sm:block">{user.name}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-white/70 transition-transform duration-200 ${
                      dropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {dropdownOpen && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setDropdownOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl z-40 overflow-hidden border border-gray-100">
                      {/* User info */}
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#2d6a4f] text-white flex items-center justify-center text-sm font-bold shrink-0">
                            {getInitials(user.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                        </div>
                        <span className={`inline-block mt-2 px-2 py-0.5 text-xs font-semibold rounded-full ${
                          user.role === 'ADMIN'
                            ? 'bg-[#2d6a4f]/10 text-[#2d6a4f]'
                            : 'bg-[#c9a961]/15 text-[#8a6b2e]'
                        }`}>
                          {user.role}
                        </span>
                      </div>

                      {/* Menu items */}
                      <div className="py-1">
                        {user.role === 'FACULTY' && (
                          <Link
                            href="/faculty"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <UserCircle className="w-4 h-4 text-gray-400" />
                            My Profile
                          </Link>
                        )}
                        {user.role === 'ADMIN' && (
                          <Link
                            href="/admin"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Settings className="w-4 h-4 text-gray-400" />
                            Admin Panel
                          </Link>
                        )}
                        <Link
                          href="/cls"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <FlaskConical className="w-4 h-4 text-gray-400" />
                          Central Lab System
                        </Link>
                      </div>

                      <div className="border-t border-gray-100 py-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-[#c9a961] hover:bg-[#b89850] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
              >
                Login
              </Link>
            )}
          </div>

        </div>
      </div>

      {/* ── Mobile nav (below md) ──────────────────────────────────────────── */}
      <div className="md:hidden border-t border-white/10 px-4 py-2 flex overflow-x-auto gap-1 scrollbar-hide">
        {navItems.map((item) => {
          const active = isActive(pathname, item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                active
                  ? 'bg-white/15 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
