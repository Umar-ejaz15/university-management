import { useQuery } from '@tanstack/react-query';

export interface AdminEquipment {
  id: string;
  srNo: number;
  name: string;
  model: string | null;
  quantity: number;
  availableQty: number;
  activeLoans: number;
  notes: string | null;
}

export interface AdminLab {
  id: string;
  name: string;
  floor: string;
  labInCharge: string;
  description: string | null;
  equipment: AdminEquipment[];
}

async function fetchAdminLabs(): Promise<AdminLab[]> {
  const res = await fetch('/api/admin/labs');
  if (!res.ok) throw new Error('Failed to fetch labs');
  const data = await res.json();
  return data.labs ?? [];
}

/** Admin labs list with all equipment. */
export function useAdminLabs() {
  return useQuery<AdminLab[]>({
    queryKey: ['admin', 'labs'],
    queryFn: fetchAdminLabs,
    staleTime: 2 * 60 * 1000,
  });
}
