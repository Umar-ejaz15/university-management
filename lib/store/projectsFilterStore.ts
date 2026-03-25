import { create } from 'zustand';

/**
 * Persistent filter state for the public Research Projects page.
 * Stored in Zustand so filters survive navigation — go back and your
 * search / status / department selection is still there.
 */

interface ProjectsFilterStore {
  search: string;
  statusFilter: string;
  deptFilter: string;

  setSearch: (v: string) => void;
  setStatusFilter: (v: string) => void;
  setDeptFilter: (v: string) => void;
  clearFilters: () => void;
}

export const useProjectsFilterStore = create<ProjectsFilterStore>((set) => ({
  search: '',
  statusFilter: 'all',
  deptFilter: 'all',

  setSearch:       (v) => set({ search: v }),
  setStatusFilter: (v) => set({ statusFilter: v }),
  setDeptFilter:   (v) => set({ deptFilter: v }),
  clearFilters: () => set({ search: '', statusFilter: 'all', deptFilter: 'all' }),
}));
