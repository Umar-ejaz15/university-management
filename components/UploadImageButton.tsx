'use client';

import { UploadButton } from '@/lib/uploadthing-client';
import type { OurFileRouter } from '@/lib/uploadthing';
import { Upload, X, ImageIcon } from 'lucide-react';

interface Props {
  endpoint: keyof OurFileRouter;
  currentUrl?: string | null;
  onUpload: (url: string) => void;
  onRemove?: () => void;
  label?: string;
  hint?: string;
}

export default function UploadImageButton({
  endpoint,
  currentUrl,
  onUpload,
  onRemove,
  label = 'Upload Image',
  hint,
}: Props) {
  if (currentUrl) {
    return (
      <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl bg-gray-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={currentUrl} alt="preview" className="w-14 h-14 rounded-lg object-cover border border-gray-200 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-700 mb-1">Image uploaded</p>
          <p className="text-xs text-gray-400 truncate">{currentUrl.split('/').pop()}</p>
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Remove
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-3 p-3 border-2 border-dashed border-gray-200 rounded-xl hover:border-[#2d6a4f]/40 transition-colors bg-gray-50/50">
        <div className="w-10 h-10 rounded-lg bg-[#2d6a4f]/10 flex items-center justify-center shrink-0">
          <ImageIcon className="w-5 h-5 text-[#2d6a4f]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-700">{label}</p>
          {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
        </div>
        {/* UploadThing button — styled to blend in */}
        <div className="shrink-0 [&>div]:flex [&>div]:items-center [&>div]:gap-0">
          <UploadButton
            endpoint={endpoint}
            onClientUploadComplete={(res) => {
              const url = res?.[0]?.ufsUrl ?? res?.[0]?.url;
              if (url) onUpload(url);
            }}
            onUploadError={(err) => alert(`Upload failed: ${err.message}`)}
            appearance={{
              container: 'flex-row items-center gap-0 w-auto',
              button:
                'ut-ready:bg-[#2d6a4f] ut-uploading:bg-[#2d6a4f]/70 rounded-xl px-4 py-2 text-xs font-semibold text-white hover:bg-[#235a40] transition-colors shadow-sm w-auto after:bg-[#40916c]',
              allowedContent: 'hidden',
            }}
            content={{
              button({ ready, isUploading }) {
                if (isUploading) return <span className="flex items-center gap-1.5"><Upload className="w-3.5 h-3.5 animate-bounce" />Uploading…</span>;
                return ready ? <span className="flex items-center gap-1.5"><Upload className="w-3.5 h-3.5" />Choose file</span> : 'Loading…';
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
