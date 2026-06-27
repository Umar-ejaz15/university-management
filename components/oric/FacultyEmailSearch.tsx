'use client';

import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

interface StaffResult {
  id: string;
  name: string;
  email: string;
}

interface Props {
  staffId: string;
  staffName: string;
  staffEmail: string;
  onSelect: (staff: StaffResult) => void;
  inputCls: string;
}

export default function FacultyEmailSearch({ staffId, staffName, staffEmail, onSelect, inputCls }: Props) {
  const [query, setQuery] = useState(staffEmail);
  const [results, setResults] = useState<StaffResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timer = useRef<NodeJS.Timeout | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(staffEmail);
  }, [staffEmail]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const search = (val: string) => {
    setQuery(val);
    if (timer.current) clearTimeout(timer.current);
    if (val.length < 2) { setResults([]); setOpen(false); return; }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/staff/search?q=${encodeURIComponent(val)}`);
        const data = await res.json();
        setResults(data.results ?? []);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const pick = (s: StaffResult) => {
    onSelect(s);
    setQuery(s.email);
    setOpen(false);
    setResults([]);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div ref={wrapRef} className="relative">
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Faculty Email *</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="email"
            required
            value={query}
            onChange={e => search(e.target.value)}
            placeholder="Search by email…"
            className={`${inputCls} pl-9`}
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-gray-300 border-t-[#1a3d2b] rounded-full animate-spin" />
          )}
        </div>
        {open && results.length > 0 && (
          <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
            {results.map(s => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => pick(s)}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-900">{s.email}</p>
                  <p className="text-xs text-gray-500">{s.name}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Faculty Name</label>
        <input
          readOnly
          value={staffName}
          placeholder="Auto-filled from email"
          className={`${inputCls} bg-gray-50 cursor-default text-gray-500`}
        />
      </div>
    </div>
  );
}
