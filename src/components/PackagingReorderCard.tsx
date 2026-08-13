import React, { useState } from 'react';
import { Package, CheckCircle2, ShoppingBag, X } from 'lucide-react';

interface PackagingReorderCardProps {
  productName: string;
}

export const PackagingReorderCard: React.FC<PackagingReorderCardProps> = ({ productName }) => {
  const [isOrdered, setIsOrdered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleReorder = () => {
    setIsOrdered(true);
    setTimeout(() => {
      setIsModalOpen(false);
    }, 1800);
  };

  return (
    <div className="px-4 py-2">
      {/* Light pink card container directly matching the screenshot */}
      <div 
        onClick={() => setIsModalOpen(true)}
        className="cursor-pointer group p-4 rounded-2xl bg-[#fce7f3] border border-rose-200 text-rose-950 flex items-center justify-between shadow-sm hover:shadow-md transition-all hover:scale-[1.01]"
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

        <button className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1">
          <span>Reorder</span>
        </button>
      </div>

      {/* Reorder Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#161618] border border-[#27272a] rounded-2xl p-5 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-white text-base">QR Packaging Refill</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#27272a] flex items-center justify-center text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isOrdered ? (
              <div className="py-6 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-lg font-bold text-white">Order Confirmed!</h4>
                <p className="text-xs text-zinc-300">
                  Your regular pack ({productName}) will be delivered in 1-2 days to your saved address.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-[#27272a] border border-[#3f3f46]">
                  <p className="text-xs text-zinc-400 font-medium">Saved Packaging Product:</p>
                  <p className="text-sm font-bold text-rose-300 mt-1">{productName}</p>
                  <p className="text-xs text-zinc-400 mt-2">Free express delivery • Easy 1-tap reorder</p>
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-300 pt-2 border-t border-[#27272a]">
                  <span>Total Amount</span>
                  <span className="font-bold text-white text-sm">$8.99</span>
                </div>

                <button
                  onClick={handleReorder}
                  className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-rose-500/20"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Confirm 1-Tap Reorder
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
