import { create } from 'zustand';

/**
 * Shared filter state for the Admin Verifications page.
 */
interface VerificationsFilterStore {
  search: string;
  setSearch: (v: string) => void;
  clearSearch: () => void;
}

export const useVerificationsFilterStore = create<VerificationsFilterStore>((set) => ({
  search: '',
  setSearch: (v) => set({ search: v }),
  clearSearch: () => set({ search: '' }),
}));
