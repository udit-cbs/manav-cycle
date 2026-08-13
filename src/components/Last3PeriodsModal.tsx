import React, { useState } from 'react';
import { Calendar, Save, Trash2, X, RefreshCw } from 'lucide-react';
import { UserProfile } from '../types';
import { calculateAverageCycleLength, formatDateHuman } from '../utils/cycleCalculations';
import { WallCalendarPicker } from './WallCalendarPicker';

interface Last3PeriodsModalProps {
  profile: UserProfile;
  onSave: (updated: UserProfile) => void;
  onClose: () => void;
  onReopenOnboarding: () => void;
}

export const Last3PeriodsModal: React.FC<Last3PeriodsModalProps> = ({
  profile,
  onSave,
  onClose,
  onReopenOnboarding,
}) => {
  const [age, setAge] = useState<number>(profile.age || 24);
  const [last3Periods, setLast3Periods] = useState<string[]>(
    profile.last3Periods && profile.last3Periods.length > 0
      ? [...profile.last3Periods]
      : [new Date().toISOString().split('T')[0]]
  );
  const [cycleLength, setCycleLength] = useState<number>(profile.cycleLength || 28);
  const [periodDuration, setPeriodDuration] = useState<number>(profile.periodDuration || 5);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handlePeriodDateChange = (index: number, val: string) => {
    const updated = [...last3Periods];
    updated[index] = val;
    setLast3Periods(updated);

    // Auto update cycle length if 2 or more dates
    const computed = calculateAverageCycleLength(updated.filter(Boolean));
    if (computed >= 18 && computed <= 45) {
      setCycleLength(computed);
    }
  };

  const handleAddPeriodDate = () => {
    if (last3Periods.length < 3) {
      setLast3Periods([...last3Periods, new Date().toISOString().split('T')[0]]);
    }
  };

  const handleRemovePeriodDate = (index: number) => {
    const updated = last3Periods.filter((_, i) => i !== index);
    setLast3Periods(updated);
  };

  const handleSave = () => {
    onSave({
      ...profile,
      age: Number(age) || 24,
      last3Periods,
      cycleLength: Number(cycleLength) || 28,
      periodDuration: Number(periodDuration) || 5,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#161618] border border-[#27272a] rounded-2xl p-6 text-white space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-rose-400" />
            <h3 className="font-bold text-white text-base">Cycle Parameters & Input History</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#27272a] flex items-center justify-center text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Age Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Age
            </label>
            <input
              type="number"
              min={10}
              max={65}
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full p-3 rounded-xl bg-[#121214] border border-[#3f3f46] text-white text-sm"
            />
          </div>

          {/* Last 3 Periods List */}
          <div className="space-y-2 p-3.5 rounded-xl bg-[#121214] border border-[#27272a]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-300">
                Track Last 3 Periods (Calendar Inputs)
              </span>
              {last3Periods.length < 3 && (
                <button
                  onClick={handleAddPeriodDate}
                  className="text-xs font-semibold text-rose-400 hover:text-rose-300"
                >
                  + Add Date
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {last3Periods.map((dateStr, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 w-16 font-medium">
                    #{idx + 1} Start:
                  </span>
                  <input
                    type="date"
                    value={dateStr}
                    onChange={(e) => handlePeriodDateChange(idx, e.target.value)}
                    className="flex-1 p-2 rounded-xl bg-[#1c1c20] border border-[#3f3f46] focus:border-[#FF0000] text-white font-bold text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setEditingIndex(idx)}
                    className="p-2.5 rounded-xl bg-[#1c1c20] border border-[#3f3f46] hover:border-[#FF0000] text-[#FF0000] font-bold text-xs flex items-center justify-center cursor-pointer"
                    title="Open Wall Calendar"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                  {last3Periods.length > 1 && (
                    <button
                      onClick={() => handleRemovePeriodDate(idx)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <p className="text-[11px] text-zinc-400 mt-2">
              Auto-calculated Cycle Length: <strong className="text-white">{calculateAverageCycleLength(last3Periods)} days</strong>
            </p>
          </div>

          {/* Cycle Length & Period Duration Manual Controls */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400">Cycle Length (Days)</label>
              <input
                type="number"
                min={20}
                max={45}
                value={cycleLength}
                onChange={(e) => setCycleLength(Number(e.target.value))}
                className="w-full p-3 rounded-xl bg-[#121214] border border-[#3f3f46] text-white text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400">Period Duration</label>
              <input
                type="number"
                min={2}
                max={10}
                value={periodDuration}
                onChange={(e) => setPeriodDuration(Number(e.target.value))}
                className="w-full p-3 rounded-xl bg-[#121214] border border-[#3f3f46] text-white text-sm"
              />
            </div>
          </div>

          {/* Trigger Onboarding Wizard Again */}
          <button
            onClick={() => {
              onClose();
              onReopenOnboarding();
            }}
            className="w-full py-2.5 rounded-xl bg-[#27272a] hover:bg-[#3f3f46] text-zinc-300 text-xs font-semibold flex items-center justify-center gap-2 border border-[#3f3f46]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Re-run "First Scan" Setup Wizard
          </button>
        </div>

        <div className="pt-3 border-t border-[#27272a] flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-[#27272a] text-zinc-300 text-xs font-semibold hover:bg-[#3f3f46]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="py-2.5 px-5 rounded-xl bg-[#FF0000] hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-red-900/30"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>

      {/* Wall Calendar Modal Popup */}
      {editingIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#18181b] p-5 rounded-[32px] max-w-sm w-full space-y-3 border border-zinc-700 shadow-2xl">
            <div className="flex items-center justify-between px-2">
              <h4 className="font-extrabold text-white text-sm">Select Date on Wall Calendar</h4>
              <button
                onClick={() => setEditingIndex(null)}
                className="p-1 rounded-full bg-[#27272a] text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <WallCalendarPicker
              selectedDate={last3Periods[editingIndex] || ''}
              onSelectDate={(d) => {
                handlePeriodDateChange(editingIndex, d);
                setEditingIndex(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
