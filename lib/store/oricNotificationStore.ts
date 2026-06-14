import { create } from 'zustand';

export interface OricNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  metadata: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

interface OricNotificationStore {
  notifications: OricNotification[];
  unreadCount: number;
  panelOpen: boolean;
  setData: (data: { notifications: OricNotification[]; unreadCount: number }) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  togglePanel: () => void;
  closePanel: () => void;
}

export const useOricNotificationStore = create<OricNotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,
  panelOpen: false,

  setData: ({ notifications, unreadCount }) => set({ notifications, unreadCount }),

  markRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      unreadCount: Math.max(
        0,
        state.unreadCount - (state.notifications.find((n) => n.id === id && !n.isRead) ? 1 : 0),
      ),
    })),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),

  togglePanel: () => set((state) => ({ panelOpen: !state.panelOpen })),
  closePanel: () => set({ panelOpen: false }),
}));
