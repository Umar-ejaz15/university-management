import { create } from 'zustand';

// ─── Shared helpers ────────────────────────────────────────────────────────────

function toggle(record: Record<string, string[]>, key: string, value: string): Record<string, string[]> {
  const current = record[key] ?? [];
  return {
    ...record,
    [key]: current.includes(value) ? current.filter((x) => x !== value) : [...current, value],
  };
}

// ─── MoUs ─────────────────────────────────────────────────────────────────────

interface OricMousFilterStore {
  search: string;
  active: Record<string, string[]>;
  mob: boolean;
  setSearch: (v: string) => void;
  toggleFilter: (k: string, v: string) => void;
  setMob: (v: boolean) => void;
  clearAll: () => void;
}

export const useOricMousFilterStore = create<OricMousFilterStore>((set) => ({
  search: '',
  active: {},
  mob: false,
  setSearch: (v) => set({ search: v }),
  toggleFilter: (k, v) => set((s) => ({ active: toggle(s.active, k, v) })),
  setMob: (v) => set({ mob: v }),
  clearAll: () => set({ search: '', active: {} }),
}));

// ─── Consultancies ────────────────────────────────────────────────────────────

interface OricConsultanciesFilterStore {
  search: string;
  active: Record<string, string[]>;
  mob: boolean;
  setSearch: (v: string) => void;
  toggleFilter: (k: string, v: string) => void;
  setMob: (v: boolean) => void;
  clearAll: () => void;
}

export const useOricConsultanciesFilterStore = create<OricConsultanciesFilterStore>((set) => ({
  search: '',
  active: {},
  mob: false,
  setSearch: (v) => set({ search: v }),
  toggleFilter: (k, v) => set((s) => ({ active: toggle(s.active, k, v) })),
  setMob: (v) => set({ mob: v }),
  clearAll: () => set({ search: '', active: {} }),
}));

// ─── Events & Visits ──────────────────────────────────────────────────────────

type EventsTab = 'events' | 'visits';

interface OricEventsFilterStore {
  tab: EventsTab;
  search: string;
  active: Record<string, string[]>;
  mob: boolean;
  setTab: (v: EventsTab) => void;
  setSearch: (v: string) => void;
  toggleFilter: (k: string, v: string) => void;
  setMob: (v: boolean) => void;
  clearAll: () => void;
}

export const useOricEventsFilterStore = create<OricEventsFilterStore>((set) => ({
  tab: 'events',
  search: '',
  active: {},
  mob: false,
  setTab: (v) => set({ tab: v, search: '', active: {} }),
  setSearch: (v) => set({ search: v }),
  toggleFilter: (k, v) => set((s) => ({ active: toggle(s.active, k, v) })),
  setMob: (v) => set({ mob: v }),
  clearAll: () => set({ search: '', active: {} }),
}));

// ─── Patents / IP ─────────────────────────────────────────────────────────────

type PatentsTab = 'patents' | 'disclosures' | 'licensing';

interface OricPatentsFilterStore {
  tab: PatentsTab;
  search: string;
  active: Record<string, string[]>;
  mobileSidebar: boolean;
  setTab: (v: PatentsTab) => void;
  setSearch: (v: string) => void;
  toggleFilter: (k: string, v: string) => void;
  setMobileSidebar: (v: boolean) => void;
  clearAll: () => void;
}

export const useOricPatentsFilterStore = create<OricPatentsFilterStore>((set) => ({
  tab: 'patents',
  search: '',
  active: {},
  mobileSidebar: false,
  setTab: (v) => set({ tab: v, search: '', active: {} }),
  setSearch: (v) => set({ search: v }),
  toggleFilter: (k, v) => set((s) => ({ active: toggle(s.active, k, v) })),
  setMobileSidebar: (v) => set({ mobileSidebar: v }),
  clearAll: () => set({ search: '', active: {} }),
}));

// ─── Policy ───────────────────────────────────────────────────────────────────

interface OricPolicyFilterStore {
  search: string;
  active: Record<string, string[]>;
  mob: boolean;
  setSearch: (v: string) => void;
  toggleFilter: (k: string, v: string) => void;
  setMob: (v: boolean) => void;
  clearAll: () => void;
}

export const useOricPolicyFilterStore = create<OricPolicyFilterStore>((set) => ({
  search: '',
  active: {},
  mob: false,
  setSearch: (v) => set({ search: v }),
  toggleFilter: (k, v) => set((s) => ({ active: toggle(s.active, k, v) })),
  setMob: (v) => set({ mob: v }),
  clearAll: () => set({ search: '', active: {} }),
}));
