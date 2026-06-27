'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useOricAdminStore } from '@/lib/store/oricAdminStore';
import { Briefcase, CheckCircle2, ChevronDown, ChevronUp, Loader2, Pencil, Plus, Sparkles, Trash2, X, XCircle } from 'lucide-react';
import AutoGrowTextarea from '@/components/oric/AutoGrowTextarea';
import FacultyEmailSearch from '@/components/oric/FacultyEmailSearch';

interface Consultancy {
  id: string;
  title: string;
  clientName?: string | null;
  clientCountry?: string | null;
  clientAddress?: string | null;
  executionDate?: string | null;
  serviceType?: string | null;
  deliverables?: string | null;
  contractValue?: number | null;
  oricOverheadPercent?: number | null;
  oricOverheadAmount?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  status?: string | null;
  annexRef?: string | null;
  documentUrl?: string | null;
  remarks?: string | null;
  staffId?: string | null;
  staff: { name: string; designation?: string | null; department?: { name: string } | null };
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
const SERVICE_TYPES = ['Technical Advisory', 'Research Services', 'Training', 'Testing & Analysis', 'Design & Engineering', 'Management Consulting', 'Other'];
const STATUSES = ['Ongoing', 'Completed', 'Pending', 'Cancelled'];
const statusCls: Record<string, string> = {
  Ongoing:   'bg-emerald-100 text-emerald-700',
  Completed: 'bg-gray-100 text-gray-600',
  Pending:   'bg-amber-100 text-amber-700',
  Cancelled: 'bg-red-100 text-red-700',
};

function fmtPKR(v?: number | null) {
  if (!v) return '—';
  if (v >= 1_000_000) return `PKR ${(v / 1_000_000).toFixed(2)}M`;
  return `PKR ${Number(v).toLocaleString()}`;
}
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
  title: '', clientName: '', clientCountry: '', clientAddress: '', executionDate: '',
  serviceType: '', deliverables: '', contractValue: '', oricOverheadPercent: '',
  oricOverheadAmount: '', startDate: '', endDate: '', status: '', annexRef: '',
  documentUrl: '', remarks: '', staffId: '', staffName: '', staffEmail: '',
};

async function fetchConsultancies() {
  const res = await fetch('/api/oric/consultancies');
  if (!res.ok) throw new Error('Failed');
  return res.json() as Promise<{ consultancies: Consultancy[] }>;
}

