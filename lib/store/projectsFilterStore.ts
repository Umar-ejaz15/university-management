import { create } from 'zustand';

interface ProjectsFilterStore {
  search: string;
  statusFilter: string;
  kindFilter: string;
  scopeFilter: string;
  deptFilter: string;
  dateFrom: string;
  dateTo: string;

  setSearch:       (v: string) => void;
  setStatusFilter: (v: string) => void;
  setKindFilter:   (v: string) => void;
  setScopeFilter:  (v: string) => void;
  setDeptFilter:   (v: string) => void;
  setDateFrom:     (v: string) => void;
  setDateTo:       (v: string) => void;
  clearFilters:    () => void;
}

export const useProjectsFilterStore = create<ProjectsFilterStore>((set) => ({
  search: '',
  statusFilter: 'all',
  kindFilter: 'all',
  scopeFilter: 'all',
  deptFilter: 'all',
  dateFrom: '',
  dateTo: '',

  setSearch:       (v) => set({ search: v }),
  setStatusFilter: (v) => set({ statusFilter: v }),
  setKindFilter:   (v) => set({ kindFilter: v }),
  setScopeFilter:  (v) => set({ scopeFilter: v }),
  setDeptFilter:   (v) => set({ deptFilter: v }),
  setDateFrom:     (v) => set({ dateFrom: v }),
  setDateTo:       (v) => set({ dateTo: v }),
  clearFilters: () =>
    set({ search: '', statusFilter: 'all', kindFilter: 'all', scopeFilter: 'all', deptFilter: 'all', dateFrom: '', dateTo: '' }),
}));
