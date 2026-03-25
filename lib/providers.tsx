'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUIStore } from '@/lib/store/uiStore';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

// ─── Toast Renderer ───────────────────────────────────────────────────────────

function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
    error:   <AlertCircle  className="w-4 h-4 text-red-500    shrink-0" />,
    info:    <Info         className="w-4 h-4 text-blue-500   shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-200',
    error:   'border-red-200',
    info:    'border-blue-200',
    warning: 'border-amber-200',
  };

  return (
    <div className="fixed bottom-5 right-5 z-9999 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-3 bg-white border ${borders[t.type]} rounded-xl shadow-lg px-4 py-3 min-w-64 max-w-sm text-sm text-gray-800 animate-in slide-in-from-bottom-2`}
        >
          {icons[t.type]}
          <span className="flex-1">{t.message}</span>
          <button
            onClick={() => removeToast(t.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Root Providers ───────────────────────────────────────────────────────────

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data stays "fresh" for 2 minutes — no refetch within this window
            staleTime: 2 * 60 * 1000,
            // Keep unused data in cache for 5 minutes
            gcTime: 5 * 60 * 1000,
            // Don't hammer server on every tab switch
            refetchOnWindowFocus: false,
            // One automatic retry on failure
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ToastContainer />
    </QueryClientProvider>
  );
}
