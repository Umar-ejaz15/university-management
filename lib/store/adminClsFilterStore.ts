import { create } from 'zustand';

type TabValue = 'ALL' | 'PENDING' | 'APPROVED' | 'RETURNED' | 'REJECTED';

/**
 * Shared filter state for the Admin CLS (Central Lab System) page.
 * Persists the active tab so returning to the page keeps your view.
 */
interface AdminClsFilterStore {
  activeTab: TabValue;
  setActiveTab: (tab: TabValue) => void;
}

export const useAdminClsFilterStore = create<AdminClsFilterStore>((set) => ({
  activeTab: 'ALL',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
