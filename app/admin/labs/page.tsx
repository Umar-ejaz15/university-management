'use client';

import { useEffect, useState, useCallback } from 'react';
import Header from '@/components/Header';
import {
  FlaskConical,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  X,
  Save,
  Package,
  MapPin,
  User,
  Hash,
  Layers,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Equipment {
  id: string;
  srNo: number | null;
  name: string;
  model: string | null;
  quantity: number;
  notes: string | null;
}

interface Lab {
  id: string;
  name: string;
  floor: string;
  labInCharge: string;
  description: string | null;
  equipment: Equipment[];
}

type LabForm = { name: string; floor: string; labInCharge: string; description: string };
type EquipmentForm = { name: string; model: string; quantity: number; srNo: string; notes: string };

const emptyLabForm = (): LabForm => ({ name: '', floor: '', labInCharge: '', description: '' });
const emptyEqForm = (): EquipmentForm => ({ name: '', model: '', quantity: 1, srNo: '', notes: '' });

// ─── Lab Modal ────────────────────────────────────────────────────────────────

function LabModal({
  initial,
  onClose,
  onSave,
  saving,
}: {
  initial?: Lab;
  onClose: () => void;
  onSave: (form: LabForm) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<LabForm>(
    initial
      ? { name: initial.name, floor: initial.floor, labInCharge: initial.labInCharge, description: initial.description || '' }
      : emptyLabForm()
  );

  const set = (k: keyof LabForm, v: string) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-[#2d6a4f] to-[#40916c] px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">{initial ? 'Edit Lab' : 'Add New Lab'}</h3>
            <p className="text-sm text-white/70 mt-0.5">Fill in the lab details below</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {[
            { label: 'Lab Name', key: 'name' as const, placeholder: 'e.g. Soil Science Lab', icon: <FlaskConical className="w-4 h-4 text-gray-400" /> },
            { label: 'Floor / Location', key: 'floor' as const, placeholder: 'e.g. Ground Floor, Block A', icon: <MapPin className="w-4 h-4 text-gray-400" /> },
            { label: 'Lab In-Charge', key: 'labInCharge' as const, placeholder: 'Name of responsible person', icon: <User className="w-4 h-4 text-gray-400" /> },
          ].map(({ label, key, placeholder, icon }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{label} <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</span>
                <input
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value)}
                  placeholder={placeholder}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f] outline-none transition-colors"
                />
              </div>
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              placeholder="Brief description of the lab and its purpose…"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f] outline-none resize-none transition-colors"
            />
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={saving || !form.name.trim() || !form.floor.trim() || !form.labInCharge.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2d6a4f] text-white rounded-xl text-sm font-semibold hover:bg-[#245a42] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving…' : initial ? 'Update Lab' : 'Create Lab'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Equipment Modal ───────────────────────────────────────────────────────────

function EquipmentModal({
  labName,
  initial,
  onClose,
  onSave,
  saving,
}: {
  labName: string;
  initial?: Equipment;
  onClose: () => void;
  onSave: (form: EquipmentForm) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<EquipmentForm>(
    initial
      ? { name: initial.name, model: initial.model || '', quantity: initial.quantity, srNo: initial.srNo?.toString() || '', notes: initial.notes || '' }
      : emptyEqForm()
  );
  const set = (k: keyof EquipmentForm, v: string | number) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">{initial ? 'Edit Equipment' : 'Add Equipment'}</h3>
            <p className="text-sm text-white/70 mt-0.5">Lab: {labName}</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Equipment Name <span className="text-red-500">*</span></label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. Spectrophotometer"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Model</label>
              <input
                value={form.model}
                onChange={(e) => set('model', e.target.value)}
                placeholder="Model number"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Sr. No.</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={form.srNo}
                  onChange={(e) => set('srNo', e.target.value)}
                  placeholder="Serial #"
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Quantity</label>
            <div className="relative">
              <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                min={1}
                value={form.quantity}
                onChange={(e) => set('quantity', Number(e.target.value))}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              rows={2}
              placeholder="Any additional notes…"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none resize-none transition-colors"
            />
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={saving || !form.name.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving…' : initial ? 'Update' : 'Add Equipment'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminLabsPage() {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedLab, setExpandedLab] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Lab modal state
  const [labModal, setLabModal] = useState<{ open: boolean; lab?: Lab }>({ open: false });
  // Equipment modal state
  const [eqModal, setEqModal] = useState<{ open: boolean; labId: string; labName: string; eq?: Equipment } | null>(null);

  const fetchLabs = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch('/api/admin/labs');
      if (res.ok) {
        const data = await res.json();
        setLabs(data.labs);
      }
    } catch (err) {
      console.error('Failed to fetch labs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchLabs(); }, [fetchLabs]);

  // ── Lab CRUD ──────────────────────────────────────────────────────────────

  const handleSaveLab = async (form: LabForm) => {
    setSaving(true);
    try {
      const method = labModal.lab ? 'PUT' : 'POST';
      const url = labModal.lab ? `/api/admin/labs/${labModal.lab.id}` : '/api/admin/labs';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setLabModal({ open: false });
        await fetchLabs(true);
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to save lab');
      }
    } catch { alert('Failed to save lab'); }
    finally { setSaving(false); }
  };

  const handleDeleteLab = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" and all its equipment? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/labs/${id}`, { method: 'DELETE' });
      if (res.ok) await fetchLabs(true);
      else alert('Failed to delete lab');
    } catch { alert('Failed to delete lab'); }
  };

  // ── Equipment CRUD ────────────────────────────────────────────────────────

  const handleSaveEquipment = async (form: EquipmentForm) => {
    if (!eqModal) return;
    setSaving(true);
    try {
      const method = eqModal.eq ? 'PUT' : 'POST';
      const url = eqModal.eq
        ? `/api/admin/labs/${eqModal.labId}/equipment/${eqModal.eq.id}`
        : `/api/admin/labs/${eqModal.labId}/equipment`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setEqModal(null);
        await fetchLabs(true);
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to save equipment');
      }
    } catch { alert('Failed to save equipment'); }
    finally { setSaving(false); }
  };

  const handleDeleteEquipment = async (labId: string, eqId: string, eqName: string) => {
    if (!confirm(`Delete "${eqName}"?`)) return;
    try {
      const res = await fetch(`/api/admin/labs/${labId}/equipment/${eqId}`, { method: 'DELETE' });
      if (res.ok) await fetchLabs(true);
      else alert('Failed to delete equipment');
    } catch { alert('Failed to delete equipment'); }
  };

  // ── Stats ─────────────────────────────────────────────────────────────────

  const totalEquipment = labs.reduce((sum, l) => sum + l.equipment.length, 0);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Page header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2d6a4f] to-[#40916c] flex items-center justify-center shadow-lg shadow-[#2d6a4f]/20">
                <FlaskConical className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Labs Management</h1>
                <p className="text-sm text-gray-500 mt-0.5">Manage university labs and their equipment</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchLabs(true)}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 disabled:opacity-60 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => setLabModal({ open: true })}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#2d6a4f] text-white rounded-xl text-sm font-semibold hover:bg-[#245a42] transition-colors shadow-sm shadow-[#2d6a4f]/20"
              >
                <Plus className="w-4 h-4" />
                Add Lab
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#2d6a4f]/10 flex items-center justify-center flex-shrink-0">
              <FlaskConical className="w-5 h-5 text-[#2d6a4f]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{labs.length}</p>
              <p className="text-xs text-gray-500 mt-0.5">Total Labs</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalEquipment}</p>
              <p className="text-xs text-gray-500 mt-0.5">Total Equipment</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 col-span-2 sm:col-span-1">
            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
              <Layers className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {labs.reduce((sum, l) => sum + l.equipment.reduce((s, e) => s + e.quantity, 0), 0)}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Total Units</p>
            </div>
          </div>
        </div>

        {/* Labs list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-10 h-10 border-3 border-[#2d6a4f]/20 border-t-[#2d6a4f] rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500">Loading labs…</p>
            </div>
          </div>
        ) : labs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-20 text-center">
            <div className="w-16 h-16 bg-[#2d6a4f]/8 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FlaskConical className="w-8 h-8 text-[#2d6a4f]/50" />
            </div>
            <p className="text-gray-700 font-semibold">No labs yet</p>
            <p className="text-sm text-gray-400 mt-1 mb-4">Add your first lab to get started</p>
            <button
              onClick={() => setLabModal({ open: true })}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2d6a4f] text-white rounded-xl text-sm font-semibold hover:bg-[#245a42] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Lab
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {labs.map((lab) => {
              const expanded = expandedLab === lab.id;
              return (
                <div key={lab.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* Lab header */}
                  <div className="p-5 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2d6a4f] to-[#40916c] flex items-center justify-center flex-shrink-0 shadow-md shadow-[#2d6a4f]/20">
                      <FlaskConical className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start gap-2">
                        <h3 className="text-base font-bold text-gray-900">{lab.name}</h3>
                        <span className="px-2 py-0.5 text-xs bg-[#2d6a4f]/10 text-[#2d6a4f] rounded-full font-medium">
                          {lab.equipment.length} items
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{lab.floor}</span>
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{lab.labInCharge}</span>
                      </div>
                      {lab.description && (
                        <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{lab.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => setLabModal({ open: true, lab })}
                        className="p-2 text-gray-400 hover:text-[#2d6a4f] hover:bg-[#2d6a4f]/8 rounded-lg transition-colors"
                        title="Edit lab"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteLab(lab.id, lab.name)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete lab"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setExpandedLab(expanded ? null : lab.id)}
                        className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        title={expanded ? 'Collapse' : 'Expand'}
                      >
                        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Equipment list (expanded) */}
                  {expanded && (
                    <div className="border-t border-gray-100 px-5 pb-5 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-700">Equipment ({lab.equipment.length})</h4>
                        <button
                          onClick={() => setEqModal({ open: true, labId: lab.id, labName: lab.name })}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add Equipment
                        </button>
                      </div>

                      {lab.equipment.length === 0 ? (
                        <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                          <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-400">No equipment added yet</p>
                          <button
                            onClick={() => setEqModal({ open: true, labId: lab.id, labName: lab.name })}
                            className="mt-2 text-xs text-blue-600 hover:underline font-medium"
                          >
                            Add first equipment
                          </button>
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-xl border border-gray-100">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sr#</th>
                                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Model</th>
                                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Qty</th>
                                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes</th>
                                <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {lab.equipment.map((eq) => (
                                <tr key={eq.id} className="hover:bg-gray-50/70 transition-colors">
                                  <td className="px-4 py-3 text-gray-500 text-xs">{eq.srNo ?? '—'}</td>
                                  <td className="px-4 py-3 font-medium text-gray-900">{eq.name}</td>
                                  <td className="px-4 py-3 text-gray-500">{eq.model || '—'}</td>
                                  <td className="px-4 py-3">
                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">{eq.quantity}</span>
                                  </td>
                                  <td className="px-4 py-3 text-gray-500 text-xs max-w-[200px] truncate">{eq.notes || '—'}</td>
                                  <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        onClick={() => setEqModal({ open: true, labId: lab.id, labName: lab.name, eq })}
                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                      >
                                        <Pencil className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteEquipment(lab.id, eq.id, eq.name)}
                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {labModal.open && (
        <LabModal
          initial={labModal.lab}
          onClose={() => setLabModal({ open: false })}
          onSave={handleSaveLab}
          saving={saving}
        />
      )}
      {eqModal && (
        <EquipmentModal
          labName={eqModal.labName}
          initial={eqModal.eq}
          onClose={() => setEqModal(null)}
          onSave={handleSaveEquipment}
          saving={saving}
        />
      )}
    </div>
  );
}
