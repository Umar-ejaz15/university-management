'use client';

import { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Bell, Clock, X, Wallet, CheckCircle, Check, UserCheck, FlaskConical } from 'lucide-react';
import { useAdminNotifications } from '@/lib/queries/admin/notifications';
import { useNotificationStore, type AdminNotification } from '@/lib/store/notificationStore';
import { useCurrentUser } from '@/lib/queries/auth';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function NotifIcon({ type }: { type: string }) {
  if (type === 'PROJECT_SUBMITTED') return <Wallet className="w-3.5 h-3.5 text-[#c9a961]" />;
  if (type === 'PROJECT_APPROVED')  return <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />;
  if (type === 'FACULTY_APPLIED')   return <UserCheck className="w-3.5 h-3.5 text-blue-500" />;
  if (type === 'CLS_REQUEST')       return <FlaskConical className="w-3.5 h-3.5 text-purple-500" />;
  return <Bell className="w-3.5 h-3.5 text-gray-400" />;
}

// ─── Dropdown panel ───────────────────────────────────────────────────────────

function NotificationDropdown({ onClose }: { onClose: () => void }) {
  const router       = useRouter();
  const queryClient  = useQueryClient();
  const notifications = useNotificationStore((s) => s.notifications);
  const markAllRead  = useNotificationStore((s) => s.markAllRead);
  const markRead     = useNotificationStore((s) => s.markRead);
  const ref          = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const handleMarkAll = async () => {
    await fetch('/api/admin/notifications', { method: 'PATCH' });
    markAllRead();
    queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
  };

  const handleClick = async (n: AdminNotification) => {
    if (!n.isRead) {
      await fetch(`/api/admin/notifications/${n.id}`, { method: 'PATCH' });
      markRead(n.id);
    }
    if (n.link) router.push(n.link);
    onClose();
  };

  return (
    <div
      ref={ref}
      className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
    >
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
        <span className="text-sm font-semibold text-gray-900">Notifications</span>
        <div className="flex items-center gap-2">
          <button onClick={handleMarkAll}
            className="flex items-center gap-1 text-xs text-[#2d6a4f] font-medium hover:underline">
            <Check className="w-3 h-3" /> Mark all read
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
        {notifications.length === 0 ? (
          <div className="py-10 text-center">
            <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400 font-medium">All caught up</p>
            <p className="text-xs text-gray-300 mt-0.5">No notifications yet</p>
          </div>
        ) : (
          notifications.map((n) => (
            <button key={n.id} onClick={() => handleClick(n)}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50/80 transition-colors flex gap-3 ${!n.isRead ? 'bg-[#2d6a4f]/[0.03]' : ''}`}>
              <div className="w-7 h-7 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                <NotifIcon type={n.type} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-gray-900 truncate">{n.title}</p>
                  {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-[#2d6a4f] shrink-0" />}
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />{timeAgo(n.createdAt)}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Top bar ──────────────────────────────────────────────────────────────────

export default function AdminTopBar() {
  // Bootstrap polling — runs once when the admin area mounts
  useAdminNotifications();

  const { data: user } = useCurrentUser();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const panelOpen   = useNotificationStore((s) => s.panelOpen);
  const togglePanel = useNotificationStore((s) => s.togglePanel);
  const closePanel  = useNotificationStore((s) => s.closePanel);

  function getInitials(name: string) {
    return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  }

  return (
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="flex items-center justify-end gap-3 px-6 py-2.5">

        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={togglePanel}
            className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              panelOpen
                ? 'bg-[#2d6a4f] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {panelOpen && <NotificationDropdown onClose={closePanel} />}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-200" />

        {/* User chip */}
        {user && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-linear-to-br from-[#2d6a4f] to-[#40916c] flex items-center justify-center shrink-0">
              <span className="text-white text-[10px] font-bold">{getInitials(user.name)}</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-gray-800 leading-none">{user.name}</p>
              <p className="text-[10px] text-[#c9a961] font-medium mt-0.5 uppercase tracking-wide">Admin</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
