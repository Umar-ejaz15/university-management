import { useQuery } from '@tanstack/react-query';

export interface Equipment {
  id: string;
  srNo: number;
  name: string;
  model: string | null;
  quantity: number;
  availableQty: number;
  activeLoans: number;
  notes: string | null;
  labId: string;
}

export interface Lab {
  id: string;
  name: string;
  floor: 'GROUND FLOOR' | 'FIRST FLOOR';
  labInCharge: string;
  equipment: Equipment[];
}

export interface EquipmentRequest {
  id: string;
  purpose: string;
  studentInfo: string | null;
  requestedFrom: string;
  requestedTo: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED';
  adminNotes: string | null;
  approvedAt: string | null;
  borrowedAt: string | null;
  returnedAt: string | null;
  equipment: {
    id: string;
    name: string;
    model: string | null;
    srNo: number;
    lab: { id: string; name: string };
  };
}

export interface EquipmentHistory {
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

async function fetchClsLabs(): Promise<Lab[]> {
  const res = await fetch('/api/cls/labs');
  if (!res.ok) throw new Error('Failed to fetch labs');
  const data = await res.json();
  return data.labs ?? [];
}

async function fetchClsRequests(): Promise<EquipmentRequest[]> {
  const res = await fetch('/api/cls/requests');
  if (!res.ok) throw new Error('Failed to fetch requests');
  const data = await res.json();
  return data.requests ?? [];
}

async function fetchClsHistory(): Promise<EquipmentHistory[]> {
  const res = await fetch('/api/cls/history');
  if (!res.ok) throw new Error('Failed to fetch history');
  const data = await res.json();
  return data.history ?? [];
}

/** Faculty-facing: available labs and equipment catalog. */
export function useClsLabs() {
  return useQuery<Lab[]>({
    queryKey: ['cls', 'labs'],
    queryFn: fetchClsLabs,
    staleTime: 2 * 60 * 1000,
  });
}

/** Faculty-facing: current user's equipment requests. */
export function useClsRequests() {
  return useQuery<EquipmentRequest[]>({
    queryKey: ['cls', 'requests'],
    queryFn: fetchClsRequests,
    staleTime: 60 * 1000,
  });
}

/** Faculty-facing: equipment usage history. */
export function useClsHistory() {
  return useQuery<EquipmentHistory[]>({
    queryKey: ['cls', 'history'],
    queryFn: fetchClsHistory,
    staleTime: 2 * 60 * 1000,
  });
}
