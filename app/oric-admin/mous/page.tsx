'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useOricAdminStore } from '@/lib/store/oricAdminStore';
import { CheckCircle2, ChevronDown, ChevronUp, Handshake, Loader2, Pencil, Plus, Sparkles, Trash2, X, XCircle } from 'lucide-react';
import AutoGrowTextarea from '@/components/oric/AutoGrowTextarea';
import FacultyEmailSearch from '@/components/oric/FacultyEmailSearch';

interface Mou {
  id: string;
  partyName: string;
  linkageType?: string | null;
  partyType?: string | null;
  establishmentDate?: string | null;
  scope: string;
  country?: string | null;
  duration?: string | null;
  status?: string | null;
  focalPersonMnsuam?: string | null;
  focalPersonOther?: string | null;
  scopeOfCollaboration?: string | null;
  activities?: string | null;
  futureInitiatives?: string | null;
  annexRef?: string | null;
  documentUrl?: string | null;
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
const selectCls = inputCls;

const LINKAGE_TYPES = ['MoU', 'MoA', 'LoI', 'Partnership Agreement', 'Framework Agreement', 'Other'];
const PARTY_TYPES = ['Academia', 'Industry', 'Government', 'NGO / CSO', 'International Org', 'Other'];
const SCOPES = ['NATIONAL', 'INTERNATIONAL'];
const STATUSES = ['Active', 'Expired', 'Under Renewal', 'Terminated'];

const statusCls: Record<string, string> = {
  Active:          'bg-emerald-100 text-emerald-700',
  Expired:         'bg-gray-100 text-gray-600',
  'Under Renewal': 'bg-amber-100 text-amber-700',
  Terminated:      'bg-red-100 text-red-700',
};
const partyTypeCls: Record<string, string> = {
  Academia:    'bg-blue-100 text-blue-700',
  Industry:    'bg-violet-100 text-violet-700',
  Government:  'bg-teal-100 text-teal-700',
  'NGO / CSO': 'bg-orange-100 text-orange-700',
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

const emptyForm = {
  partyName: '', linkageType: '', partyType: '', establishmentDate: '', scope: 'NATIONAL',
  country: '', duration: '', status: '', focalPersonMnsuam: '', focalPersonOther: '',
  scopeOfCollaboration: '', activities: '', futureInitiatives: '', annexRef: '', documentUrl: '',
  staffId: '', staffName: '', staffEmail: '',
};

async function fetchMous() {
  const res = await fetch('/api/oric/mous');
  if (!res.ok) throw new Error('Failed');
  return res.json() as Promise<{ mous: Mou[] }>;
}

export default function MousPage() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ['oric', 'mous'], queryFn: fetchMous });
  const list = data?.mous ?? [];
  const { expanded: expandedMap, toggle: toggleExpanded } = useOricAdminStore();
  const expanded = expandedMap['mous'] ?? null;

  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
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
      if (res.ok) qc.invalidateQueries({ queryKey: ['oric', 'mous'] });
    } finally {
      setBusyId(null);
      setRejectTarget(null);
    }
  };

  const f = (k: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const openAdd = () => { setForm({ ...emptyForm }); setEditId(null); setFormError(''); setModal('add'); };
  const openEdit = (m: Mou) => {
    setForm({
      partyName: m.partyName, linkageType: m.linkageType ?? '', partyType: m.partyType ?? '',
      establishmentDate: toDateInput(m.establishmentDate), scope: m.scope,
      country: m.country ?? '', duration: m.duration ?? '', status: m.status ?? '',
      focalPersonMnsuam: m.focalPersonMnsuam ?? '', focalPersonOther: m.focalPersonOther ?? '',
      scopeOfCollaboration: m.scopeOfCollaboration ?? '', activities: m.activities ?? '',
      futureInitiatives: m.futureInitiatives ?? '', annexRef: m.annexRef ?? '',
      documentUrl: m.documentUrl ?? '', staffId: m.staffId ?? '',
      staffName: m.staff.name, staffEmail: '',
    });
    setEditId(m.id);
    setFormError('');
    setModal('edit');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.staffId) { setFormError('Please select a faculty member by searching their email.'); return; }
    setFormError('');
    setSubmitting(true);
    try {
      const url = modal === 'edit' ? `/api/oric/mous/${editId}` : '/api/oric/mous';
      const method = modal === 'edit' ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setFormError(d.error ?? 'Failed to save. Please try again.'); return; }
      qc.invalidateQueries({ queryKey: ['oric', 'mous'] });
      setModal(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/oric/mous/${id}`, { method: 'DELETE' });
    if (!res.ok) return;
    qc.invalidateQueries({ queryKey: ['oric', 'mous'] });
    setDeleteId(null);
  };

  const active = list.filter(m => m.status === 'Active').length;
  const intl = list.filter(m => m.scope === 'INTERNATIONAL').length;

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-[#c9a961]" />
              <span className="text-xs font-semibold text-[#c9a961] uppercase tracking-wider">ORIC</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">MoU &amp; Linkages Register</h1>
            <p className="text-sm text-gray-500 mt-0.5">Academic and industry collaboration agreements</p>
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-[#1a3d2b] text-white rounded-xl text-sm font-medium hover:bg-[#142d20] transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Add MoU
          </button>
        </div>
      </div>

      {(modal === 'add' || modal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="text-base font-semibold text-gray-900">{modal === 'edit' ? 'Edit MoU' : 'Add MoU'}</h3>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><X className="w-4 h-4 text-gray-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <FacultyEmailSearch
                staffId={form.staffId} staffName={form.staffName} staffEmail={form.staffEmail}
                onSelect={s => setForm(p => ({ ...p, staffId: s.id, staffName: s.name, staffEmail: s.email }))}
                inputCls={inputCls}
              />
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Party Name *</label>
                <input required value={form.partyName} onChange={f('partyName')} className={inputCls} placeholder="Organization name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Linkage Type</label>
                  <select value={form.linkageType} onChange={f('linkageType')} className={selectCls}>
                    <option value="">— Select —</option>
                    {LINKAGE_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Party Type</label>
                  <select value={form.partyType} onChange={f('partyType')} className={selectCls}>
                    <option value="">— Select —</option>
                    {PARTY_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Scope</label>
                  <select value={form.scope} onChange={f('scope')} className={selectCls}>
                    {SCOPES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
                  <select value={form.status} onChange={f('status')} className={selectCls}>
                    <option value="">— Select —</option>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Country</label>
                  <input value={form.country} onChange={f('country')} className={inputCls} placeholder="e.g. Pakistan" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Establishment Date</label>
                  <input type="date" value={form.establishmentDate} onChange={f('establishmentDate')} className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Duration</label>
                <input value={form.duration} onChange={f('duration')} className={inputCls} placeholder="e.g. 3 Years" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Focal Person (MNSUAM)</label>
                  <input value={form.focalPersonMnsuam} onChange={f('focalPersonMnsuam')} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Focal Person (Partner)</label>
                  <input value={form.focalPersonOther} onChange={f('focalPersonOther')} className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Scope of Collaboration</label>
                <AutoGrowTextarea value={form.scopeOfCollaboration} onChange={f('scopeOfCollaboration')} className={inputCls} placeholder="Describe scope…" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Activities</label>
                <AutoGrowTextarea value={form.activities} onChange={f('activities')} className={inputCls} placeholder="Activities undertaken…" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Future Initiatives</label>
                <AutoGrowTextarea value={form.futureInitiatives} onChange={f('futureInitiatives')} className={inputCls} placeholder="Planned future activities…" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Annex Reference</label>
                  <input value={form.annexRef} onChange={f('annexRef')} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Document URL</label>
                  <input type="url" value={form.documentUrl} onChange={f('documentUrl')} className={inputCls} placeholder="https://…" />
                </div>
              </div>
              {formError && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{formError}</p>}
              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setModal(null)} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 rounded-xl bg-[#1a3d2b] text-white text-sm font-medium hover:bg-[#142d20] transition-colors disabled:opacity-50">
                  {submitting ? 'Saving…' : modal === 'edit' ? 'Update MoU' : 'Save MoU'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Delete MoU?</h3>
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
          onConfirm={(reason) => verify('mou', rejectTarget.id, 'REJECTED', reason)}
          processing={busyId === rejectTarget.id}
        />
      )}

      <div className="px-6 py-6 space-y-6">
        {isLoading && <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-[#1a3d2b]/20 border-t-[#1a3d2b] rounded-full animate-spin" /></div>}
        {error && <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-700">Failed to load data.</div>}

        {data && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[{ label: 'Total MoUs', value: list.length }, { label: 'Active', value: active }, { label: 'International', value: intl }].map(({ label, value }) => (
                <div key={label} className="bg-violet-50 rounded-2xl border border-white shadow-sm p-4">
                  <p className="text-2xl font-extrabold text-gray-900 leading-none">{value}</p>
                  <p className="text-xs font-semibold text-gray-600 mt-1">{label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <Handshake className="w-5 h-5 text-violet-600" />
                <h2 className="text-base font-semibold text-gray-900">All MoUs &amp; Linkages</h2>
                <span className="ml-auto px-2.5 py-0.5 bg-violet-100 text-violet-700 rounded-full text-xs font-semibold">{list.length}</span>
              </div>
              <div className="divide-y divide-gray-100">
                {list.length === 0 && <p className="px-6 py-8 text-center text-sm text-gray-400">No MoUs on record.</p>}
                {list.map((m, i) => (
                  <div key={m.id}>
                    <div className="flex items-start gap-2 px-6 py-4 hover:bg-gray-50/60 transition-colors">
                      <button onClick={() => toggleExpanded('mous', m.id)} className="flex-1 text-left flex items-start gap-4 min-w-0">
                        <span className="text-xs text-gray-400 mt-0.5 w-5 shrink-0">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900 text-sm">{m.partyName}</span>
                            {m.status && <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusCls[m.status] ?? 'bg-gray-100 text-gray-600'}`}>{m.status}</span>}
                            {m.partyType && <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${partyTypeCls[m.partyType] ?? 'bg-gray-100 text-gray-600'}`}>{m.partyType}</span>}
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                              m.verificationStatus === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              m.verificationStatus === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              'bg-red-50 text-red-700 border-red-200'
                            }`}>{m.verificationStatus}</span>
                          </div>
                          {m.rejectionReason && <p className="text-xs text-red-600 mt-0.5">{m.rejectionReason}</p>}
                          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                            {m.country && <span>{m.country}</span>}
                            <span>Scope: {m.scope}</span>
                            {m.establishmentDate && <span>Established: {fmtDate(m.establishmentDate)}</span>}
                            {m.duration && <span>Duration: {m.duration}</span>}
                            <span>PI: <span className="text-gray-700 font-medium">{m.staff.name}</span></span>
                          </div>
                        </div>
                        {expanded === m.id ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />}
                      </button>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        {m.verificationStatus === 'PENDING' && (
                          <>
                            <button onClick={() => verify('mou', m.id, 'VERIFIED')} disabled={busyId === m.id}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold disabled:opacity-50 transition-colors">
                              {busyId === m.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />} Approve
                            </button>
                            <button onClick={() => setRejectTarget({ id: m.id, title: m.partyName })} disabled={busyId === m.id}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold disabled:opacity-50 transition-colors">
                              <XCircle className="w-3 h-3" /> Reject
                            </button>
                          </>
                        )}
                        <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteId(m.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    {expanded === m.id && (
                      <div className="px-6 pb-6 bg-gray-50/60 border-t border-gray-100">
                        <div className="pt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                          <Field label="Party Name" value={m.partyName} />
                          <Field label="Party Type" value={m.partyType} />
                          <Field label="Linkage Type" value={m.linkageType} />
                          <Field label="Country" value={m.country} />
                          <Field label="Scope" value={m.scope} />
                          <Field label="Status" value={m.status} />
                          <Field label="Establishment Date" value={fmtDate(m.establishmentDate)} />
                          <Field label="Duration" value={m.duration} />
                          <Field label="Annex Reference" value={m.annexRef} />
                          <Field label="Focal Person (MNSUAM)" value={m.focalPersonMnsuam} />
                          <Field label="Focal Person (Partner)" value={m.focalPersonOther} />
                          <Field label="PI / Staff" value={m.staff.name} />
                          {m.staff.department?.name && <Field label="Department" value={m.staff.department.name} />}
                        </div>
                        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-5">
                          <Field label="Scope of Collaboration" value={m.scopeOfCollaboration} />
                          <Field label="Activities" value={m.activities} />
                          <Field label="Future Initiatives" value={m.futureInitiatives} />
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
