import React, { useState } from 'react';
import { Calendar, Check, ChevronRight, Sparkles, X, Mail } from 'lucide-react';
import { UserProfile } from '../types';
import { calculateAverageCycleLength, formatDateHuman, formatDateYYYYMMDD } from '../utils/cycleCalculations';
import { SYMPTOM_OPTIONS } from '../data/cycleKnowledge';
import { WallCalendarPicker } from './WallCalendarPicker';

interface OnboardingWizardProps {
  profile: UserProfile;
  onSaveProfile: (updatedProfile: UserProfile) => void;
  onClose?: () => void;
  onOpenLogin?: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  profile,
  onSaveProfile,
  onClose,
  onOpenLogin,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [activeCalendarTarget, setActiveCalendarTarget] = useState<'p1' | 'p2' | 'p3' | null>(null);

  // Form State
  const [lastPeriodOption, setLastPeriodOption] = useState<'today' | 'yesterday' | 'custom' | 'unsure'>('custom');
  const [customStartDate, setCustomStartDate] = useState<string>(
    profile.last3Periods?.[0] || formatDateYYYYMMDD(new Date(Date.now() - 13 * 86400000))
  );

  const [periodDate2, setPeriodDate2] = useState<string>(
    profile.last3Periods?.[1] || ''
  );
  const [periodDate3, setPeriodDate3] = useState<string>(
    profile.last3Periods?.[2] || ''
  );

