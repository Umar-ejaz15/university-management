'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Plus, Sparkles, X } from 'lucide-react';

interface OricEvent {
  id: string;
  title: string;
  category?: string | null;
  eventDate?: string | null;
  venue?: string | null;
  leadOrganizer?: string | null;
  arrangedOrParticipated?: string | null;
  participants?: number | null;
  scope: string;
  staff?: { name: string } | null;
}

async function fetchEvents() {
  const res = await fetch('/api/oric/events');
  if (!res.ok) throw new Error('Failed');
  return res.json() as Promise<{ events: OricEvent[] }>;
}

const EVENT_CATEGORIES = ['Innovation Fair', 'Seminar', 'Workshop', 'Conference', 'IP Showcasing', 'Linkage Meeting', 'Other'];

const catCls: Record<string, string> = {
  'Innovation Fair': 'bg-amber-100 text-amber-700',
  'Seminar':         'bg-blue-100 text-blue-700',
  'Workshop':        'bg-violet-100 text-violet-700',
  'Conference':      'bg-teal-100 text-teal-700',
  'IP Showcasing':   'bg-emerald-100 text-emerald-700',
  'Linkage Meeting': 'bg-sky-100 text-sky-700',
};

export default function AdminEventsPage() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ['admin', 'events'], queryFn: fetchEvents });
  const list = data?.events ?? [];

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({
    title: '',
    category: 'Conference',
    eventDate: '',
    venue: '',
    leadOrganizer: '',
    participants: '',
    arrangedOrParticipated: 'Arranged',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/oric/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to create event');
      }
      qc.invalidateQueries({ queryKey: ['admin', 'events'] });
      setShowForm(false);
      setForm({ title: '', category: 'Conference', eventDate: '', venue: '', leadOrganizer: '', participants: '', arrangedOrParticipated: 'Arranged' });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-[#c9a961]" />
              <span className="text-xs font-semibold text-[#c9a961] uppercase tracking-wider">Administration</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Events</h1>
            <p className="text-sm text-gray-500 mt-0.5">University events — conferences, workshops, fairs, and outreach activities</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-[#2d6a4f] text-white rounded-xl text-sm font-medium hover:bg-[#245a42] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Event
          </button>
        </div>
      </div>

      {/* Create modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">Create Event</h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {formError && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{formError}</div>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Event Title *</label>
                <input
                  required
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. MNSUAM Annual Research Expo 2025"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f]"
                  >
                    {EVENT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Date *</label>
                  <input
                    required
                    type="date"
                    value={form.eventDate}
                    onChange={e => setForm(f => ({ ...f, eventDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Venue</label>
                <input
                  value={form.venue}
                  onChange={e => setForm(f => ({ ...f, venue: e.target.value }))}
                  placeholder="e.g. Main Auditorium, MNSUAM"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Lead Organizer</label>
                  <input
                    value={form.leadOrganizer}
                    onChange={e => setForm(f => ({ ...f, leadOrganizer: e.target.value }))}
                    placeholder="Name or department"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Participants</label>
                  <input
                    type="number"
                    min="0"
                    value={form.participants}
                    onChange={e => setForm(f => ({ ...f, participants: e.target.value }))}
                    placeholder="Expected count"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Type</label>
                <div className="flex gap-3">
                  {['Arranged', 'Participated'].map(opt => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="arrangedOrParticipated"
                        value={opt}
                        checked={form.arrangedOrParticipated === opt}
                        onChange={() => setForm(f => ({ ...f, arrangedOrParticipated: opt }))}
                        className="accent-[#2d6a4f]"
                      />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-[#2d6a4f] text-white text-sm font-medium hover:bg-[#245a42] transition-colors disabled:opacity-50">
                  {submitting ? 'Creating…' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="px-6 py-6">
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-[#2d6a4f]/20 border-t-[#2d6a4f] rounded-full animate-spin" />
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-700">Failed to load events.</div>
        )}

        {data && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <CalendarDays className="w-5 h-5 text-rose-500" />
              <h2 className="text-base font-semibold text-gray-900">All Events</h2>
              <span className="ml-auto px-2.5 py-0.5 bg-rose-100 text-rose-700 rounded-full text-xs font-semibold">{list.length}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['#', 'Title', 'Category', 'Date', 'Venue', 'Organizer', 'Type', 'Participants'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {list.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">
                        No events yet. Click &ldquo;Create Event&rdquo; to add one.
                      </td>
                    </tr>
                  )}
                  {list.map((ev, i) => (
                    <tr key={ev.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 max-w-xs">
                        <div className="truncate">{ev.title}</div>
                      </td>
                      <td className="px-4 py-3">
                        {ev.category ? (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${catCls[ev.category] ?? 'bg-gray-100 text-gray-600'}`}>{ev.category}</span>
                        ) : <span className="text-gray-400 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {ev.eventDate ? new Date(ev.eventDate).toLocaleDateString('en-GB') : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{ev.venue ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                        {ev.leadOrganizer ?? (ev.staff ? ev.staff.name : '—')}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{ev.arrangedOrParticipated ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{ev.participants ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
