'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FlaskConical,
  Award,
  Handshake,
  Briefcase,
  CalendarDays,
  LogOut,
  ChevronRight,
  FileText,
  ShieldCheck,
  Shield,
  FileSearch,
  BarChart3,
} from 'lucide-react';
import { useLogout, useCurrentUser } from '@/lib/queries/auth';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: 'Dashboard',         href: '/oric-admin',                    icon: LayoutDashboard },
  { label: 'Projects',          href: '/oric-admin/projects',           icon: FlaskConical    },
  { label: 'Patents & IP',      href: '/oric-admin/patents',            icon: Award           },
  { label: 'IP Disclosures',    href: '/oric-admin/ip-disclosures',     icon: FileSearch      },
  { label: 'IP Licensing',      href: '/oric-admin/ip-licensing',       icon: Shield          },
  { label: 'Consultancies',     href: '/oric-admin/consultancies',      icon: Briefcase       },
  { label: 'MoUs & Linkages',   href: '/oric-admin/mous',               icon: Handshake       },
  { label: 'Events',            href: '/oric-admin/events',             icon: CalendarDays    },
  { label: 'Industrial Visits', href: '/oric-admin/visits',             icon: FlaskConical    },
  { label: 'Policy Advocacy',   href: '/oric-admin/policy',             icon: FileText        },
  { label: 'HEC Reports',       href: '/oric-admin/reports',            icon: BarChart3       },
];

export default function OricAdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();
  const { data: user } = useCurrentUser();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const getInitials = (name: string) =>
    name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  const isActive = (href: string) => {
    if (href === '/oric-admin') return pathname === '/oric-admin';
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col sticky top-0 h-screen overflow-y-auto shadow-sm z-30 shrink-0">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1a3d2b]/10 flex items-center justify-center shrink-0">
            <Image
              src="/logo.png"
              alt="MNSUAM"
              width={28}
              height={28}
              className="object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">MNSUAM</p>
            <p className="text-[10px] text-[#c9a961] font-semibold uppercase tracking-wider">
              ORIC Portal
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
          ORIC Management
        </p>
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-[#1a3d2b] text-white shadow-sm shadow-[#1a3d2b]/20'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    active ? 'text-[#c9a961]' : 'text-gray-400 group-hover:text-gray-600'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {!active && (
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-400 transition-colors" />
              )}
            </Link>
          );
        })}

        {/* Separator */}
        <div className="pt-3 pb-1">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            Public View
          </p>
        </div>
        <Link
          href="/oric"
          className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
        >
          <ShieldCheck className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
          <span>ORIC Public Page</span>
        </Link>
      </nav>

      {/* User + Logout */}
      <div className="px-3 pb-4 border-t border-gray-100 pt-3">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-xl bg-gray-50">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1a3d2b] to-[#2d6a4f] flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">{getInitials(user.name)}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-900 truncate">{user.name}</p>
              <p className="text-[10px] text-[#c9a961] truncate font-medium">ORIC Admin</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
