'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useOricAdminStore } from '@/lib/store/oricAdminStore';
import { Award, CheckCircle2, ChevronDown, ChevronUp, FileSearch, Loader2, Pencil, Plus, Shield, Sparkles, Trash2, X, XCircle } from 'lucide-react';
import AutoGrowTextarea from '@/components/oric/AutoGrowTextarea';
import FacultyEmailSearch from '@/components/oric/FacultyEmailSearch';

// --- Types ---
interface StaffInfo { name: string; designation?: string | null; department?: { name: string } | null; }
interface Patent {
  id: string; title: string; leadInventor?: string | null; designation?: string | null;
  department?: string | null; coInventors?: string | null; ipCategory?: string | null;
  developmentStatus?: string | null; keyAspects?: string | null; commercialPartner?: string | null;
  financialSupport?: string | null; filedWith?: string | null; scope: string; filingDate?: string | null;
  applicationNumber?: string | null; patentStatus?: string | null; filingProofUrl?: string | null;
  annexRef?: string | null; ipoLastActionDate?: string | null; ipoStatus?: string | null;
  ipoExaminer?: string | null; ipoComments?: string | null; staffId?: string | null; staff: StaffInfo;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejectionReason?: string | null;
}
interface IPDisclosure {
  id: string; title: string; leadInventor?: string | null; designation?: string | null;
  department?: string | null; ipCategory?: string | null; developmentStatus?: string | null;
  scope: string; keyAspects?: string | null; commercialPartner?: string | null;
  financialSupport?: string | null; disclosureMadeWith?: string | null; previousDisclosure?: string | null;
  annexRef?: string | null; documentUrl?: string | null; createdAt: string; staffId?: string | null; staff: StaffInfo;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejectionReason?: string | null;
}
interface IPLicensing {
  id: string; title: string; leadInventor?: string | null; designationDept?: string | null;
  ipCategory?: string | null; developmentStatus?: string | null; scope: string; keyAspects?: string | null;
  fieldOfUse?: string | null; agreementDuration?: string | null; negotiationStatus?: string | null;
  licenseeName?: string | null; annexRef?: string | null; documentUrl?: string | null;
  createdAt: string; staffId?: string | null; staff: StaffInfo;
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

// --- Shared constants ---
const inputCls = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f] transition-all placeholder:text-gray-400';
const IP_CATEGORIES = ['Patent', 'Utility Model', 'Industrial Design', 'Copyright', 'Trademark', 'Trade Secret', 'Other'];
const DEV_STATUSES = ['Concept', 'Prototype', 'Validation', 'Production Ready', 'Commercialized'];
const SCOPES = ['NATIONAL', 'INTERNATIONAL'];
const PATENT_STATUSES = ['Filed', 'Under Examination', 'Published', 'Granted', 'Rejected'];
const NEG_STATUSES = ['Initial Contact', 'Under Negotiation', 'Agreement Signed'];
const FILED_WITH = ['IPO Pakistan', 'USPTO', 'EPO', 'WIPO', 'Other'];
const FINANCIAL_OPTIONS = ['Self-Funded', 'Sponsored', 'Grant-Based', 'Other'];

const statusColors: Record<string, string> = {
  Granted:              'bg-emerald-100 text-emerald-700',
  'Under Examination':  'bg-amber-100 text-amber-700',
  Published:            'bg-blue-100 text-blue-700',
  Filed:                'bg-gray-100 text-gray-600',
  Rejected:             'bg-red-100 text-red-700',
  'Initial Contact':    'bg-gray-100 text-gray-600',
  'Under Negotiation':  'bg-amber-100 text-amber-700',
  'Agreement Signed':   'bg-emerald-100 text-emerald-700',
  'Production Ready':   'bg-sky-100 text-sky-700',
  Prototype:            'bg-violet-100 text-violet-700',
  Validation:           'bg-teal-100 text-teal-700',
};

