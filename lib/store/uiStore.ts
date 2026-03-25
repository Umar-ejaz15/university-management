import { create } from 'zustand';

/**
 * Global UI store — for client-side state shared across components
 * that is NOT server data (use TanStack Query for that).
 *
 * Current slices:
 *  • Toast / notification system
 *
 * Extend this file as the app grows (e.g. sidebar open, theme, etc.)
 */

// ─── Toast system ─────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface UIStore {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  toasts: [],

  addToast: (message, type = 'info') => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

// ─── Convenience helpers ──────────────────────────────────────────────────────

/** Call anywhere: toast.success('Saved!') */
export const toast = {
  success: (msg: string) => useUIStore.getState().addToast(msg, 'success'),
  error:   (msg: string) => useUIStore.getState().addToast(msg, 'error'),
  info:    (msg: string) => useUIStore.getState().addToast(msg, 'info'),
  warning: (msg: string) => useUIStore.getState().addToast(msg, 'warning'),
};
