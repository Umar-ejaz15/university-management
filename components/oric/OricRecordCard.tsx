'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FieldDef {
  label: string;
  value?: string | number | null;
  highlight?: boolean; // larger/bolder
  mono?: boolean;
  full?: boolean; // span full width
}

interface Props {
  index: number;
  title: string;
  badges?: Array<{ text: string; cls: string }>;
  meta?: Array<{ icon?: React.ReactNode; text: string }>;
  fields?: FieldDef[];
  accentLeft?: string; // tailwind bg class for left border strip
  hidden?: boolean;
}

function Field({ label, value, highlight, mono, full }: FieldDef) {
  if (!value && value !== 0) return null;
  return (
    <div className={full ? 'col-span-full' : ''}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className={`leading-snug ${highlight ? 'text-base font-bold text-gray-900' : 'text-sm text-gray-800'} ${mono ? 'font-mono' : ''}`}>
        {value}
      </p>
    </div>
  );
}

export default function OricRecordCard({ index, title, badges = [], meta = [], fields = [], accentLeft, hidden }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (hidden) return null;

  const hasDetails = fields.length > 0;

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-shadow hover:shadow-md ${accentLeft ? 'border-l-4' : ''}`}
      style={accentLeft ? { borderLeftColor: accentLeft } : undefined}>

      {/* Summary row */}
      <div
        className={`px-5 py-4 flex items-start gap-4 ${hasDetails ? 'cursor-pointer select-none' : ''}`}
        onClick={hasDetails ? () => setExpanded(p => !p) : undefined}
      >
        {/* Index bubble */}
        <span className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
          {index}
        </span>

        <div className="flex-1 min-w-0">
          {/* Title + badges */}
          <div className="flex flex-wrap items-start gap-2 mb-1.5">
            <span className="text-sm font-bold text-gray-900 leading-snug">{title}</span>
            {badges.map((b, i) => (
              <span key={i} className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${b.cls}`}>{b.text}</span>
            ))}
          </div>
          {/* Meta row */}
          {meta.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-0.5">
              {meta.map((m, i) => (
                <span key={i} className="flex items-center gap-1 text-xs text-gray-500">
                  {m.icon && <span className="shrink-0 text-gray-400">{m.icon}</span>}
                  {m.text}
                </span>
              ))}
            </div>
          )}
        </div>

        {hasDetails && (
          <span className="shrink-0 mt-1 text-gray-400">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        )}
      </div>

      {/* Expanded detail panel */}
      {expanded && fields.length > 0 && (
        <div className="px-5 pb-5 pt-2 bg-gray-50/70 border-t border-gray-100">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {fields.map((f, i) => <Field key={i} {...f} />)}
          </div>
        </div>
      )}
    </div>
  );
}
