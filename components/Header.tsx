'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', href: '/uni-dashboard' },
  { label: 'Add Faculty', href: '/add-faculty' },
  { label: 'Admin Review', href: '/admin-review' },
  { label: 'My Profile', href: '/faculty' },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-[#2d6a4f] text-white">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <Link href="/" className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="MNSUAM Logo" 
              className="w-12 h-12"
            />
            <span className="text-xl font-semibold">Faculty Management</span>
          </Link>

          {/* Navigation */}
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
            <button className="bg-[#c9a961] hover:bg-[#b89850] text-white px-5 py-2 rounded-md text-sm font-medium transition-colors">
              Login
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
