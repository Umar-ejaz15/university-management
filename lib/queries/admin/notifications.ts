import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useNotificationStore, type AdminNotification } from '@/lib/store/notificationStore';

interface NotificationsResponse {
  notifications: AdminNotification[];
  unreadCount: number;
}

async function fetchNotifications(): Promise<NotificationsResponse> {
  const res = await fetch('/api/admin/notifications');
  if (!res.ok) return { notifications: [], unreadCount: 0 };
  return res.json();
}

export function useAdminNotifications() {
  const setData = useNotificationStore((s) => s.setData);

  const query = useQuery<NotificationsResponse>({
    queryKey: ['admin', 'notifications'],
    queryFn: fetchNotifications,
    staleTime: 0,
    refetchInterval: 30_000,
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    if (query.data) setData(query.data);
  }, [query.data, setData]);

  return query;
}