  const [age, setAge] = useState<number>(profile.age || 24);
  const [cycleLength, setCycleLength] = useState<number>(profile.cycleLength || 28);
  const [periodDuration, setPeriodDuration] = useState<number>(profile.periodDuration || 5);

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['cramps', 'mood']);

  // Handle step 1 date quick pickers
  const handleQuickDateSelect = (option: 'today' | 'yesterday' | 'custom' | 'unsure') => {
    setLastPeriodOption(option);
    if (option === 'today') {
      setCustomStartDate(formatDateYYYYMMDD(new Date()));
    } else if (option === 'yesterday') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      setCustomStartDate(formatDateYYYYMMDD(y));
    } else if (option === 'unsure') {
      // Default to 14 days ago
      const d = new Date();
      d.setDate(d.getDate() - 14);
      setCustomStartDate(formatDateYYYYMMDD(d));
    }
  };

  const handleFinish = () => {
    const periodDates = [customStartDate, periodDate2, periodDate3].filter(Boolean);
    const updated: UserProfile = {
      ...profile,
      age: Number(age) || 24,
      last3Periods: periodDates,
      cycleLength: Number(cycleLength) || 28,
      periodDuration: Number(periodDuration) || 5,
      completedOnboarding: true,
    };
    onSaveProfile(updated);
    if (onClose) onClose();
  };

  const toggleSymptom = (id: string) => {
    if (selectedSymptoms.includes(id)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== id));
    } else {
      setSelectedSymptoms([...selectedSymptoms, id]);
    }
  };

  return (
    <>
    <div className="w-full max-w-md bg-[#18181b]/90 border border-zinc-800 backdrop-blur-xl rounded-[32px] p-6 text-white space-y-5 shadow-2xl animate-in fade-in">
      {/* Top Header & Progress Indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
          <span>First scan, step {step} of 6</span>
          {onClose && (
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-1 rounded-lg bg-[#27272a] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-[#27272a] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#FF0000] transition-all duration-300"
            style={{ width: `${(step / 6) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* STEP 1: LAST PERIOD START DATE */}
      {step === 1 && (
        <div className="space-y-5">
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold tracking-tight text-white">
              When did your last period start?
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              That is all we need to get going. No sign up, no app download.
            </p>
          </div>

          <div className="space-y-3">
            {/* Quick Option: Today, Yesterday, Not Sure */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDateSelect('today')}
                className={`p-3 rounded-xl text-center text-xs font-bold border transition-all cursor-pointer ${
                  lastPeriodOption === 'today'
                    ? 'bg-[#FF0000] border-[#FF0000] text-white shadow-md'
                    : 'bg-[#27272a] hover:bg-[#3f3f46] border-zinc-700 text-zinc-200'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => handleQuickDateSelect('yesterday')}
                className={`p-3 rounded-xl text-center text-xs font-bold border transition-all cursor-pointer ${
                  lastPeriodOption === 'yesterday'
                    ? 'bg-[#FF0000] border-[#FF0000] text-white shadow-md'
                    : 'bg-[#27272a] hover:bg-[#3f3f46] border-zinc-700 text-zinc-200'
                }`}
              >
                Yesterday
              </button>
              <button
                type="button"
                onClick={() => handleQuickDateSelect('unsure')}
                className={`p-3 rounded-xl text-center text-xs font-bold border transition-all cursor-pointer ${
                  lastPeriodOption === 'unsure'
                    ? 'bg-[#FF0000] border-[#FF0000] text-white shadow-md'
                    : 'bg-[#27272a] hover:bg-[#3f3f46] border-zinc-700 text-zinc-200'
                }`}
              >
                Not sure
              </button>
            </div>

            {/* Embedded Wall Calendar Picker for Custom Date */}
            <div className="pt-2">
              <div className="mb-2 flex items-center justify-between text-xs font-bold text-zinc-300">
                <span>Pick Date on Wall Calendar:</span>
                <span className="text-[#FF0000] font-black">{formatDateHuman(customStartDate)}</span>
              </div>
              <WallCalendarPicker
                selectedDate={customStartDate}
                onSelectDate={(d) => {
                  setCustomStartDate(d);
                  setLastPeriodOption('custom');
                }}
              />
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full py-3.5 rounded-xl bg-[#FF0000] hover:bg-red-700 text-white font-black text-sm shadow-lg shadow-red-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Next: Your Age</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <p className="text-[11px] text-zinc-400 text-center font-medium">
            Saved on your device. Nothing shared unless you create an account.
          </p>
        </div>
      )}

      {/* STEP 2: YOUR AGE */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold tracking-tight text-white">
              How old are you?
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Your age helps personalize cycle calculations and hormonal phase predictions.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                YOUR AGE
              </label>
              <input
                type="number"
                min={10}
                max={65}
                value={age || ''}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full p-3.5 rounded-2xl bg-[#27272a] border border-zinc-700 text-white font-bold text-lg focus:outline-none focus:border-[#FF0000]"
                placeholder="e.g. 24"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] text-zinc-400 font-semibold">Quick Select Age:</span>
              <div className="grid grid-cols-6 gap-1.5">
                {[18, 21, 24, 28, 32, 36].map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAge(a)}
                    className={`py-2 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                      age === a
                        ? 'bg-[#FF0000] border-[#FF0000] text-white shadow'
                        : 'bg-[#27272a] border-zinc-700 text-zinc-300 hover:bg-[#3f3f46]'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => setStep(1)}
              className="py-3 px-4 rounded-xl bg-[#27272a] text-zinc-300 font-semibold text-xs hover:bg-[#3f3f46] cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex-1 py-3.5 rounded-xl bg-[#FF0000] hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Next: Period History</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: LAST 3 PERIOD START DATES */}
      {step === 3 && (
        <div className="space-y-5">
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold tracking-tight text-white">
              Last 3 Period Start Dates
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Track up to your last 3 periods for accurate predictions. Each field is optional.
            </p>
          </div>

          <div className="space-y-3.5 p-4 rounded-2xl bg-[#27272a] border border-zinc-700">
            {/* 1st Date */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] text-zinc-300 font-semibold flex items-center gap-1">
                  <span>Most Recent Period</span>
                  <span className="text-zinc-500 text-[10px]">(Optional)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setCustomStartDate(customStartDate ? '' : formatDateYYYYMMDD(new Date()))}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-rose-300 font-bold border border-zinc-700 cursor-pointer transition-all"
                >
                  {customStartDate ? "Clear / No data" : "+ Add Date"}
                </button>
              </div>
              {customStartDate ? (
                <div className="flex gap-2 items-center">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="flex-1 p-2.5 rounded-xl bg-[#18181b] border border-zinc-600 focus:border-[#FF0000] text-white font-bold text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setActiveCalendarTarget('p1')}
                    className="p-2.5 rounded-xl bg-[#18181b] border border-zinc-600 hover:border-[#FF0000] text-[#FF0000] font-bold text-xs flex items-center justify-center transition-all cursor-pointer"
                    title="Open Wall Calendar"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#18181b]/70 border border-dashed border-zinc-700 text-zinc-400 text-xs font-semibold">
                  <span>No data / Don't remember</span>
                  <button
                    type="button"
                    onClick={() => setCustomStartDate(formatDateYYYYMMDD(new Date()))}
                    className="text-[11px] text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer"
                  >
                    Set Date
                  </button>
                </div>
              )}
            </div>

            {/* 2nd Date */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] text-zinc-300 font-semibold flex items-center gap-1">
                  <span>2nd Last Period Date</span>
                  <span className="text-zinc-500 text-[10px]">(Optional)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setPeriodDate2(periodDate2 ? '' : formatDateYYYYMMDD(new Date(Date.now() - 28 * 86400000)))}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-rose-300 font-bold border border-zinc-700 cursor-pointer transition-all"
                >
                  {periodDate2 ? "Clear / No data" : "+ Add Date"}
                </button>
              </div>
              {periodDate2 ? (
                <div className="flex gap-2 items-center">
                  <input
                    type="date"
                    value={periodDate2}
                    onChange={(e) => setPeriodDate2(e.target.value)}
                    className="flex-1 p-2.5 rounded-xl bg-[#18181b] border border-zinc-600 focus:border-[#FF0000] text-white font-bold text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setActiveCalendarTarget('p2')}
                    className="p-2.5 rounded-xl bg-[#18181b] border border-zinc-600 hover:border-[#FF0000] text-[#FF0000] font-bold text-xs flex items-center justify-center transition-all cursor-pointer"
                    title="Open Wall Calendar"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#18181b]/70 border border-dashed border-zinc-700 text-zinc-400 text-xs font-semibold">
                  <span>No data / Don't remember</span>
                  <button
                    type="button"
                    onClick={() => setPeriodDate2(formatDateYYYYMMDD(new Date(Date.now() - 28 * 86400000)))}
                    className="text-[11px] text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer"
                  >
                    Set Date
                  </button>
                </div>
              )}
            </div>

            {/* 3rd Date */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] text-zinc-300 font-semibold flex items-center gap-1">
                  <span>3rd Last Period Date</span>
                  <span className="text-zinc-500 text-[10px]">(Optional)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setPeriodDate3(periodDate3 ? '' : formatDateYYYYMMDD(new Date(Date.now() - 56 * 86400000)))}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-rose-300 font-bold border border-zinc-700 cursor-pointer transition-all"
                >
                  {periodDate3 ? "Clear / No data" : "+ Add Date"}
                </button>
              </div>
              {periodDate3 ? (
                <div className="flex gap-2 items-center">
                  <input
                    type="date"
                    value={periodDate3}
                    onChange={(e) => setPeriodDate3(e.target.value)}
                    className="flex-1 p-2.5 rounded-xl bg-[#18181b] border border-zinc-600 focus:border-[#FF0000] text-white font-bold text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setActiveCalendarTarget('p3')}
                    className="p-2.5 rounded-xl bg-[#18181b] border border-zinc-600 hover:border-[#FF0000] text-[#FF0000] font-bold text-xs flex items-center justify-center transition-all cursor-pointer"
                    title="Open Wall Calendar"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#18181b]/70 border border-dashed border-zinc-700 text-zinc-400 text-xs font-semibold">
                  <span>No data / Don't remember</span>
                  <button
                    type="button"
                    onClick={() => setPeriodDate3(formatDateYYYYMMDD(new Date(Date.now() - 56 * 86400000)))}
                    className="text-[11px] text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer"
                  >
                    Set Date
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep(2)}
              className="py-3 px-4 rounded-xl bg-[#27272a] text-zinc-300 font-semibold text-xs hover:bg-[#3f3f46] cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={() => {
                // Re-calculate average cycle length if user provided periodDate2 or periodDate3
                const periodDates = [customStartDate, periodDate2, periodDate3].filter(Boolean);
                const computedCycleLen = calculateAverageCycleLength(periodDates);
                if (computedCycleLen && computedCycleLen >= 20 && computedCycleLen <= 45) {
                  setCycleLength(computedCycleLen);
                }
                setStep(4);
              }}
              className="flex-1 py-3.5 rounded-xl bg-[#FF0000] hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Next: Cycle Length</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: CYCLE LENGTH */}
      {step === 4 && (
        <div className="space-y-5">
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold tracking-tight text-white">
              Cycle Length (Days)
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              The number of days between the first day of one period and the first day of the next (typically 21–35 days).
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                CYCLE LENGTH IN DAYS
              </label>
              <input
                type="number"
                min={20}
                max={45}
                value={cycleLength}
                onChange={(e) => setCycleLength(Number(e.target.value))}
                className="w-full p-3.5 rounded-2xl bg-[#27272a] border border-zinc-700 text-white font-bold text-lg focus:outline-none focus:border-[#FF0000]"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] text-zinc-400 font-semibold">Common Cycle Lengths:</span>
              <div className="grid grid-cols-5 gap-1.5">
                {[25, 28, 30, 32, 35].map((cl) => (
                  <button
                    key={cl}
                    type="button"
                    onClick={() => setCycleLength(cl)}
                    className={`py-2 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                      cycleLength === cl
                        ? 'bg-[#FF0000] border-[#FF0000] text-white shadow'
                        : 'bg-[#27272a] border-zinc-700 text-zinc-300 hover:bg-[#3f3f46]'
                    }`}
                  >
                    {cl}d
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => setStep(3)}
              className="py-3 px-4 rounded-xl bg-[#27272a] text-zinc-300 font-semibold text-xs hover:bg-[#3f3f46] cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={() => setStep(5)}
              className="flex-1 py-3.5 rounded-xl bg-[#FF0000] hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Next: Period Duration</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: PERIOD DURATION */}
      {step === 5 && (
        <div className="space-y-5">
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold tracking-tight text-white">
              Period Duration
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              How many days does your period usually last? (typically 3–7 days).
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                PERIOD DURATION IN DAYS
              </label>
              <input
                type="number"
                min={2}
                max={10}
                value={periodDuration}
                onChange={(e) => setPeriodDuration(Number(e.target.value))}
                className="w-full p-3.5 rounded-2xl bg-[#27272a] border border-zinc-700 text-white font-bold text-lg focus:outline-none focus:border-[#FF0000]"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] text-zinc-400 font-semibold">Quick Duration Select:</span>
              <div className="grid grid-cols-5 gap-1.5">
                {[3, 4, 5, 6, 7].map((pd) => (
                  <button
                    key={pd}
                    type="button"
                    onClick={() => setPeriodDuration(pd)}
                    className={`py-2 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                      periodDuration === pd
                        ? 'bg-[#FF0000] border-[#FF0000] text-white shadow'
                        : 'bg-[#27272a] border-zinc-700 text-zinc-300 hover:bg-[#3f3f46]'
                    }`}
                  >
                    {pd} days
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => setStep(4)}
              className="py-3 px-4 rounded-xl bg-[#27272a] text-zinc-300 font-semibold text-xs hover:bg-[#3f3f46] cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={() => setStep(6)}
              className="flex-1 py-3.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-lg shadow-rose-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Next: Symptoms</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: SYMPTOMS & PREFERENCES */}
      {step === 6 && (
        <div className="space-y-5">
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold tracking-tight text-white">
              Current Symptoms & Health Focus
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Select symptoms you frequently experience to personalize remedies and nutrient advice.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
            {SYMPTOM_OPTIONS.map((sym) => {
              const active = selectedSymptoms.includes(sym.id);
              return (
                <button
                  key={sym.id}
                  onClick={() => toggleSymptom(sym.id)}
                  className={`p-3 rounded-xl text-xs font-medium flex items-center justify-between border transition-all cursor-pointer ${
                    active
                      ? 'bg-rose-500/20 border-rose-500 text-white font-bold'
                      : 'bg-[#1c1c20] border-[#27272a] text-zinc-300 hover:bg-[#27272a]'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>{sym.icon}</span>
                    <span>{sym.label}</span>
                  </span>
                  {active && <Check className="w-4 h-4 text-rose-400" />}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep(5)}
              className="py-3 px-4 rounded-xl bg-[#27272a] text-zinc-300 font-semibold text-xs hover:bg-[#3f3f46] cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={handleFinish}
              className="flex-1 py-3.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-lg shadow-rose-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-rose-200" />
              <span>Complete Setup & View Dashboard</span>
            </button>
          </div>
        </div>
      )}
    </div>

    {/* Wall Calendar Modal Popup for Date Changes */}
    {activeCalendarTarget !== null && (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
        <div className="bg-[#18181b] p-5 rounded-[32px] max-w-sm w-full space-y-3 border border-zinc-700 shadow-2xl relative">
          <div className="flex items-center justify-between px-2">
            <h4 className="font-extrabold text-white text-sm">
              Select {activeCalendarTarget === 'p1' ? 'Most Recent' : activeCalendarTarget === 'p2' ? '2nd Last' : '3rd Last'} Period Date
            </h4>
            <button
              type="button"
              onClick={() => setActiveCalendarTarget(null)}
              className="p-1.5 rounded-full bg-[#27272a] text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <WallCalendarPicker
            selectedDate={
              activeCalendarTarget === 'p1'
                ? customStartDate
                : activeCalendarTarget === 'p2'
                ? periodDate2
                : periodDate3
            }
            onSelectDate={(d) => {
              if (activeCalendarTarget === 'p1') setCustomStartDate(d);
              else if (activeCalendarTarget === 'p2') setPeriodDate2(d);
              else if (activeCalendarTarget === 'p3') setPeriodDate3(d);
              setActiveCalendarTarget(null);
            }}
          />
        </div>
      </div>
    )}
    </>
  );
};
