import React, { useState } from 'react';
import { Droplet, Smile, Activity, Plus, Check, X } from 'lucide-react';
import { CrampSeverity, DailySymptomLog, FlowLevel, MoodType } from '../types';
import { SYMPTOM_OPTIONS } from '../data/cycleKnowledge';

interface SymptomTrackerProps {
  currentLog: DailySymptomLog;
  onUpdateLog: (log: DailySymptomLog) => void;
  dateLabel: string;
}

export const SymptomTracker: React.FC<SymptomTrackerProps> = ({ currentLog, onUpdateLog, dateLabel }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-zinc-200">How are you feeling today?</h3>
        <span className="text-xs text-rose-300 font-medium">{dateLabel}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Flow Pill */}
        <button
          onClick={() => setIsModalOpen(true)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 border transition-all ${
            hasFlow
              ? 'bg-rose-500/20 text-rose-200 border-rose-500/40 shadow-sm'
              : 'bg-[#1c1c20] hover:bg-[#27272a] text-zinc-300 border-[#27272a]'
          }`}
        >
          <Droplet className={`w-3.5 h-3.5 ${hasFlow ? 'text-rose-400 fill-rose-400/30' : 'text-zinc-400'}`} />
          <span>Flow: {currentLog.flow || 'None'}</span>
        </button>

        {/* Mood Pill */}
        <button
          onClick={() => setIsModalOpen(true)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 border transition-all ${
            hasMood
              ? 'bg-rose-500/20 text-rose-200 border-rose-500/40 shadow-sm'
              : 'bg-[#1c1c20] hover:bg-[#27272a] text-zinc-300 border-[#27272a]'
          }`}
        >
          <Smile className={`w-3.5 h-3.5 ${hasMood ? 'text-rose-400' : 'text-zinc-400'}`} />
          <span>Mood: {currentLog.mood ? currentLog.mood.replace('_', ' ') : 'Select'}</span>
        </button>

        {/* Cramps Pill (Highlighted in screenshot as active white/rose pill) */}
        <button
          onClick={() => setIsModalOpen(true)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all ${
            hasCramps
              ? 'bg-rose-100 text-rose-950 border-rose-200 shadow-md font-bold'
              : 'bg-[#1c1c20] hover:bg-[#27272a] text-zinc-300 border-[#27272a]'
          }`}
        >
          <Activity className={`w-3.5 h-3.5 ${hasCramps ? 'text-rose-600' : 'text-zinc-400'}`} />
          <span>Cramps{hasCramps ? `: ${currentLog.cramps}` : ''}</span>
        </button>

        {/* Additional symptoms count */}
        {currentLog.symptoms && currentLog.symptoms.length > 0 && (
          <span className="px-2.5 py-1 rounded-full text-[11px] bg-rose-500/10 text-rose-300 border border-rose-500/20">
            +{currentLog.symptoms.length} symptoms
          </span>
        )}

        {/* + More button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#1c1c20] hover:bg-[#27272a] text-zinc-300 border border-[#27272a] flex items-center gap-1 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-zinc-400" />
          More
        </button>
      </div>

      {/* Symptom Picker Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#161618] border border-[#27272a] rounded-t-2xl sm:rounded-2xl p-5 text-white max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Log Today's Symptoms</h3>
                <p className="text-xs text-zinc-400">{dateLabel}</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#27272a] flex items-center justify-center text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Flow Level */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Flow Intensity</label>
              <div className="grid grid-cols-5 gap-1.5">
                {(['none', 'spotting', 'light', 'medium', 'heavy'] as FlowLevel[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => handleFlowChange(f)}
                    className={`py-2 px-1 text-xs rounded-xl capitalize font-medium transition-all ${
                      currentLog.flow === f
                        ? 'bg-rose-500 text-white font-bold'
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
                    className={`py-2 px-1 text-xs rounded-xl capitalize font-medium transition-all ${
                      currentLog.cramps === c
                        ? 'bg-rose-500 text-white font-bold'
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
                    className={`py-2 px-2 text-xs rounded-xl capitalize font-medium transition-all ${
                      currentLog.mood === m
                        ? 'bg-rose-500 text-white font-bold'
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
                      className={`p-2.5 rounded-xl text-xs flex items-center justify-between border transition-all ${
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
              onClick={() => setIsModalOpen(false)}
              className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold transition-colors mt-4"
            >
              Save Log
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
