'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useOricAdminStore } from '@/lib/store/oricAdminStore';
import { CheckCircle2, ChevronDown, ChevronUp, FlaskConical, Loader2, Pencil, Plus, Sparkles, Trash2, X, XCircle } from 'lucide-react';
import AutoGrowTextarea from '@/components/oric/AutoGrowTextarea';
import FacultyEmailSearch from '@/components/oric/FacultyEmailSearch';

interface Visit {
  id: string;
  visitorName: string;
  visitorOrg?: string | null;
  visitDate?: string | null;
  agenda?: string | null;
  departmentVisited?: string | null;
  visitType?: string | null;
  outcome?: string | null;
  proofUrl?: string | null;
  staffId?: string | null;
  staff: { name: string; department?: { name: string } | null };
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejectionReason?: string | null;
}

function RejectModal({ title, onClose, onConfirm, processing }: {
  title: string; onClose: () => void; onConfirm: (r: string) => void; processing: boolean;
}) {
  const [reason, setReason] = useState('');
  const valid = reason.trim().length >= 10;
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-linear-to-r from-red-600 to-red-500 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Reject Record</h3>
            <p className="text-xs text-white/70 mt-0.5 line-clamp-1">{title}</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Reason <span className="text-red-500">*</span>{' '}
              <span className="text-gray-400 font-normal">(min 10 chars)</span>
            </label>
            <textarea
              rows={4} value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="Explain what needs to be corrected…"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none resize-none"
            />
            <p className={`text-xs mt-1 ${valid ? 'text-emerald-600' : 'text-gray-400'}`}>
              {reason.trim().length} chars {valid && '✓'}
            </p>
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50">Cancel</button>
          <button onClick={() => onConfirm(reason.trim())} disabled={!valid || processing}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors">
            <XCircle className="w-4 h-4" />{processing ? 'Rejecting…' : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f] transition-all placeholder:text-gray-400';
const VISIT_TYPES = ['Industry', 'Government', 'Community', 'International', 'Other'];

const typeCls: Record<string, string> = {
  Industry:   'bg-violet-100 text-violet-700',
  Community:  'bg-teal-100 text-teal-700',
  Government: 'bg-blue-100 text-blue-700',
};

function fmtDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
function toDateInput(d?: string | null) {
  if (!d) return '';
  return new Date(d).toISOString().split('T')[0];
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{value || <span className="italic text-gray-400">Not filled</span>}</p>
    </div>
  );
}

async function fetchVisits() {
  const res = await fetch('/api/oric/visits');
  if (!res.ok) throw new Error('Failed');
  return res.json() as Promise<{ visits: Visit[] }>;
}

const emptyForm = {
  visitorName: '', visitorOrg: '', visitDate: '', agenda: '',
  departmentVisited: '', visitType: '', outcome: '', proofUrl: '',
  staffId: '', staffName: '', staffEmail: '',
};

