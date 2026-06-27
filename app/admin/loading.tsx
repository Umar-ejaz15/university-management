import { Loader2 } from 'lucide-react';

export default function AdminLoading() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <Loader2 className="w-8 h-8 animate-spin text-[#2d6a4f]" />
    </div>
  );
}
