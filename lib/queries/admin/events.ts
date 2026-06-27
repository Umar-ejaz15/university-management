import { useQuery } from '@tanstack/react-query';

export interface AdminEvent {
  id: string;
  title: string;
  category?: string | null;
  eventDate?: string | null;
  venue?: string | null;
  leadOrganizer?: string | null;
  arrangedOrParticipated?: string | null;
  participants?: number | null;
  scope: string;
  staff?: { name: string } | null;
}

async function fetchAdminEvents(): Promise<{ events: AdminEvent[] }> {
  const res = await fetch('/api/admin/events');
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
}

export function useAdminEvents() {
  return useQuery({
    queryKey: ['admin', 'events'],
    queryFn: fetchAdminEvents,
    staleTime: 30 * 1000,
  });
}
