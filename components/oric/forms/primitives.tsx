'use client';

import React from 'react';

// ─── Shared ORIC form primitives ──────────────────────────────────────────────
// Extracted from app/faculty/edit/page.tsx to reduce its size and allow reuse.

export interface OricFormProps {
  inputCls: string;
  labelCls: string;
  setSuccess: (m: string) => void;
  setError: (m: string) => void;
}

export function OricFieldRow({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export function OricSectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4 pt-4 border-t border-gray-100 first:border-0 first:pt-0">
      <span className="w-1 h-5 bg-[#c9a961] rounded-full" />
      <div>
        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}

export function OricAdminOnlyBanner() {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700 mb-3">
      <span>Fields in this section are managed by ORIC after approval. They are read-only for faculty.</span>
    </div>
  );
}

export function OricSubmitButton({
  busy,
  label = 'Submit to ORIC',
}: {
  busy: boolean;
  label?: string;
}) {
  return (
    <div className="flex justify-end pt-4 border-t border-gray-100">
      <button
        type="submit"
        disabled={busy}
        className="flex items-center gap-2 px-6 py-3 bg-[#2d6a4f] text-white rounded-xl text-sm font-bold hover:bg-[#235a40] disabled:opacity-50 transition-colors shadow-sm"
      >
        {busy ? 'Submitting…' : label}
      </button>
    </div>
  );
}

export function OricFormError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
      {message}
    </div>
  );
}

// Shared canonical initial state for project forms (maps 1-to-1 with Prisma Project fields)
export const BLANK_PROJECT = {
  title: '',
  description: '',
  objectives: '',
  methodology: '',
  outcomes: '',
  deliverables: '',
  targetBeneficiaries: '',
  collaborators: '',
  projectType: '',
  thematicArea: '',
  projectCategory: '',
  funderType: '',
  funderLocation: '',
  financialYear: '',
  scope: 'NATIONAL',
  startDate: '',
  endDate: '',
  budgetAmount: '',
  currency: 'PKR',
  fundingAgency: '',
  sponsoringAgency: '',
  sponsorCountry: '',
  counterpartName: '',
};
