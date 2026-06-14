'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, ChevronDown, ChevronUp, Plus, Sparkles, X } from 'lucide-react';

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
  subjectArea?: string | null;
  outcome?: string | null;
  collaborationDeveloped?: string | null;
  sponsoringAgency?: string | null;
  grantValue?: number | null;
  financialSupport?: string | null;
  webLinks?: string | null;
  annexRef?: string | null;
  staff?: { name: string; department?: { name: string } | null } | null;
}

async function fetchEvents() {
  const res = await fetch('/api/oric/events');
  if (!res.ok) throw new Error('Failed');
  return res.json() as Promise<{ events: OricEvent[] }>;
}

function fmtDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const EVENT_CATEGORIES = ['Innovation Fair', 'Seminar', 'Workshop', 'Conference', 'IP Showcasing', 'Linkage Meeting', 'Other'];

const catCls: Record<string, string> = {
  'Innovation Fair': 'bg-amber-100 text-amber-700',
  Seminar:           'bg-blue-100 text-blue-700',
  Workshop:          'bg-violet-100 text-violet-700',
  Conference:        'bg-teal-100 text-teal-700',
  'IP Showcasing':   'bg-emerald-100 text-emerald-700',
  'Linkage Meeting': 'bg-sky-100 text-sky-700',
};

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{value || <span className="italic text-gray-400">Not filled</span>}</p>
    </div>
  );
}

export default function OricEventsPage() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ['oric', 'events'], queryFn: fetchEvents });
  const list = data?.events ?? [];
  const [expanded, setExpanded] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'Conference', eventDate: '', venue: '', leadOrganizer: '', participants: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/oric/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed');
      qc.invalidateQueries({ queryKey: ['oric', 'events'] });
      setShowForm(false);
      setForm({ title: '', category: 'Conference', eventDate: '', venue: '', leadOrganizer: '', participants: '' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-[#c9a961]" />
              <span className="text-xs font-semibold text-[#c9a961] uppercase tracking-wider">ORIC</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Events &amp; Outreach Register</h1>
            <p className="text-sm text-gray-500 mt-0.5">Innovation fairs, workshops, conferences and seminars</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1a3d2b] text-white rounded-xl text-sm font-medium hover:bg-[#142d20] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">Add Event</h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Title *</label>
                <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]/20 focus:border-[#1a3d2b]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]/20 focus:border-[#1a3d2b]">
                    {EVENT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Date *</label>
                  <input required type="date" value={form.eventDate} onChange={e => setForm(f => ({ ...f, eventDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]/20 focus:border-[#1a3d2b]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Venue</label>
                <input value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]/20 focus:border-[#1a3d2b]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Lead Organizer</label>
                  <input value={form.leadOrganizer} onChange={e => setForm(f => ({ ...f, leadOrganizer: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]/20 focus:border-[#1a3d2b]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Participants</label>
                  <input type="number" min="0" value={form.participants} onChange={e => setForm(f => ({ ...f, participants: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]/20 focus:border-[#1a3d2b]" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-[#1a3d2b] text-white text-sm font-medium hover:bg-[#142d20] transition-colors disabled:opacity-50">
                  {submitting ? 'Saving...' : 'Save Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="px-6 py-6 space-y-6">
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-[#1a3d2b]/20 border-t-[#1a3d2b] rounded-full animate-spin" />
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-700">Failed to load data.</div>
        )}

        {data && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <CalendarDays className="w-5 h-5 text-rose-600" />
              <h2 className="text-base font-semibold text-gray-900">All Events</h2>
              <span className="ml-auto px-2.5 py-0.5 bg-rose-100 text-rose-700 rounded-full text-xs font-semibold">{list.length}</span>
            </div>

            <div className="divide-y divide-gray-100">
              {list.length === 0 && (
                <p className="px-6 py-8 text-center text-sm text-gray-400">No events on record.</p>
              )}
              {list.map((ev, i) => (
                <div key={ev.id}>
                  <button
                    onClick={() => setExpanded(expanded === ev.id ? null : ev.id)}
                    className="w-full text-left px-6 py-4 hover:bg-gray-50/60 transition-colors flex items-start gap-4"
                  >
                    <span className="text-xs text-gray-400 mt-0.5 w-5 shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 text-sm">{ev.title}</span>
                        {ev.category && <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${catCls[ev.category] ?? 'bg-gray-100 text-gray-600'}`}>{ev.category}</span>}
                        {ev.arrangedOrParticipated && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">{ev.arrangedOrParticipated}</span>}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                        {ev.eventDate && <span>{fmtDate(ev.eventDate)}</span>}
                        {ev.venue && <span>{ev.venue}</span>}
                        {ev.participants != null && <span>{ev.participants} participants</span>}
                        <span>Scope: {ev.scope}</span>
                        {ev.leadOrganizer && <span>Organizer: {ev.leadOrganizer}</span>}
                      </div>
                    </div>
                    {expanded === ev.id
                      ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                      : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />}
                  </button>

                  {expanded === ev.id && (
                    <div className="px-6 pb-6 bg-gray-50/60 border-t border-gray-100">
                      <div className="pt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        <Field label="Title" value={ev.title} />
                        <Field label="Category" value={ev.category} />
                        <Field label="Arranged / Participated" value={ev.arrangedOrParticipated} />
                        <Field label="Event Date" value={fmtDate(ev.eventDate)} />
                        <Field label="Venue" value={ev.venue} />
                        <Field label="Scope" value={ev.scope} />
                        <Field label="Participants" value={ev.participants != null ? String(ev.participants) : null} />
                        <Field label="Lead Organizer" value={ev.leadOrganizer} />
                        <Field label="Subject Area" value={ev.subjectArea} />
                        <Field label="Sponsoring Agency" value={ev.sponsoringAgency} />
                        <Field label="Grant Value" value={ev.grantValue ? `PKR ${Number(ev.grantValue).toLocaleString()}` : null} />
                        <Field label="Financial Support" value={ev.financialSupport} />
                        {ev.staff?.name && <Field label="Submitted By (Staff)" value={ev.staff.name} />}
                        {ev.staff?.department?.name && <Field label="Department" value={ev.staff.department.name} />}
                        {ev.webLinks && <Field label="Web Links" value={ev.webLinks} />}
                        {ev.annexRef && <Field label="Annex Reference" value={ev.annexRef} />}
                      </div>
                      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <Field label="Outcomes" value={ev.outcome} />
                        <Field label="Collaboration Developed" value={ev.collaborationDeveloped} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
