import { create } from 'zustand';

/**
 * Persistent filter state for the Faculty Members (Staff) directory page.
 * Stored in Zustand so filters survive navigation — leave the page and
 * come back without losing your search / department / designation selection.
 */

interface StaffFilterStore {
  searchQuery: string;
  selectedDepartment: string;
  selectedDesignation: string;

  setSearchQuery:        (v: string) => void;
  setSelectedDepartment: (v: string) => void;
  setSelectedDesignation:(v: string) => void;
  clearFilters: () => void;
}

export const useStaffFilterStore = create<StaffFilterStore>((set) => ({
  searchQuery: '',
  selectedDepartment: 'all',
  selectedDesignation: 'all',

  setSearchQuery:         (v) => set({ searchQuery: v }),
  setSelectedDepartment:  (v) => set({ selectedDepartment: v }),
  setSelectedDesignation: (v) => set({ selectedDesignation: v }),
  clearFilters: () => set({ searchQuery: '', selectedDepartment: 'all', selectedDesignation: 'all' }),
}));