function Badge({ label }: { label?: string | null }) {
  if (!label) return <span className="text-gray-400 text-xs">—</span>;
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[label] ?? 'bg-gray-100 text-gray-600'}`}>{label}</span>;
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

async function fetchPatents() {
  const res = await fetch('/api/oric/patents');
  if (!res.ok) throw new Error('Failed');
  return res.json() as Promise<{ patents: Patent[]; disclosures: IPDisclosure[]; licensing: IPLicensing[] }>;
}

// --- Empty forms ---
const emptyPatentForm = {
  title: '', leadInventor: '', designation: '', department: '', coInventors: '',
  ipCategory: '', developmentStatus: '', keyAspects: '', commercialPartner: '',
  financialSupport: '', filedWith: '', scope: 'NATIONAL', filingDate: '',
  applicationNumber: '', patentStatus: '', filingProofUrl: '', annexRef: '',
  ipoLastActionDate: '', ipoStatus: '', ipoExaminer: '', ipoComments: '',
  staffId: '', staffName: '', staffEmail: '',
};
const emptyDisclosureForm = {
  title: '', leadInventor: '', designation: '', department: '', ipCategory: '',
  developmentStatus: '', scope: 'NATIONAL', keyAspects: '', commercialPartner: '',
  financialSupport: '', disclosureMadeWith: '', previousDisclosure: '',
  annexRef: '', documentUrl: '', staffId: '', staffName: '', staffEmail: '',
};
const emptyLicensingForm = {
  title: '', leadInventor: '', designationDept: '', ipCategory: '', developmentStatus: '',
  scope: 'NATIONAL', keyAspects: '', fieldOfUse: '', agreementDuration: '',
  negotiationStatus: '', licenseeName: '', annexRef: '', documentUrl: '',
  staffId: '', staffName: '', staffEmail: '',
};

type TabType = 'patents' | 'disclosures' | 'licensing';
type ModalType = 'add' | 'edit' | null;

export default function PatentsPage() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ['oric', 'patents'], queryFn: fetchPatents });
  const { expanded: expandedMap, toggle: toggleExpanded } = useOricAdminStore();
  const expanded = expandedMap['patents'] ?? null;

  const [activeTab, setActiveTab] = useState<TabType>('patents');
  const [modal, setModal] = useState<ModalType>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: TabType } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<{ id: string; title: string; verifyType: string } | null>(null);

  const verify = async (type: string, id: string, action: 'VERIFIED' | 'REJECTED', reason?: string) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/verifications/${type}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      });
      if (res.ok) qc.invalidateQueries({ queryKey: ['oric', 'patents'] });
    } finally {
      setBusyId(null);
      setRejectTarget(null);
    }
  };

  const [patentForm, setPatentForm] = useState({ ...emptyPatentForm });
  const [disclosureForm, setDisclosureForm] = useState({ ...emptyDisclosureForm });
  const [licensingForm, setLicensingForm] = useState({ ...emptyLicensingForm });

  const pf = (k: keyof typeof emptyPatentForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setPatentForm(p => ({ ...p, [k]: e.target.value }));
  const df = (k: keyof typeof emptyDisclosureForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setDisclosureForm(p => ({ ...p, [k]: e.target.value }));
  const lf = (k: keyof typeof emptyLicensingForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setLicensingForm(p => ({ ...p, [k]: e.target.value }));

  const openAdd = () => {
    if (activeTab === 'patents') setPatentForm({ ...emptyPatentForm });
    else if (activeTab === 'disclosures') setDisclosureForm({ ...emptyDisclosureForm });
    else setLicensingForm({ ...emptyLicensingForm });
    setEditId(null);
    setFormError('');
    setModal('add');
  };

  const openEditPatent = (p: Patent) => {
    setPatentForm({
      title: p.title, leadInventor: p.leadInventor ?? '', designation: p.designation ?? '',
      department: p.department ?? '', coInventors: p.coInventors ?? '', ipCategory: p.ipCategory ?? '',
      developmentStatus: p.developmentStatus ?? '', keyAspects: p.keyAspects ?? '',
      commercialPartner: p.commercialPartner ?? '', financialSupport: p.financialSupport ?? '',
      filedWith: p.filedWith ?? '', scope: p.scope, filingDate: toDateInput(p.filingDate),
      applicationNumber: p.applicationNumber ?? '', patentStatus: p.patentStatus ?? '',
      filingProofUrl: p.filingProofUrl ?? '', annexRef: p.annexRef ?? '',
      ipoLastActionDate: toDateInput(p.ipoLastActionDate), ipoStatus: p.ipoStatus ?? '',
      ipoExaminer: p.ipoExaminer ?? '', ipoComments: p.ipoComments ?? '',
      staffId: p.staffId ?? '', staffName: p.staff.name, staffEmail: '',
    });
    setEditId(p.id); setFormError(''); setModal('edit');
  };

  const openEditDisclosure = (d: IPDisclosure) => {
    setDisclosureForm({
      title: d.title, leadInventor: d.leadInventor ?? '', designation: d.designation ?? '',
      department: d.department ?? '', ipCategory: d.ipCategory ?? '',
      developmentStatus: d.developmentStatus ?? '', scope: d.scope, keyAspects: d.keyAspects ?? '',
      commercialPartner: d.commercialPartner ?? '', financialSupport: d.financialSupport ?? '',
      disclosureMadeWith: d.disclosureMadeWith ?? '', previousDisclosure: d.previousDisclosure ?? '',
      annexRef: d.annexRef ?? '', documentUrl: d.documentUrl ?? '',
      staffId: d.staffId ?? '', staffName: d.staff.name, staffEmail: '',
    });
    setEditId(d.id); setFormError(''); setModal('edit');
  };

  const openEditLicensing = (l: IPLicensing) => {
    setLicensingForm({
      title: l.title, leadInventor: l.leadInventor ?? '', designationDept: l.designationDept ?? '',
      ipCategory: l.ipCategory ?? '', developmentStatus: l.developmentStatus ?? '', scope: l.scope,
      keyAspects: l.keyAspects ?? '', fieldOfUse: l.fieldOfUse ?? '',
      agreementDuration: l.agreementDuration ?? '', negotiationStatus: l.negotiationStatus ?? '',
      licenseeName: l.licenseeName ?? '', annexRef: l.annexRef ?? '', documentUrl: l.documentUrl ?? '',
      staffId: l.staffId ?? '', staffName: l.staff.name, staffEmail: '',
    });
    setEditId(l.id); setFormError(''); setModal('edit');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentStaffId = activeTab === 'patents' ? patentForm.staffId : activeTab === 'disclosures' ? disclosureForm.staffId : licensingForm.staffId;
    if (!currentStaffId) { setFormError('Please select a faculty member by searching their email.'); return; }
    setFormError('');
    setSubmitting(true);
    try {
      const isEdit = modal === 'edit';
      let body: Record<string, unknown>;
      let url: string;
      if (activeTab === 'patents') {
        body = { ...patentForm, type: 'patent' };
        url = isEdit ? `/api/oric/patents/${editId}` : '/api/oric/patents';
      } else if (activeTab === 'disclosures') {
        body = { ...disclosureForm, type: 'disclosure' };
        url = isEdit ? `/api/oric/patents/${editId}` : '/api/oric/patents';
      } else {
        body = { ...licensingForm, type: 'licensing' };
        url = isEdit ? `/api/oric/patents/${editId}` : '/api/oric/patents';
      }
      const res = await fetch(url, { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setFormError(d.error ?? 'Failed to save. Please try again.'); return; }
      qc.invalidateQueries({ queryKey: ['oric', 'patents'] });
      setModal(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const url = `/api/oric/patents/${deleteTarget.id}?type=${deleteTarget.type === 'patents' ? 'patent' : deleteTarget.type === 'disclosures' ? 'disclosure' : 'licensing'}`;
    await fetch(url, { method: 'DELETE' });
    qc.invalidateQueries({ queryKey: ['oric', 'patents'] });
    setDeleteTarget(null);
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
            <h1 className="text-2xl font-bold text-gray-900">Patents &amp; IP Register</h1>
            <p className="text-sm text-gray-500 mt-0.5">Patents, disclosures and licensing with full IPO tracking</p>
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-[#1a3d2b] text-white rounded-xl text-sm font-medium hover:bg-[#142d20] transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            Add {activeTab === 'patents' ? 'Patent' : activeTab === 'disclosures' ? 'Disclosure' : 'Licensing'}
          </button>
        </div>
        <div className="flex gap-1 mt-4">
          {([['patents', 'Patents', 'bg-amber-100 text-amber-700'], ['disclosures', 'IP Disclosures', 'bg-violet-100 text-violet-700'], ['licensing', 'IP Licensing', 'bg-sky-100 text-sky-700']] as const).map(([key, label, badge]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === key ? 'bg-[#1a3d2b] text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
              {label}
              {data && <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${activeTab === key ? 'bg-white/20 text-white' : badge}`}>{data[key].length}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="text-base font-semibold text-gray-900">
                {modal === 'edit' ? 'Edit' : 'Add'} {activeTab === 'patents' ? 'Patent' : activeTab === 'disclosures' ? 'IP Disclosure' : 'IP Licensing'}
              </h3>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><X className="w-4 h-4 text-gray-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {/* Faculty email search */}
              {activeTab === 'patents' && (
                <FacultyEmailSearch staffId={patentForm.staffId} staffName={patentForm.staffName} staffEmail={patentForm.staffEmail}
                  onSelect={s => setPatentForm(p => ({ ...p, staffId: s.id, staffName: s.name, staffEmail: s.email }))} inputCls={inputCls} />
              )}
              {activeTab === 'disclosures' && (
                <FacultyEmailSearch staffId={disclosureForm.staffId} staffName={disclosureForm.staffName} staffEmail={disclosureForm.staffEmail}
                  onSelect={s => setDisclosureForm(p => ({ ...p, staffId: s.id, staffName: s.name, staffEmail: s.email }))} inputCls={inputCls} />
              )}
              {activeTab === 'licensing' && (
                <FacultyEmailSearch staffId={licensingForm.staffId} staffName={licensingForm.staffName} staffEmail={licensingForm.staffEmail}
                  onSelect={s => setLicensingForm(p => ({ ...p, staffId: s.id, staffName: s.name, staffEmail: s.email }))} inputCls={inputCls} />
              )}

              {/* Patent form */}
              {activeTab === 'patents' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Title *</label>
                    <input required value={patentForm.title} onChange={pf('title')} className={inputCls} placeholder="Patent title" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Lead Inventor</label><input value={patentForm.leadInventor} onChange={pf('leadInventor')} className={inputCls} /></div>
                    <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Designation</label><input value={patentForm.designation} onChange={pf('designation')} className={inputCls} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Department</label><input value={patentForm.department} onChange={pf('department')} className={inputCls} /></div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">IP Category</label>
                      <select value={patentForm.ipCategory} onChange={pf('ipCategory')} className={inputCls}><option value="">— Select —</option>{IP_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Co-Inventors</label>
                    <AutoGrowTextarea value={patentForm.coInventors} onChange={pf('coInventors')} className={inputCls} placeholder="Names of co-inventors…" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Development Status</label>
                      <select value={patentForm.developmentStatus} onChange={pf('developmentStatus')} className={inputCls}><option value="">— Select —</option>{DEV_STATUSES.map(s => <option key={s}>{s}</option>)}</select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Scope</label>
                      <select value={patentForm.scope} onChange={pf('scope')} className={inputCls}>{SCOPES.map(s => <option key={s}>{s}</option>)}</select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Filed With</label>
                      <select value={patentForm.filedWith} onChange={pf('filedWith')} className={inputCls}><option value="">— Select —</option>{FILED_WITH.map(f => <option key={f}>{f}</option>)}</select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Patent Status</label>
                      <select value={patentForm.patentStatus} onChange={pf('patentStatus')} className={inputCls}><option value="">— Select —</option>{PATENT_STATUSES.map(s => <option key={s}>{s}</option>)}</select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Filing Date</label><input type="date" value={patentForm.filingDate} onChange={pf('filingDate')} className={inputCls} /></div>
                    <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Application Number</label><input value={patentForm.applicationNumber} onChange={pf('applicationNumber')} className={inputCls} /></div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Key Aspects / Description</label>
                    <AutoGrowTextarea value={patentForm.keyAspects} onChange={pf('keyAspects')} className={inputCls} placeholder="Technical description…" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Commercial Partner</label><input value={patentForm.commercialPartner} onChange={pf('commercialPartner')} className={inputCls} /></div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Financial Support</label>
                      <select value={patentForm.financialSupport} onChange={pf('financialSupport')} className={inputCls}><option value="">— Select —</option>{FINANCIAL_OPTIONS.map(o => <option key={o}>{o}</option>)}</select>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">IPO Tracking</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">IPO Last Action Date</label><input type="date" value={patentForm.ipoLastActionDate} onChange={pf('ipoLastActionDate')} className={inputCls} /></div>
                      <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">IPO Status</label><input value={patentForm.ipoStatus} onChange={pf('ipoStatus')} className={inputCls} /></div>
                    </div>
                    <div className="mt-4"><label className="block text-xs font-semibold text-gray-600 mb-1.5">IPO Examiner</label><input value={patentForm.ipoExaminer} onChange={pf('ipoExaminer')} className={inputCls} /></div>
                    <div className="mt-4">
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">IPO Comments</label>
                      <AutoGrowTextarea value={patentForm.ipoComments} onChange={pf('ipoComments')} className={inputCls} placeholder="Comments from IPO…" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Annex Reference</label><input value={patentForm.annexRef} onChange={pf('annexRef')} className={inputCls} /></div>
                    <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Filing Proof URL</label><input type="url" value={patentForm.filingProofUrl} onChange={pf('filingProofUrl')} className={inputCls} placeholder="https://…" /></div>
                  </div>
                </>
              )}

              {/* Disclosure form */}
              {activeTab === 'disclosures' && (
                <>
                  <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Title *</label><input required value={disclosureForm.title} onChange={df('title')} className={inputCls} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Lead Inventor</label><input value={disclosureForm.leadInventor} onChange={df('leadInventor')} className={inputCls} /></div>
                    <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Designation</label><input value={disclosureForm.designation} onChange={df('designation')} className={inputCls} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Department</label><input value={disclosureForm.department} onChange={df('department')} className={inputCls} /></div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">IP Category</label>
                      <select value={disclosureForm.ipCategory} onChange={df('ipCategory')} className={inputCls}><option value="">— Select —</option>{IP_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Development Status</label>
                      <select value={disclosureForm.developmentStatus} onChange={df('developmentStatus')} className={inputCls}><option value="">— Select —</option>{DEV_STATUSES.map(s => <option key={s}>{s}</option>)}</select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Scope</label>
                      <select value={disclosureForm.scope} onChange={df('scope')} className={inputCls}>{SCOPES.map(s => <option key={s}>{s}</option>)}</select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Key Aspects / Description</label>
                    <AutoGrowTextarea value={disclosureForm.keyAspects} onChange={df('keyAspects')} className={inputCls} placeholder="Technical description…" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Commercial Partner</label><input value={disclosureForm.commercialPartner} onChange={df('commercialPartner')} className={inputCls} /></div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Financial Support</label>
                      <select value={disclosureForm.financialSupport} onChange={df('financialSupport')} className={inputCls}><option value="">— Select —</option>{FINANCIAL_OPTIONS.map(o => <option key={o}>{o}</option>)}</select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Disclosure Made With</label>
                    <AutoGrowTextarea value={disclosureForm.disclosureMadeWith} onChange={df('disclosureMadeWith')} className={inputCls} placeholder="Organizations/persons disclosed to…" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Previous Disclosure</label>
                    <AutoGrowTextarea value={disclosureForm.previousDisclosure} onChange={df('previousDisclosure')} className={inputCls} placeholder="Any prior disclosures…" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Annex Reference</label><input value={disclosureForm.annexRef} onChange={df('annexRef')} className={inputCls} /></div>
                    <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Document URL</label><input type="url" value={disclosureForm.documentUrl} onChange={df('documentUrl')} className={inputCls} placeholder="https://…" /></div>
                  </div>
                </>
              )}

              {/* Licensing form */}
              {activeTab === 'licensing' && (
                <>
                  <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Title *</label><input required value={licensingForm.title} onChange={lf('title')} className={inputCls} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Lead Inventor</label><input value={licensingForm.leadInventor} onChange={lf('leadInventor')} className={inputCls} /></div>
                    <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Designation / Dept</label><input value={licensingForm.designationDept} onChange={lf('designationDept')} className={inputCls} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">IP Category</label>
                      <select value={licensingForm.ipCategory} onChange={lf('ipCategory')} className={inputCls}><option value="">— Select —</option>{IP_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Development Status</label>
                      <select value={licensingForm.developmentStatus} onChange={lf('developmentStatus')} className={inputCls}><option value="">— Select —</option>{DEV_STATUSES.map(s => <option key={s}>{s}</option>)}</select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Scope</label>
                      <select value={licensingForm.scope} onChange={lf('scope')} className={inputCls}>{SCOPES.map(s => <option key={s}>{s}</option>)}</select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Negotiation Status</label>
                      <select value={licensingForm.negotiationStatus} onChange={lf('negotiationStatus')} className={inputCls}><option value="">— Select —</option>{NEG_STATUSES.map(s => <option key={s}>{s}</option>)}</select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Key Aspects / Description</label>
                    <AutoGrowTextarea value={licensingForm.keyAspects} onChange={lf('keyAspects')} className={inputCls} placeholder="Technical description…" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Licensee Name</label><input value={licensingForm.licenseeName} onChange={lf('licenseeName')} className={inputCls} /></div>
                    <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Field of Use</label><input value={licensingForm.fieldOfUse} onChange={lf('fieldOfUse')} className={inputCls} /></div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Agreement Duration</label>
                    <input value={licensingForm.agreementDuration} onChange={lf('agreementDuration')} className={inputCls} placeholder="e.g. 5 Years" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Annex Reference</label><input value={licensingForm.annexRef} onChange={lf('annexRef')} className={inputCls} /></div>
                    <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Document URL</label><input type="url" value={licensingForm.documentUrl} onChange={lf('documentUrl')} className={inputCls} placeholder="https://…" /></div>
                  </div>
                </>
              )}

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

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Delete Record?</h3>
            <p className="text-sm text-gray-500 mb-5">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {rejectTarget && (
        <RejectModal
          title={rejectTarget.title}
          onClose={() => setRejectTarget(null)}
          onConfirm={(reason) => verify(rejectTarget.verifyType, rejectTarget.id, 'REJECTED', reason)}
          processing={busyId === rejectTarget.id}
        />
      )}

      <div className="px-6 py-6 space-y-8">
        {isLoading && <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-[#1a3d2b]/20 border-t-[#1a3d2b] rounded-full animate-spin" /></div>}
        {error && <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-700">Failed to load data.</div>}

        {data && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Patents', value: data.patents.length, icon: <Award className="w-4 h-4 text-amber-600" />, bg: 'bg-amber-50' },
                { label: 'IP Disclosures', value: data.disclosures.length, icon: <FileSearch className="w-4 h-4 text-violet-600" />, bg: 'bg-violet-50' },
                { label: 'IP Licensing', value: data.licensing.length, icon: <Shield className="w-4 h-4 text-sky-600" />, bg: 'bg-sky-50' },
              ].map(({ label, value, icon, bg }) => (
                <div key={label} className={`${bg} rounded-2xl border border-white shadow-sm p-4 flex items-center gap-3`}>
                  <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">{icon}</div>
                  <div>
                    <p className="text-2xl font-extrabold text-gray-900 leading-none">{value}</p>
                    <p className="text-xs font-semibold text-gray-600 mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Patents tab */}
            {activeTab === 'patents' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                  <Award className="w-5 h-5 text-amber-600" />
                  <h2 className="text-base font-semibold text-gray-900">Patents</h2>
                  <span className="ml-auto px-2.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">{data.patents.length}</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {data.patents.length === 0 && <p className="px-6 py-8 text-center text-sm text-gray-400">No patents on record.</p>}
                  {data.patents.map((p, i) => (
                    <div key={p.id}>
                      <div className="flex items-start gap-2 px-6 py-4 hover:bg-gray-50/60 transition-colors">
                        <button onClick={() => toggleExpanded('patents', p.id)} className="flex-1 text-left flex items-start gap-4 min-w-0">
                          <span className="text-xs text-gray-400 mt-0.5 w-5 shrink-0">{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900 text-sm">{p.title}</span>
                              <Badge label={p.patentStatus} />
                              {p.ipCategory && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">{p.ipCategory}</span>}
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                                p.verificationStatus === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                p.verificationStatus === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                'bg-red-50 text-red-700 border-red-200'
                              }`}>{p.verificationStatus}</span>
                            </div>
                            {p.rejectionReason && <p className="text-xs text-red-600 mt-0.5">{p.rejectionReason}</p>}
                            <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                              <span>Inventor: <span className="text-gray-700 font-medium">{p.leadInventor ?? p.staff.name}</span></span>
                              <span>Filed with: {p.filedWith ?? '—'}</span>
                              {p.applicationNumber && <span>App No: {p.applicationNumber}</span>}
                            </div>
                          </div>
                          {expanded === p.id ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />}
                        </button>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          {p.verificationStatus === 'PENDING' && (
                            <>
                              <button onClick={() => verify('patent', p.id, 'VERIFIED')} disabled={busyId === p.id}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold disabled:opacity-50 transition-colors">
                                {busyId === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />} Approve
                              </button>
                              <button onClick={() => setRejectTarget({ id: p.id, title: p.title, verifyType: 'patent' })} disabled={busyId === p.id}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold disabled:opacity-50 transition-colors">
                                <XCircle className="w-3 h-3" /> Reject
                              </button>
                            </>
                          )}
                          <button onClick={() => { setActiveTab('patents'); openEditPatent(p); }} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setDeleteTarget({ id: p.id, type: 'patents' })} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                      {expanded === p.id && (
                        <div className="px-6 pb-6 bg-gray-50/60 border-t border-gray-100">
                          <div className="pt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            <Field label="Title" value={p.title} />
                            <Field label="IP Category" value={p.ipCategory} />
                            <Field label="Patent Status" value={p.patentStatus} />
                            <Field label="Lead Inventor" value={p.leadInventor ?? p.staff.name} />
                            <Field label="Designation" value={p.designation ?? p.staff.designation} />
                            <Field label="Department" value={p.department ?? p.staff.department?.name} />
                            <Field label="Co-Inventors" value={p.coInventors} />
                            <Field label="Development Status" value={p.developmentStatus} />
                            <Field label="Scope" value={p.scope} />
                            <Field label="Filed With" value={p.filedWith} />
                            <Field label="Filing Date" value={fmtDate(p.filingDate)} />
                            <Field label="Application Number" value={p.applicationNumber} />
                            <Field label="Commercial Partner" value={p.commercialPartner} />
                            <Field label="Financial Support" value={p.financialSupport} />
                            <Field label="Annex Reference" value={p.annexRef} />
                          </div>
                          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <Field label="Key Aspects / Description" value={p.keyAspects} />
                            <div className="space-y-3">
                              <Field label="IPO Last Action Date" value={fmtDate(p.ipoLastActionDate)} />
                              <Field label="IPO Status" value={p.ipoStatus} />
                              <Field label="IPO Examiner" value={p.ipoExaminer} />
                              <Field label="IPO Comments" value={p.ipoComments} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Disclosures tab */}
            {activeTab === 'disclosures' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                  <FileSearch className="w-5 h-5 text-violet-600" />
                  <h2 className="text-base font-semibold text-gray-900">IP Disclosures</h2>
                  <span className="ml-auto px-2.5 py-0.5 bg-violet-100 text-violet-700 rounded-full text-xs font-semibold">{data.disclosures.length}</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {data.disclosures.length === 0 && <p className="px-6 py-8 text-center text-sm text-gray-400">No IP disclosures on record.</p>}
                  {data.disclosures.map((d, i) => (
                    <div key={d.id}>
                      <div className="flex items-start gap-2 px-6 py-4 hover:bg-gray-50/60 transition-colors">
                        <button onClick={() => toggleExpanded('patents', d.id)} className="flex-1 text-left flex items-start gap-4 min-w-0">
                          <span className="text-xs text-gray-400 mt-0.5 w-5 shrink-0">{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900 text-sm">{d.title}</span>
                              <Badge label={d.developmentStatus} />
                              {d.ipCategory && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">{d.ipCategory}</span>}
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                                d.verificationStatus === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                d.verificationStatus === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                'bg-red-50 text-red-700 border-red-200'
                              }`}>{d.verificationStatus}</span>
                            </div>
                            {d.rejectionReason && <p className="text-xs text-red-600 mt-0.5">{d.rejectionReason}</p>}
                            <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                              <span>Inventor: <span className="text-gray-700 font-medium">{d.leadInventor ?? d.staff.name}</span></span>
                              <span>Scope: {d.scope}</span>
                            </div>
                          </div>
                          {expanded === d.id ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />}
                        </button>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          {d.verificationStatus === 'PENDING' && (
                            <>
                              <button onClick={() => verify('disclosure', d.id, 'VERIFIED')} disabled={busyId === d.id}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold disabled:opacity-50 transition-colors">
                                {busyId === d.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />} Approve
                              </button>
                              <button onClick={() => setRejectTarget({ id: d.id, title: d.title, verifyType: 'disclosure' })} disabled={busyId === d.id}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold disabled:opacity-50 transition-colors">
                                <XCircle className="w-3 h-3" /> Reject
                              </button>
                            </>
                          )}
                          <button onClick={() => { setActiveTab('disclosures'); openEditDisclosure(d); }} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setDeleteTarget({ id: d.id, type: 'disclosures' })} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                      {expanded === d.id && (
                        <div className="px-6 pb-6 bg-gray-50/60 border-t border-gray-100">
                          <div className="pt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            <Field label="Title" value={d.title} />
                            <Field label="IP Category" value={d.ipCategory} />
                            <Field label="Development Status" value={d.developmentStatus} />
                            <Field label="Lead Inventor" value={d.leadInventor ?? d.staff.name} />
                            <Field label="Designation" value={d.designation ?? d.staff.designation} />
                            <Field label="Department" value={d.department ?? d.staff.department?.name} />
                            <Field label="Scope" value={d.scope} />
                            <Field label="Commercial Partner" value={d.commercialPartner} />
                            <Field label="Financial Support" value={d.financialSupport} />
                            <Field label="Disclosure Made With" value={d.disclosureMadeWith} />
                            <Field label="Previous Disclosure" value={d.previousDisclosure} />
                            <Field label="Annex Reference" value={d.annexRef} />
                          </div>
                          <div className="mt-5"><Field label="Key Aspects / Description" value={d.keyAspects} /></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Licensing tab */}
            {activeTab === 'licensing' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                  <Shield className="w-5 h-5 text-sky-600" />
                  <h2 className="text-base font-semibold text-gray-900">IP Licensing</h2>
                  <span className="ml-auto px-2.5 py-0.5 bg-sky-100 text-sky-700 rounded-full text-xs font-semibold">{data.licensing.length}</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {data.licensing.length === 0 && <p className="px-6 py-8 text-center text-sm text-gray-400">No licensing records.</p>}
                  {data.licensing.map((l, i) => (
                    <div key={l.id}>
                      <div className="flex items-start gap-2 px-6 py-4 hover:bg-gray-50/60 transition-colors">
                        <button onClick={() => toggleExpanded('patents', l.id)} className="flex-1 text-left flex items-start gap-4 min-w-0">
                          <span className="text-xs text-gray-400 mt-0.5 w-5 shrink-0">{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900 text-sm">{l.title}</span>
                              <Badge label={l.negotiationStatus} />
                              {l.ipCategory && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">{l.ipCategory}</span>}
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                                l.verificationStatus === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                l.verificationStatus === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                'bg-red-50 text-red-700 border-red-200'
                              }`}>{l.verificationStatus}</span>
                            </div>
                            {l.rejectionReason && <p className="text-xs text-red-600 mt-0.5">{l.rejectionReason}</p>}
                            <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                              <span>Inventor: <span className="text-gray-700 font-medium">{l.leadInventor ?? l.staff.name}</span></span>
                              {l.licenseeName && <span>Licensee: {l.licenseeName}</span>}
                            </div>
                          </div>
                          {expanded === l.id ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />}
                        </button>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          {l.verificationStatus === 'PENDING' && (
                            <>
                              <button onClick={() => verify('licensing', l.id, 'VERIFIED')} disabled={busyId === l.id}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold disabled:opacity-50 transition-colors">
                                {busyId === l.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />} Approve
                              </button>
                              <button onClick={() => setRejectTarget({ id: l.id, title: l.title, verifyType: 'licensing' })} disabled={busyId === l.id}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold disabled:opacity-50 transition-colors">
                                <XCircle className="w-3 h-3" /> Reject
                              </button>
                            </>
                          )}
                          <button onClick={() => { setActiveTab('licensing'); openEditLicensing(l); }} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setDeleteTarget({ id: l.id, type: 'licensing' })} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                      {expanded === l.id && (
                        <div className="px-6 pb-6 bg-gray-50/60 border-t border-gray-100">
                          <div className="pt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            <Field label="Title" value={l.title} />
                            <Field label="IP Category" value={l.ipCategory} />
                            <Field label="Negotiation Status" value={l.negotiationStatus} />
                            <Field label="Lead Inventor" value={l.leadInventor ?? l.staff.name} />
                            <Field label="Designation / Dept" value={l.designationDept ?? l.staff.designation} />
                            <Field label="Scope" value={l.scope} />
                            <Field label="Development Status" value={l.developmentStatus} />
                            <Field label="Licensee Name" value={l.licenseeName} />
                            <Field label="Field of Use" value={l.fieldOfUse} />
                            <Field label="Agreement Duration" value={l.agreementDuration} />
                            <Field label="Annex Reference" value={l.annexRef} />
                            <Field label="Submitted By" value={l.staff.name} />
                          </div>
                          <div className="mt-5"><Field label="Key Aspects / Description" value={l.keyAspects} /></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