export default function ConsultanciesPage() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ['oric', 'consultancies'], queryFn: fetchConsultancies });
  const list = data?.consultancies ?? [];
  const { expanded: expandedMap, toggle: toggleExpanded } = useOricAdminStore();
  const expanded = expandedMap['consultancies'] ?? null;

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
      if (res.ok) qc.invalidateQueries({ queryKey: ['oric', 'consultancies'] });
    } finally {
      setBusyId(null);
      setRejectTarget(null);
    }
  };

  const f = (k: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const openAdd = () => { setForm({ ...emptyForm }); setEditId(null); setFormError(''); setModal('add'); };
  const openEdit = (c: Consultancy) => {
    setForm({
      title: c.title, clientName: c.clientName ?? '', clientCountry: c.clientCountry ?? '',
      clientAddress: c.clientAddress ?? '', executionDate: toDateInput(c.executionDate),
      serviceType: c.serviceType ?? '', deliverables: c.deliverables ?? '',
      contractValue: c.contractValue ? String(c.contractValue) : '',
      oricOverheadPercent: c.oricOverheadPercent ? String(c.oricOverheadPercent) : '',
      oricOverheadAmount: c.oricOverheadAmount ? String(c.oricOverheadAmount) : '',
      startDate: toDateInput(c.startDate), endDate: toDateInput(c.endDate),
      status: c.status ?? '', annexRef: c.annexRef ?? '', documentUrl: '',
      remarks: c.remarks ?? '', staffId: c.staffId ?? '',
      staffName: c.staff.name, staffEmail: '',
    });
    setEditId(c.id);
    setFormError('');
    setModal('edit');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.staffId) { setFormError('Please select a faculty member by searching their email.'); return; }
    setFormError('');
    setSubmitting(true);
    try {
      const url = modal === 'edit' ? `/api/oric/consultancies/${editId}` : '/api/oric/consultancies';
      const method = modal === 'edit' ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setFormError(d.error ?? 'Failed to save. Please try again.'); return; }
      qc.invalidateQueries({ queryKey: ['oric', 'consultancies'] });
      setModal(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/oric/consultancies/${id}`, { method: 'DELETE' });
    qc.invalidateQueries({ queryKey: ['oric', 'consultancies'] });
    setDeleteId(null);
  };

  const totalValue = list.reduce((acc, c) => acc + (Number(c.contractValue) || 0), 0);
  const totalOverhead = list.reduce((acc, c) => acc + (Number(c.oricOverheadAmount) || 0), 0);

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-[#c9a961]" />
              <span className="text-xs font-semibold text-[#c9a961] uppercase tracking-wider">ORIC</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Consultancies Register</h1>
            <p className="text-sm text-gray-500 mt-0.5">Faculty consultancy agreements executed through ORIC</p>
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-[#1a3d2b] text-white rounded-xl text-sm font-medium hover:bg-[#142d20] transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Add Consultancy
          </button>
        </div>
      </div>

      {(modal === 'add' || modal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="text-base font-semibold text-gray-900">{modal === 'edit' ? 'Edit Consultancy' : 'Add Consultancy'}</h3>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><X className="w-4 h-4 text-gray-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <FacultyEmailSearch
                staffId={form.staffId} staffName={form.staffName} staffEmail={form.staffEmail}
                onSelect={s => setForm(p => ({ ...p, staffId: s.id, staffName: s.name, staffEmail: s.email }))}
                inputCls={inputCls}
              />
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Title *</label>
                <input required value={form.title} onChange={f('title')} className={inputCls} placeholder="Consultancy title" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Service Type</label>
                  <select value={form.serviceType} onChange={f('serviceType')} className={inputCls}>
                    <option value="">— Select —</option>
                    {SERVICE_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
                  <select value={form.status} onChange={f('status')} className={inputCls}>
                    <option value="">— Select —</option>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Client Name</label>
                <input value={form.clientName} onChange={f('clientName')} className={inputCls} placeholder="Organization / Company" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Client Country</label>
                  <input value={form.clientCountry} onChange={f('clientCountry')} className={inputCls} placeholder="e.g. Pakistan" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Execution Date</label>
                  <input type="date" value={form.executionDate} onChange={f('executionDate')} className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Client Address</label>
                <input value={form.clientAddress} onChange={f('clientAddress')} className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Start Date</label>
                  <input type="date" value={form.startDate} onChange={f('startDate')} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">End Date</label>
                  <input type="date" value={form.endDate} onChange={f('endDate')} className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Contract Value (PKR)</label>
                  <input type="number" min="0" value={form.contractValue} onChange={f('contractValue')} className={inputCls} placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">ORIC Overhead %</label>
                  <input type="number" min="0" max="100" step="0.01" value={form.oricOverheadPercent} onChange={f('oricOverheadPercent')} className={inputCls} placeholder="10" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">ORIC Overhead Amount</label>
                  <input type="number" min="0" value={form.oricOverheadAmount} onChange={f('oricOverheadAmount')} className={inputCls} placeholder="0" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Deliverables</label>
                <AutoGrowTextarea value={form.deliverables} onChange={f('deliverables')} className={inputCls} placeholder="Key deliverables…" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Remarks</label>
                <AutoGrowTextarea value={form.remarks} onChange={f('remarks')} className={inputCls} placeholder="Additional remarks…" />
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
                  {submitting ? 'Saving…' : modal === 'edit' ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Delete Consultancy?</h3>
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
          onConfirm={(reason) => verify('consultancy', rejectTarget.id, 'REJECTED', reason)}
          processing={busyId === rejectTarget.id}
        />
      )}

      <div className="px-6 py-6 space-y-6">
        {isLoading && <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-[#1a3d2b]/20 border-t-[#1a3d2b] rounded-full animate-spin" /></div>}
        {error && <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-700">Failed to load data.</div>}

        {data && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Consultancies', value: String(list.length), sub: '' },
                { label: 'Total Contract Value', value: fmtPKR(totalValue), sub: 'Gross' },
                { label: 'ORIC Overhead Collected', value: fmtPKR(totalOverhead), sub: '10%' },
              ].map(({ label, value, sub }) => (
                <div key={label} className="bg-sky-50 rounded-2xl border border-white shadow-sm p-4">
                  <p className="text-xl font-extrabold text-gray-900 leading-none">{value}</p>
                  <p className="text-xs font-semibold text-gray-600 mt-1">{label}</p>
                  {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-sky-600" />
                <h2 className="text-base font-semibold text-gray-900">Consultancy Contracts</h2>
                <span className="ml-auto px-2.5 py-0.5 bg-sky-100 text-sky-700 rounded-full text-xs font-semibold">{list.length}</span>
              </div>
              <div className="divide-y divide-gray-100">
                {list.length === 0 && <p className="px-6 py-8 text-center text-sm text-gray-400">No consultancies on record.</p>}
                {list.map((c, i) => (
                  <div key={c.id}>
                    <div className="flex items-start gap-2 px-6 py-4 hover:bg-gray-50/60 transition-colors">
                      <button onClick={() => toggleExpanded('consultancies', c.id)} className="flex-1 text-left flex items-start gap-4 min-w-0">
                        <span className="text-xs text-gray-400 mt-0.5 w-5 shrink-0">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900 text-sm">{c.title}</span>
                            {c.status && <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusCls[c.status] ?? 'bg-gray-100 text-gray-600'}`}>{c.status}</span>}
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                              c.verificationStatus === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              c.verificationStatus === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              'bg-red-50 text-red-700 border-red-200'
                            }`}>{c.verificationStatus}</span>
                          </div>
                          {c.rejectionReason && <p className="text-xs text-red-600 mt-0.5">{c.rejectionReason}</p>}
                          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                            <span>PI: <span className="text-gray-700 font-medium">{c.staff.name}</span></span>
                            {c.clientName && <span>Client: {c.clientName}</span>}
                            <span>Value: <span className="text-gray-700 font-medium">{fmtPKR(c.contractValue)}</span></span>
                            {c.startDate && <span>{fmtDate(c.startDate)} — {fmtDate(c.endDate)}</span>}
                          </div>
                        </div>
                        {expanded === c.id ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />}
                      </button>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        {c.verificationStatus === 'PENDING' && (
                          <>
                            <button onClick={() => verify('consultancy', c.id, 'VERIFIED')} disabled={busyId === c.id}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold disabled:opacity-50 transition-colors">
                              {busyId === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />} Approve
                            </button>
                            <button onClick={() => setRejectTarget({ id: c.id, title: c.title })} disabled={busyId === c.id}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold disabled:opacity-50 transition-colors">
                              <XCircle className="w-3 h-3" /> Reject
                            </button>
                          </>
                        )}
                        <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteId(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    {expanded === c.id && (
                      <div className="px-6 pb-6 bg-gray-50/60 border-t border-gray-100">
                        <div className="pt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                          <Field label="Title" value={c.title} />
                          <Field label="Service Type" value={c.serviceType} />
                          <Field label="Status" value={c.status} />
                          <Field label="Client Name" value={c.clientName} />
                          <Field label="Client Country" value={c.clientCountry} />
                          <Field label="Client Address" value={c.clientAddress} />
                          <Field label="Execution Date" value={fmtDate(c.executionDate)} />
                          <Field label="Start Date" value={fmtDate(c.startDate)} />
                          <Field label="End Date" value={fmtDate(c.endDate)} />
                          <Field label="Contract Value" value={fmtPKR(c.contractValue)} />
                          <Field label="ORIC Overhead %" value={c.oricOverheadPercent ? `${c.oricOverheadPercent}%` : null} />
                          <Field label="ORIC Overhead Amount" value={fmtPKR(c.oricOverheadAmount)} />
                          <Field label="PI Name" value={c.staff.name} />
                          <Field label="PI Designation" value={c.staff.designation} />
                          <Field label="Department" value={c.staff.department?.name} />
                          <Field label="Annex Reference" value={c.annexRef} />
                        </div>
                        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <Field label="Deliverables" value={c.deliverables} />
                          <Field label="Remarks" value={c.remarks} />
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
