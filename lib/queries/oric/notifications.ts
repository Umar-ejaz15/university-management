import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useOricNotificationStore, type OricNotification } from '@/lib/store/oricNotificationStore';

interface NotificationsResponse {
  notifications: OricNotification[];
  unreadCount: number;
}

async function fetchOricNotifications(): Promise<NotificationsResponse> {
  const res = await fetch('/api/oric/notifications');
  if (!res.ok) return { notifications: [], unreadCount: 0 };
  return res.json();
}

export function useOricNotifications() {
  const setData = useOricNotificationStore((s) => s.setData);

  const query = useQuery<NotificationsResponse>({
    queryKey: ['oric', 'notifications'],
    queryFn: fetchOricNotifications,
    staleTime: 0,
    refetchInterval: 30_000,
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    if (query.data) setData(query.data);
  }, [query.data, setData]);

  return query;
}
