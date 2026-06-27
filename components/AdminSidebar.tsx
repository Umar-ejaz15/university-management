'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  GraduationCap,
  FlaskConical,
  LogOut,
  ChevronRight,
  Briefcase,
  UserCheck,
  CalendarDays,
  Users,
} from 'lucide-react';
import { useLogout, useCurrentUser } from '@/lib/queries/auth';
import { usePendingFaculty, useAdminStats } from '@/lib/queries/admin/stats';

// ─── Nav items ────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

function getNavItems(
  pendingApplications: number,
  pendingCls: number,
): NavItem[] {
  return [
    { label: 'Dashboard',       href: '/admin',                 icon: LayoutDashboard },
    {
      label: 'Applications',
      href: '/admin/applications',
      icon: UserCheck,
      badge: pendingApplications > 0 ? pendingApplications : undefined,
    },
    { label: 'Faculties',        href: '/admin/faculties',       icon: GraduationCap   },
    { label: 'Departments',     href: '/admin/departments',     icon: Building2       },
    { label: 'Faculty Members', href: '/admin/staff',           icon: Users           },
    { label: 'Labs',            href: '/admin/labs',            icon: FlaskConical    },
    {
      label: 'CLS Requests',
      href: '/admin/cls',
      icon: Briefcase,
      badge: pendingCls > 0 ? pendingCls : undefined,
    },
    { label: 'Events',          href: '/admin/events',          icon: CalendarDays    },
  ];
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();
  const { data: user } = useCurrentUser();
  const { data: pendingFaculty = [] } = usePendingFaculty();
  const { data: stats } = useAdminStats();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const getInitials = (name: string) =>
    name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  const pendingCls = stats?.pendingClsCount ?? 0;

  const navItems = getNavItems(pendingFaculty.length, pendingCls);

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col sticky top-0 h-screen overflow-y-auto shadow-sm z-30 shrink-0">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2d6a4f]/10 flex items-center justify-center shrink-0">
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
              Admin Portal
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
          Management
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
                  ? 'bg-[#2d6a4f] text-white shadow-sm shadow-[#2d6a4f]/20'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                      active
                        ? 'bg-white/20 text-white'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {!active && (
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-400 transition-colors" />
                )}
              </div>
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
          href="/uni-dashboard"
          className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
        >
          <LayoutDashboard className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
          <span>University Dashboard</span>
        </Link>
      </nav>

      {/* User + Logout */}
      <div className="px-3 pb-4 border-t border-gray-100 pt-3">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-xl bg-gray-50">
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#2d6a4f] to-[#40916c] flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">{getInitials(user.name)}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-900 truncate">{user.name}</p>
              <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
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
