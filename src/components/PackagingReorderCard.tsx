import React from 'react';
import { Package, ExternalLink } from 'lucide-react';

interface PackagingReorderCardProps {
  productName: string;
}

export const PackagingReorderCard: React.FC<PackagingReorderCardProps> = () => {
  const handleOpenReorderLink = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    window.open('http://myflawsome.com/', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full">
      {/* Light pink card container taking user directly to http://myflawsome.com/ */}
      <div
        onClick={handleOpenReorderLink}
        className="cursor-pointer group p-4 rounded-3xl bg-[#fce7f3] border border-rose-200 text-rose-950 flex items-center justify-between shadow-md hover:shadow-lg transition-all hover:scale-[1.01]"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-rose-800">
            <Package className="w-3.5 h-3.5 text-rose-700" />
            <span>Product Refill Link</span>
          </div>
          <h4 className="text-sm font-bold text-rose-950 leading-snug">
            Running low on pads?
          </h4>
          <p className="text-xs text-rose-800/90 font-medium">
            Reorder your usual pack in one tap
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenReorderLink}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span>Reorder</span>
          <ExternalLink className="w-3.5 h-3.5 text-rose-100" />
        </button>
      </div>
    </div>
  );
};
