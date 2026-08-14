import React, { useState } from 'react';
import {
  ShieldCheck,
  Calendar,
  Clock,
  Droplet,
  HeartPulse,
  Sparkles,
  ChevronRight,
  History,
  Layers,
  CalendarCheck2,
} from 'lucide-react';
import { UserProfile, CycleScanEntry } from '../types';
import { formatDateHuman } from '../utils/cycleCalculations';

interface ConnectedProfileHistoryCardProps {
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onRetakeScan: () => void;
  onOpenLogin?: () => void;
}

export const ConnectedProfileHistoryCard: React.FC<ConnectedProfileHistoryCardProps> = ({
  profile,
  onRetakeScan,
}) => {
  // Normalize entries: build list of scan history
  const historyEntries: CycleScanEntry[] = React.useMemo(() => {
    if (profile.scanHistory && profile.scanHistory.length > 0) {
      return profile.scanHistory;
    }
    // Fallback: create entry from current profile
    const defaultDate = profile.lastCompletedOnboardingDate || new Date().toISOString().split('T')[0];
    return [
      {
        id: `scan-${defaultDate}`,
        date: defaultDate,
        timestamp: new Date().toISOString(),
        age: profile.age,
        periodDates: profile.last3Periods || [],
        cycleLength: profile.cycleLength || 28,
        periodDuration: profile.periodDuration || 5,
        flowIntensity: profile.flowIntensity,
        crampIntensity: profile.crampIntensity,
        symptoms: profile.symptoms || [],
        selectedProduct: profile.selectedProduct,
      },
    ];
  }, [profile]);

  const [selectedEntryIndex, setSelectedEntryIndex] = useState<number>(0);

  // Clamp index if needed
  const activeIndex = Math.min(selectedEntryIndex, Math.max(0, historyEntries.length - 1));
  const activeEntry: CycleScanEntry = historyEntries[activeIndex] || historyEntries[0];

  const activePeriodDates = activeEntry?.periodDates || [];

  return (
    <div className="rounded-3xl bg-[#161618] border border-[#27272a] shadow-xl p-5 sm:p-6 text-white space-y-5 transition-all">
      {/* Header bar: Google Account info & Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#27272a]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center shrink-0 shadow-md">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-rose-400">
                Your Saved Profile & History
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Google Synced
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-medium mt-0.5">
              {profile.email || 'Connected Google User'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-400">
          <Layers className="w-3.5 h-3.5 text-rose-400" />
          <span className="font-semibold text-zinc-300">{historyEntries.length} {historyEntries.length === 1 ? 'Scan Logged' : 'Scans Logged'}</span>
        </div>
      </div>

      {/* 1. Select Entry to Inspect Previous Details */}
      <div className="space-y-2.5 pt-0.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-zinc-300 flex items-center gap-2">
            <History className="w-3.5 h-3.5 text-rose-400" />
            <span>Select Entry to Inspect Previous Details</span>
          </span>
          <span className="text-[11px] text-zinc-400">
            Click an entry below to view
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {historyEntries.map((entry, idx) => {
            const isSelected = idx === activeIndex;
            const isLatest = idx === 0;
            return (
              <button
                key={entry.id || entry.date || idx}
                type="button"
                onClick={() => setSelectedEntryIndex(idx)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 cursor-pointer border ${
                  isSelected
                    ? 'bg-rose-500/20 border-rose-500 text-white shadow-md shadow-rose-950/40 ring-1 ring-rose-500/40'
                    : 'bg-zinc-900/60 border-zinc-800/70 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                <CalendarCheck2 className={`w-3.5 h-3.5 ${isSelected ? 'text-rose-400' : 'text-zinc-500'}`} />
                <div className="flex items-center gap-2">
                  <span>{formatDateHuman(entry.date)}</span>
                  {isLatest && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-rose-500 text-white font-extrabold leading-none">
                      Latest
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Dynamic Details for Selected Entry */}
      <div
        key={activeEntry.id || activeEntry.date || activeIndex}
        className="space-y-3.5 pt-0.5 animate-in fade-in duration-300"
      >
        {/* Historical Recorded Period Dates for Selected Entry */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-zinc-300 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-rose-400" />
              <span>Period Start Dates Recorded in {formatDateHuman(activeEntry.date)} Scan</span>
            </span>
            <span className="text-[11px] text-zinc-400 font-medium">
              {activePeriodDates.length} periods tracked
            </span>
          </div>

          {activePeriodDates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {activePeriodDates.map((dateStr, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/70 hover:border-zinc-700/60 transition-all min-h-[54px]"
                >
                  <span className="w-6 h-6 rounded-xl bg-rose-500/15 text-rose-300 font-bold text-xs flex items-center justify-center border border-rose-500/25 shrink-0">
                    {idx + 1}
                  </span>
                  <div className="truncate min-w-0">
                    <span className="text-[10px] text-zinc-400 font-semibold block leading-tight">
                      {idx === 0 ? 'Most Recent' : idx === 1 ? 'Previous' : '2 Cycles Ago'}
                    </span>
                    <span className="text-xs font-bold text-white truncate block mt-0.5">
                      {formatDateHuman(dateStr)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/70 text-xs text-zinc-400 text-center">
              No previous periods recorded for this entry.
            </div>
          )}
        </div>

        {/* Cycle Parameters Grid for Selected Entry */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/70 hover:border-zinc-700/60 min-h-[54px] space-y-1 transition-all">
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 uppercase font-semibold">
              <Clock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>Cycle Length</span>
            </div>
            <p className="text-sm font-black text-white">{activeEntry.cycleLength || 28} Days</p>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/70 hover:border-zinc-700/60 min-h-[54px] space-y-1 transition-all">
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 uppercase font-semibold">
              <Droplet className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>Bleed Duration</span>
            </div>
            <p className="text-sm font-black text-white">{activeEntry.periodDuration || 5} Days</p>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/70 hover:border-zinc-700/60 min-h-[54px] space-y-1 transition-all">
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 uppercase font-semibold">
              <HeartPulse className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>Flow & Cramp</span>
            </div>
            <p className="text-xs font-bold text-white capitalize truncate">
              {activeEntry.flowIntensity || 'Normal'} / {activeEntry.crampIntensity || 'Mild'}
            </p>
          </div>
        </div>

        {/* Recorded Symptoms Pills for Selected Entry */}
        {activeEntry.symptoms && activeEntry.symptoms.length > 0 && (
          <div className="space-y-1.5 pt-0.5">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
              Symptoms Logged in this Entry:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {activeEntry.symptoms.map((sym) => (
                <span
                  key={sym}
                  className="px-2.5 py-1 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] font-semibold capitalize"
                >
                  {sym.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar: Action button */}
      <div className="pt-3 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-[#27272a]">
        <span className="text-xs text-zinc-400 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>
            Viewing {activeIndex === 0 ? 'Latest Scan' : `Entry #${historyEntries.length - activeIndex}`} ({formatDateHuman(activeEntry.date)})
          </span>
        </span>

        <button
          type="button"
          onClick={onRetakeScan}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-500/20 transition-all active:scale-95"
        >
          <span>Retake 8-Step Scan</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
