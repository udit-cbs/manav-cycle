import React, { useState } from 'react';
import { Droplet, Smile, Activity, Plus, Check, X, Eye, Edit3 } from 'lucide-react';
import { CrampSeverity, DailySymptomLog, FlowLevel, MoodType } from '../types';
import { SYMPTOM_OPTIONS } from '../data/cycleKnowledge';

interface SymptomTrackerProps {
  currentLog: DailySymptomLog;
  onUpdateLog: (log: DailySymptomLog) => void;
  dateLabel: string;
}

export const SymptomTracker: React.FC<SymptomTrackerProps> = ({ currentLog, onUpdateLog, dateLabel }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');

  const hasFlow = currentLog.flow && currentLog.flow !== 'none';
  const hasCramps = currentLog.cramps && currentLog.cramps !== 'none';
  const hasMood = Boolean(currentLog.mood);

  const handleFlowChange = (flow: FlowLevel) => {
    onUpdateLog({ ...currentLog, flow });
  };

  const handleCrampsChange = (cramps: CrampSeverity) => {
    onUpdateLog({ ...currentLog, cramps });
  };

  const handleMoodChange = (mood: MoodType) => {
    onUpdateLog({ ...currentLog, mood });
  };

  const toggleSymptom = (symId: string) => {
    const list = currentLog.symptoms || [];
    const exists = list.includes(symId);
    const updated = exists ? list.filter((s) => s !== symId) : [...list, symId];
    onUpdateLog({ ...currentLog, symptoms: updated });
  };

  const openModal = (mode: 'view' | 'edit' = 'view') => {
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const getSymptomLabel = (id: string) => {
    const found = SYMPTOM_OPTIONS.find((s) => s.id === id);
    return found ? { label: found.label, icon: found.icon } : { label: id, icon: '✨' };
  };

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-zinc-200">How are you feeling today?</h3>
        <button
          type="button"
          onClick={() => openModal('view')}
          className="text-xs text-rose-300 hover:text-rose-200 font-medium flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{dateLabel}</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Flow Pill */}
        <button
          onClick={() => openModal('view')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 border transition-all cursor-pointer ${
            hasFlow
              ? 'bg-rose-500/20 text-rose-200 border-rose-500/40 shadow-sm'
              : 'bg-[#1c1c20] hover:bg-[#27272a] text-zinc-300 border-[#27272a]'
          }`}
          title="Click to view entered details"
        >
          <Droplet className={`w-3.5 h-3.5 ${hasFlow ? 'text-rose-400 fill-rose-400/30' : 'text-zinc-400'}`} />
          <span className="capitalize">Flow: {currentLog.flow || 'None'}</span>
        </button>

        {/* Mood Pill */}
        <button
          onClick={() => openModal('view')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 border transition-all cursor-pointer ${
            hasMood
              ? 'bg-rose-500/20 text-rose-200 border-rose-500/40 shadow-sm'
              : 'bg-[#1c1c20] hover:bg-[#27272a] text-zinc-300 border-[#27272a]'
          }`}
          title="Click to view entered details"
        >
          <Smile className={`w-3.5 h-3.5 ${hasMood ? 'text-rose-400' : 'text-zinc-400'}`} />
          <span className="capitalize">Mood: {currentLog.mood ? currentLog.mood.replace('_', ' ') : 'Calm'}</span>
        </button>

        {/* Cramps Pill */}
        <button
          onClick={() => openModal('view')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
            hasCramps
              ? 'bg-rose-500/20 text-rose-200 border-rose-500/40 shadow-sm'
              : 'bg-[#1c1c20] hover:bg-[#27272a] text-zinc-300 border-[#27272a]'
          }`}
          title="Click to view entered details"
        >
          <Activity className={`w-3.5 h-3.5 ${hasCramps ? 'text-rose-400' : 'text-zinc-400'}`} />
          <span className="capitalize">Cramps: {currentLog.cramps || 'None'}</span>
        </button>

        {/* Additional symptoms count */}
        {currentLog.symptoms && currentLog.symptoms.length > 0 && (
          <button
            onClick={() => openModal('view')}
            className="px-2.5 py-1 rounded-full text-[11px] bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-medium cursor-pointer transition-all"
          >
            +{currentLog.symptoms.length} symptoms
          </button>
        )}

        {/* View / Details button */}
        <button
          onClick={() => openModal('view')}
          className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#1c1c20] hover:bg-[#27272a] text-zinc-300 hover:text-white border border-[#27272a] flex items-center gap-1 transition-colors cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 text-zinc-400" />
          <span>View Details</span>
        </button>
      </div>

      {/* Details & Inspection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#18181b] border border-zinc-700 rounded-t-3xl sm:rounded-3xl p-6 text-white max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl">
            {/* Modal Header with View / Edit Mode Toggle */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  {modalMode === 'view' ? (
                    <>
                      <Eye className="w-4 h-4 text-rose-400" />
                      <span>Entered Log Details</span>
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-4 h-4 text-rose-400" />
                      <span>Edit Today's Log</span>
                    </>
                  )}
                </h3>
                <p className="text-xs text-zinc-400">{dateLabel}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModalMode(modalMode === 'view' ? 'edit' : 'view')}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#27272a] hover:bg-[#3f3f46] text-zinc-200 border border-zinc-700 flex items-center gap-1 cursor-pointer transition-all"
                >
                  {modalMode === 'view' ? (
                    <>
                      <Edit3 className="w-3 h-3 text-rose-400" />
                      <span>Edit</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3 h-3 text-rose-400" />
                      <span>View</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#27272a] flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* READ-ONLY VIEW MODE (Safe from accidental edits) */}
            {modalMode === 'view' ? (
              <div className="space-y-4 animate-in fade-in">
                {/* Flow Intensity Card */}
                <div className="p-4 rounded-2xl bg-[#27272a]/60 border border-zinc-700/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Droplet className="w-4 h-4 text-rose-400" />
                      Flow Intensity
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {currentLog.flow || 'None'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 pt-1">
                    {currentLog.flow === 'heavy'
                      ? 'Heavy flow logged (requires high absorbency protection).'
                      : currentLog.flow === 'medium'
                      ? 'Medium / regular flow logged.'
                      : currentLog.flow === 'light'
                      ? 'Light steady flow logged.'
                      : currentLog.flow === 'spotting'
                      ? 'Minimal spotting or pantyliner protection.'
                      : 'No active period flow logged for this date.'}
                  </p>
                </div>

                {/* Cramp Severity Card */}
                <div className="p-4 rounded-2xl bg-[#27272a]/60 border border-zinc-700/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-rose-400" />
                      Cramp Intensity
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {currentLog.cramps || 'None'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 pt-1">
                    {currentLog.cramps === 'severe'
                      ? 'Severe cramps logged. Rest, hydration, and warmth recommended.'
                      : currentLog.cramps === 'moderate'
                      ? 'Moderate cramps logged. Heat compress or herbal tea advised.'
                      : currentLog.cramps === 'mild'
                      ? 'Mild pelvic aches logged.'
                      : 'Pain-free / no cramps logged for this date.'}
                  </p>
                </div>

                {/* Mood Card */}
                <div className="p-4 rounded-2xl bg-[#27272a]/60 border border-zinc-700/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Smile className="w-4 h-4 text-rose-400" />
                      Logged Mood
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold capitalize bg-zinc-800 text-zinc-200 border border-zinc-700">
                      {currentLog.mood ? currentLog.mood.replace('_', ' ') : 'Calm'}
                    </span>
                  </div>
                </div>

                {/* Selected Symptoms Card */}
                <div className="p-4 rounded-2xl bg-[#27272a]/60 border border-zinc-700/60 space-y-2.5">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                    Logged Symptoms ({currentLog.symptoms?.length || 0})
                  </span>
                  {currentLog.symptoms && currentLog.symptoms.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {currentLog.symptoms.map((symId) => {
                        const { label, icon } = getSymptomLabel(symId);
                        return (
                          <span
                            key={symId}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/15 border border-rose-500/30 text-rose-200 flex items-center gap-1.5"
                          >
                            <span>{icon}</span>
                            <span>{label}</span>
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-400 italic">No extra symptoms recorded for this date.</p>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setModalMode('edit')}
                    className="flex-1 py-3 rounded-xl bg-[#27272a] hover:bg-[#3f3f46] text-zinc-200 font-bold text-xs border border-zinc-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4 text-rose-400" />
                    <span>Edit Entry</span>
                  </button>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-rose-500/25 transition-all cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* EDIT MODE (Explicitly selected by user) */
              <div className="space-y-5 animate-in fade-in">
                {/* Flow Level */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Flow Intensity</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {(['none', 'spotting', 'light', 'medium', 'heavy'] as FlowLevel[]).map((f) => (
                      <button
                        key={f}
                        onClick={() => handleFlowChange(f)}
                        className={`py-2 px-1 text-xs rounded-xl capitalize font-medium transition-all cursor-pointer ${
                          currentLog.flow === f
                            ? 'bg-rose-500 text-white font-bold shadow'
                            : 'bg-[#27272a] text-zinc-300 hover:bg-[#3f3f46]'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cramp Severity */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Cramps Severity</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['none', 'mild', 'moderate', 'severe'] as CrampSeverity[]).map((c) => (
                      <button
                        key={c}
                        onClick={() => handleCrampsChange(c)}
                        className={`py-2 px-1 text-xs rounded-xl capitalize font-medium transition-all cursor-pointer ${
                          currentLog.cramps === c
                            ? 'bg-rose-500 text-white font-bold shadow'
                            : 'bg-[#27272a] text-zinc-300 hover:bg-[#3f3f46]'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mood Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Primary Mood</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['calm', 'happy', 'anxious', 'irritable', 'fatigued', 'emotional'] as MoodType[]).map((m) => (
                      <button
                        key={m}
                        onClick={() => handleMoodChange(m)}
                        className={`py-2 px-2 text-xs rounded-xl capitalize font-medium transition-all cursor-pointer ${
                          currentLog.mood === m
                            ? 'bg-rose-500 text-white font-bold shadow'
                            : 'bg-[#27272a] text-zinc-300 hover:bg-[#3f3f46]'
                        }`}
                      >
                        {m.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Additional Symptom Pills */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Other Symptoms</label>
                  <div className="grid grid-cols-2 gap-2">
                    {SYMPTOM_OPTIONS.map((opt) => {
                      const active = currentLog.symptoms?.includes(opt.id);
                      return (
                        <button
                          key={opt.id}
                          onClick={() => toggleSymptom(opt.id)}
                          className={`p-2.5 rounded-xl text-xs flex items-center justify-between border transition-all cursor-pointer ${
                            active
                              ? 'bg-rose-500/20 border-rose-500/40 text-rose-200 font-medium'
                              : 'bg-[#27272a] border-transparent text-zinc-300 hover:bg-[#3f3f46]'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <span>{opt.icon}</span>
                            <span>{opt.label}</span>
                          </span>
                          {active && <Check className="w-3.5 h-3.5 text-rose-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => setModalMode('view')}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-rose-500/25 transition-all cursor-pointer mt-4"
                >
                  Save & View Summary
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
