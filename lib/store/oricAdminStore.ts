import { create } from 'zustand';

/**
 * Shared expanded-row state for all ORIC admin list pages.
 * Each page uses a scoped key (e.g. 'mous', 'events') so toggling one
 * section does not collapse rows in another section open in a different tab.
 */

interface OricAdminStore {
  expanded: Record<string, string | null>;
  setExpanded: (section: string, id: string | null) => void;
  toggle: (section: string, id: string) => void;
}

export const useOricAdminStore = create<OricAdminStore>((set) => ({
  expanded: {},

  setExpanded: (section, id) =>
    set((s) => ({ expanded: { ...s.expanded, [section]: id } })),

  toggle: (section, id) =>
    set((s) => ({
      expanded: {
        ...s.expanded,
        [section]: s.expanded[section] === id ? null : id,
      },
    })),
}));
