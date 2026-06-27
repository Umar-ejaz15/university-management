'use client';

import { useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import AutoGrowTextarea from '@/components/oric/AutoGrowTextarea';
import {
  type OricFormProps,
  OricFieldRow,
  OricSectionHeader,
  OricAdminOnlyBanner,
  OricFormError,
  BLANK_PROJECT,
} from './primitives';

const THEMATIC_AREAS = [
  'Agriculture & Food Security',
  'Water & Environment',
  'Health & Biotechnology',
  'Engineering & Technology',
  'Social Sciences',
  'Climate Change',
  'Other',
];

const FINANCIAL_YEARS = ['2025-26', '2024-25', '2023-24', '2022-23', '2021-22'];

export function OricResearchForm({ inputCls, setSuccess }: OricFormProps) {
  const ic = inputCls;
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const [f, setF] = useState({ ...BLANK_PROJECT });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!f.title.trim()) {
      setFormError('Project title is required.');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/teacher/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: f.title,
          description: f.description,
          projectKind: 'RESEARCH',
          scope: f.scope,
          objectives: f.objectives,
          methodology: f.methodology,
          outcomes: f.outcomes,
          deliverables: f.deliverables,
          targetBeneficiaries: f.targetBeneficiaries,
          collaborators: f.collaborators,
          startDate: f.startDate || null,
          endDate: f.endDate || null,
          thematicArea: f.thematicArea,
          projectType: f.projectType,
          projectCategory: f.projectCategory,
          funderType: f.funderType,
          funderLocation: f.funderLocation,
          financialYear: f.financialYear,
          budgetAmount: f.budgetAmount || null,
          currency: f.currency,
          fundingAgency: f.fundingAgency,
          sponsoringAgency: f.sponsoringAgency,
          sponsorCountry: f.sponsorCountry,
          counterpartName: f.counterpartName,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Submission failed');
        return;
      }
      setSuccess('Research project submitted to ORIC for review.');
      setF({ ...BLANK_PROJECT });
    } catch {
      setFormError('Network error. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <OricFormError message={formError} />

      <OricSectionHeader title="Project Identification" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <OricFieldRow label="Project Title" required>
            <input value={f.title} onChange={(e) => set('title', e.target.value)} placeholder="Full project title" className={ic} />
          </OricFieldRow>
        </div>
        <OricFieldRow label="Project Type">
          <select value={f.projectType} onChange={(e) => set('projectType', e.target.value)} className={ic}>
            <option value="">Select…</option>
            <option>Research</option>
            <option>Development</option>
            <option>Contracted Research</option>
            <option>Collaborative</option>
          </select>
        </OricFieldRow>
        <OricFieldRow label="Project Category">
          <input value={f.projectCategory} onChange={(e) => set('projectCategory', e.target.value)} placeholder="e.g. Interdisciplinary, Applied" className={ic} />
        </OricFieldRow>
        <OricFieldRow label="Thematic Area">
          <select value={f.thematicArea} onChange={(e) => set('thematicArea', e.target.value)} className={ic}>
            <option value="">Select…</option>
            {THEMATIC_AREAS.map((t) => <option key={t}>{t}</option>)}
          </select>
        </OricFieldRow>
        <OricFieldRow label="Scope">
          <select value={f.scope} onChange={(e) => set('scope', e.target.value)} className={ic}>
            <option value="NATIONAL">National</option>
            <option value="INTERNATIONAL">International</option>
          </select>
        </OricFieldRow>
        <OricFieldRow label="Financial Year">
          <select value={f.financialYear} onChange={(e) => set('financialYear', e.target.value)} className={ic}>
            <option value="">Select…</option>
            {FINANCIAL_YEARS.map((y) => <option key={y}>{y}</option>)}
          </select>
        </OricFieldRow>
        <OricFieldRow label="Start Date" required>
          <input type="date" value={f.startDate} onChange={(e) => set('startDate', e.target.value)} className={ic} />
        </OricFieldRow>
        <OricFieldRow label="End Date">
          <input type="date" value={f.endDate} onChange={(e) => set('endDate', e.target.value)} className={ic} />
        </OricFieldRow>
      </div>

      <OricSectionHeader title="Project Details" />
      <div className="space-y-4">
        <OricFieldRow label="Description / Abstract" required>
          <AutoGrowTextarea value={f.description} onChange={(e) => set('description', e.target.value)} placeholder="Brief description of the project…" className={ic} />
        </OricFieldRow>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <OricFieldRow label="Objectives">
            <AutoGrowTextarea value={f.objectives} onChange={(e) => set('objectives', e.target.value)} placeholder="List the key objectives…" className={ic} />
          </OricFieldRow>
          <OricFieldRow label="Methodology">
            <AutoGrowTextarea value={f.methodology} onChange={(e) => set('methodology', e.target.value)} placeholder="Describe the methodology…" className={ic} />
          </OricFieldRow>
          <OricFieldRow label="Expected Outcomes">
            <AutoGrowTextarea value={f.outcomes} onChange={(e) => set('outcomes', e.target.value)} className={ic} />
          </OricFieldRow>
          <OricFieldRow label="Deliverables">
            <AutoGrowTextarea value={f.deliverables} onChange={(e) => set('deliverables', e.target.value)} className={ic} />
          </OricFieldRow>
          <div className="sm:col-span-2">
            <OricFieldRow label="Target Beneficiaries">
              <AutoGrowTextarea value={f.targetBeneficiaries} onChange={(e) => set('targetBeneficiaries', e.target.value)} className={ic} />
            </OricFieldRow>
          </div>
        </div>
      </div>

      <OricSectionHeader title="Funding & Budget" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <OricFieldRow label="Requested Budget">
          <input type="number" min="0" value={f.budgetAmount} onChange={(e) => set('budgetAmount', e.target.value)} placeholder="e.g. 4200000" className={ic} />
        </OricFieldRow>
        <OricFieldRow label="Currency">
          <select value={f.currency} onChange={(e) => set('currency', e.target.value)} className={ic}>
            <option>PKR</option>
            <option>USD</option>
            <option>EUR</option>
            <option>GBP</option>
          </select>
        </OricFieldRow>
        <OricFieldRow label="Funding Agency">
          <input value={f.fundingAgency} onChange={(e) => set('fundingAgency', e.target.value)} placeholder="e.g. HEC, PSDP" className={ic} />
        </OricFieldRow>
        <OricFieldRow label="Funder Type">
          <select value={f.funderType} onChange={(e) => set('funderType', e.target.value)} className={ic}>
            <option value="">Select…</option>
            <option>HEC</option>
            <option>PSF</option>
            <option>International</option>
            <option>Industry</option>
            <option>Government</option>
            <option>MNSUAM</option>
          </select>
        </OricFieldRow>
        <OricFieldRow label="Funder Location / Country">
          <input value={f.funderLocation} onChange={(e) => set('funderLocation', e.target.value)} className={ic} />
        </OricFieldRow>
      </div>

      <OricSectionHeader title="Sponsor / Industry Partner" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <OricFieldRow label="Sponsoring Agency">
          <input value={f.sponsoringAgency} onChange={(e) => set('sponsoringAgency', e.target.value)} placeholder="e.g. USDA, USAID" className={ic} />
        </OricFieldRow>
        <OricFieldRow label="Sponsor Country">
          <input value={f.sponsorCountry} onChange={(e) => set('sponsorCountry', e.target.value)} placeholder="e.g. USA" className={ic} />
        </OricFieldRow>
        <OricFieldRow label="Counterpart Name">
          <input value={f.counterpartName} onChange={(e) => set('counterpartName', e.target.value)} className={ic} />
        </OricFieldRow>
      </div>

      <OricSectionHeader title="Collaborators" />
      <OricFieldRow label="Collaborators / Co-Investigators">
        <AutoGrowTextarea value={f.collaborators} onChange={(e) => set('collaborators', e.target.value)} placeholder="One per line: Dr. Name, Institution" className={ic} />
      </OricFieldRow>

      <OricSectionHeader title="Post-Award Details" sub="Managed by ORIC after approval" />
      <OricAdminOnlyBanner />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-60 pointer-events-none">
        <OricFieldRow label="Award Letter Date"><input type="date" disabled className={ic} /></OricFieldRow>
        <OricFieldRow label="Funding Agency Ref No"><input disabled placeholder="e.g. HEC/R&D/2024/001" className={ic} /></OricFieldRow>
        <OricFieldRow label="ORIC Overhead Amount (PKR)"><input type="number" disabled placeholder="0.00" className={ic} /></OricFieldRow>
        <OricFieldRow label="Overhead Status"><input disabled value="Set by ORIC" readOnly className={ic} /></OricFieldRow>
        <OricFieldRow label="Project File No."><input disabled placeholder="Set by ORIC" className={ic} /></OricFieldRow>
        <OricFieldRow label="Special Conditions"><textarea rows={2} disabled className={`${ic} resize-none`} /></OricFieldRow>
        <OricFieldRow label="Remarks"><textarea rows={2} disabled className={`${ic} resize-none`} /></OricFieldRow>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button type="submit" disabled={busy} className="flex items-center gap-2 px-6 py-3 bg-[#2d6a4f] text-white rounded-xl text-sm font-bold hover:bg-[#235a40] disabled:opacity-50 transition-colors shadow-sm">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {busy ? 'Submitting…' : 'Submit to ORIC'}
        </button>
      </div>
    </form>
  );
}
