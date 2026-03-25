import { useQuery } from '@tanstack/react-query';

export interface CLSRequest {
  id: string;
  teacherName: string;
  teacherEmail: string;
  equipmentName: string;
  labName: string;
  purpose: string;
  studentInfo: string | null;
  fromDate: string;
  toDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED';
  approvedAt: string | null;
  returnedAt: string | null;
  rejectionReason: string | null;
  adminNotes: string | null;
}

export interface CLSStats {
  total: number;
  pending: number;
  approved: number;
  returned: number;
  rejected: number;
}

export interface AdminEquipmentHistory {
  staffId: string;
  teacherName: string;
  teacherEmail: string;
  equipmentId: string;
  equipmentName: string;
  labName: string;
  totalRequests: number;
  pending: number;
  approved: number;
  rejected: number;
  returned: number;
  lastRequestedAt: string;
}

async function fetchAdminClsRequests(status: string): Promise<CLSRequest[]> {
  const statusParam = status === 'ALL' ? '' : status;
  const res = await fetch(`/api/admin/cls/requests?status=${statusParam}&page=1&limit=50`);
  if (!res.ok) throw new Error('Failed to fetch CLS requests');
  const data = await res.json();
  return data.requests ?? [];
}

async function fetchAdminClsStats(): Promise<CLSStats> {
  const res = await fetch('/api/admin/cls/stats');
  if (!res.ok) throw new Error('Failed to fetch CLS stats');
  return res.json();
}

async function fetchAdminClsHistory(): Promise<AdminEquipmentHistory[]> {
  const res = await fetch('/api/admin/cls/history');
  if (!res.ok) throw new Error('Failed to fetch CLS history');
  const data = await res.json();
  return data.history ?? [];
}

/**
 * Admin CLS requests, filtered by status tab.
 * Each tab gets its own cache entry — switching tabs is instant on revisit.
 */
export function useAdminClsRequests(status: string) {
  return useQuery<CLSRequest[]>({
    queryKey: ['admin', 'cls', 'requests', status],
    queryFn: () => fetchAdminClsRequests(status),
    staleTime: 60 * 1000,
  });
}

export function useAdminClsStats() {
  return useQuery<CLSStats>({
    queryKey: ['admin', 'cls', 'stats'],
    queryFn: fetchAdminClsStats,
    staleTime: 60 * 1000,
  });
}

export function useAdminClsHistory() {
  return useQuery<AdminEquipmentHistory[]>({
    queryKey: ['admin', 'cls', 'history'],
    queryFn: fetchAdminClsHistory,
    staleTime: 2 * 60 * 1000,
  });
}