export default function VisitsPage() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ['oric', 'visits'], queryFn: fetchVisits });
  const list = data?.visits ?? [];
  const { expanded: expandedMap, toggle: toggleExpanded } = useOricAdminStore();
  const expanded = expandedMap['visits'] ?? null;

  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<{ id: string; title: string } | null>(null);

  const verify = async (type: string, id: string, action: 'VERIFIED' | 'REJECTED', reason?: string) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/verifications/${type}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      });
      if (res.ok) qc.invalidateQueries({ queryKey: ['oric', 'visits'] });
    } finally {
      setBusyId(null);
      setRejectTarget(null);
    }
  };

  const f = (k: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const openAdd = () => { setForm({ ...emptyForm }); setEditId(null); setFormError(''); setModal('add'); };
  const openEdit = (v: Visit) => {
    setForm({
      visitorName: v.visitorName, visitorOrg: v.visitorOrg ?? '', visitDate: toDateInput(v.visitDate),
      agenda: v.agenda ?? '', departmentVisited: v.departmentVisited ?? '',
      visitType: v.visitType ?? '', outcome: v.outcome ?? '', proofUrl: v.proofUrl ?? '',
      staffId: v.staffId ?? '', staffName: v.staff.name, staffEmail: '',
    });
    setEditId(v.id);
    setFormError('');
    setModal('edit');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.staffId) { setFormError('Please select a faculty member by searching their email.'); return; }
    setFormError('');
    setSubmitting(true);
    try {
      const url = modal === 'edit' ? `/api/oric/visits/${editId}` : '/api/oric/visits';
      const method = modal === 'edit' ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setFormError(d.error ?? 'Failed to save. Please try again.'); return; }
      qc.invalidateQueries({ queryKey: ['oric', 'visits'] });
      setModal(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/oric/visits/${id}`, { method: 'DELETE' });
    qc.invalidateQueries({ queryKey: ['oric', 'visits'] });
    setDeleteId(null);
  };

  const byType = list.reduce<Record<string, number>>((acc, v) => {
    const t = v.visitType ?? 'Other';
    acc[t] = (acc[t] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-[#c9a961]" />
              <span className="text-xs font-semibold text-[#c9a961] uppercase tracking-wider">ORIC</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Industrial Visits Register</h1>
            <p className="text-sm text-gray-500 mt-0.5">Industry delegations, government outreach, and community engagement visits</p>
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-[#1a3d2b] text-white rounded-xl text-sm font-medium hover:bg-[#142d20] transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Add Visit
          </button>
        </div>
      </div>

      {(modal === 'add' || modal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="text-base font-semibold text-gray-900">{modal === 'edit' ? 'Edit Industrial Visit' : 'Add Industrial Visit'}</h3>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><X className="w-4 h-4 text-gray-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <FacultyEmailSearch
                staffId={form.staffId} staffName={form.staffName} staffEmail={form.staffEmail}
                onSelect={s => setForm(p => ({ ...p, staffId: s.id, staffName: s.name, staffEmail: s.email }))}
                inputCls={inputCls}
              />
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Visitor / Delegation Name *</label>
                <input required value={form.visitorName} onChange={f('visitorName')} className={inputCls} placeholder="Name of visitor or delegation" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Visitor Organization</label>
                  <input value={form.visitorOrg} onChange={f('visitorOrg')} className={inputCls} placeholder="Company / institution" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Visit Type</label>
                  <select value={form.visitType} onChange={f('visitType')} className={inputCls}>
                    <option value="">— Select —</option>
                    {VISIT_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Visit Date</label>
                  <input type="date" value={form.visitDate} onChange={f('visitDate')} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Department Visited</label>
                  <input value={form.departmentVisited} onChange={f('departmentVisited')} className={inputCls} placeholder="Department / Lab / Unit" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Agenda</label>
                <AutoGrowTextarea value={form.agenda} onChange={f('agenda')} className={inputCls} placeholder="Purpose and agenda of the visit…" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Outcomes</label>
                <AutoGrowTextarea value={form.outcome} onChange={f('outcome')} className={inputCls} placeholder="Key outcomes and follow-ups…" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Proof / Document URL</label>
                <input type="url" value={form.proofUrl} onChange={f('proofUrl')} className={inputCls} placeholder="https://…" />
              </div>
              {formError && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{formError}</p>}
              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setModal(null)} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 rounded-xl bg-[#1a3d2b] text-white text-sm font-medium hover:bg-[#142d20] transition-colors disabled:opacity-50">
                  {submitting ? 'Saving…' : modal === 'edit' ? 'Update Visit' : 'Save Visit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Delete Visit Record?</h3>
            <p className="text-sm text-gray-500 mb-5">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {rejectTarget && (
        <RejectModal
          title={rejectTarget.title}
          onClose={() => setRejectTarget(null)}
          onConfirm={(reason) => verify('visit', rejectTarget.id, 'REJECTED', reason)}
          processing={busyId === rejectTarget.id}
        />
      )}

      <div className="px-6 py-6 space-y-6">
        {isLoading && <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-[#1a3d2b]/20 border-t-[#1a3d2b] rounded-full animate-spin" /></div>}
        {error && <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-700">Failed to load data.</div>}

        {data && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Visits', value: list.length },
                { label: 'Industry', value: byType['Industry'] ?? 0 },
                { label: 'Government', value: byType['Government'] ?? 0 },
                { label: 'Community', value: byType['Community'] ?? 0 },
              ].map(({ label, value }) => (
                <div key={label} className="bg-indigo-50 rounded-2xl border border-white shadow-sm p-4">
                  <p className="text-2xl font-extrabold text-gray-900 leading-none">{value}</p>
                  <p className="text-xs font-semibold text-gray-600 mt-1">{label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <FlaskConical className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-semibold text-gray-900">All Industrial Visits</h2>
                <span className="ml-auto px-2.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">{list.length}</span>
              </div>
              <div className="divide-y divide-gray-100">
                {list.length === 0 && <p className="px-6 py-8 text-center text-sm text-gray-400">No visits on record.</p>}
                {list.map((v, i) => (
                  <div key={v.id}>
                    <div className="flex items-start gap-2 px-6 py-4 hover:bg-gray-50/60 transition-colors">
                      <button onClick={() => toggleExpanded('visits', v.id)} className="flex-1 text-left flex items-start gap-4 min-w-0">
                        <span className="text-xs text-gray-400 mt-0.5 w-5 shrink-0">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900 text-sm">{v.visitorName}</span>
                            {v.visitType && <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${typeCls[v.visitType] ?? 'bg-gray-100 text-gray-600'}`}>{v.visitType}</span>}
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                              v.verificationStatus === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              v.verificationStatus === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              'bg-red-50 text-red-700 border-red-200'
                            }`}>{v.verificationStatus}</span>
                          </div>
                          {v.rejectionReason && <p className="text-xs text-red-600 mt-0.5">{v.rejectionReason}</p>}
                          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                            {v.visitorOrg && <span>{v.visitorOrg}</span>}
                            {v.visitDate && <span>{fmtDate(v.visitDate)}</span>}
                            {v.departmentVisited && <span>Dept: {v.departmentVisited}</span>}
                            <span>Logged by: <span className="text-gray-700 font-medium">{v.staff.name}</span></span>
                          </div>
                        </div>
                        {expanded === v.id ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />}
                      </button>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        {v.verificationStatus === 'PENDING' && (
                          <>
                            <button onClick={() => verify('visit', v.id, 'VERIFIED')} disabled={busyId === v.id}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold disabled:opacity-50 transition-colors">
                              {busyId === v.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />} Approve
                            </button>
                            <button onClick={() => setRejectTarget({ id: v.id, title: v.visitorName })} disabled={busyId === v.id}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold disabled:opacity-50 transition-colors">
                              <XCircle className="w-3 h-3" /> Reject
                            </button>
                          </>
                        )}
                        <button onClick={() => openEdit(v)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteId(v.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    {expanded === v.id && (
                      <div className="px-6 pb-6 bg-gray-50/60 border-t border-gray-100">
                        <div className="pt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                          <Field label="Visitor / Delegation Name" value={v.visitorName} />
                          <Field label="Visitor Organization" value={v.visitorOrg} />
                          <Field label="Visit Type" value={v.visitType} />
                          <Field label="Visit Date" value={fmtDate(v.visitDate)} />
                          <Field label="Department Visited" value={v.departmentVisited} />
                          <Field label="Logged By (PI/Staff)" value={v.staff.name} />
                          {v.staff.department?.name && <Field label="Staff Department" value={v.staff.department.name} />}
                          {v.proofUrl && <Field label="Proof / Document URL" value={v.proofUrl} />}
                        </div>
                        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <Field label="Agenda" value={v.agenda} />
                          <Field label="Outcomes" value={v.outcome} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
