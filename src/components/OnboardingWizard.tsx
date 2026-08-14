import React, { useState } from 'react';
import { Calendar, Check, ChevronRight, Sparkles, X, Droplet, Activity } from 'lucide-react';
import { CrampSeverity, FlowLevel, UserProfile } from '../types';
import { calculateAverageCycleLength, formatDateHuman, formatDateYYYYMMDD, getCyclePrediction, saveSymptomLog } from '../utils/cycleCalculations';
import { SYMPTOM_OPTIONS } from '../data/cycleKnowledge';
import { WallCalendarPicker } from './WallCalendarPicker';
import { persistUserProfile } from '../lib/userStorage';

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
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8>(1);
  const [activeCalendarTarget, setActiveCalendarTarget] = useState<'p1' | 'p2' | 'p3' | null>(null);

  // Retrieve previous recorded period dates from user profile / history
  const prevP1 = profile.last3Periods?.[0] || profile.scanHistory?.[0]?.periodDates?.[0] || '';
  const prevP2 = profile.last3Periods?.[1] || profile.scanHistory?.[0]?.periodDates?.[1] || '';
  const prevP3 = profile.last3Periods?.[2] || profile.scanHistory?.[0]?.periodDates?.[2] || '';
  const hasPreviousHistory = Boolean(prevP1);

  // Form State: Initialize Most Recent with Step 1 default / today
  const [lastPeriodOption, setLastPeriodOption] = useState<'today' | 'yesterday' | 'custom' | 'unsure'>('today');
  const defaultStep1Date = formatDateYYYYMMDD(new Date());
  const [customStartDate, setCustomStartDate] = useState<string>(
    prevP1 && prevP1 === defaultStep1Date ? prevP1 : defaultStep1Date
  );

  // If a new most recent date is entered, shift 2nd last to previous most recent (prevP1), and 3rd last to previous 2nd last (prevP2)
  const computeP2 = (start: string) => {
    if (!prevP1) return '';
    if (start && start !== prevP1) return prevP1;
    return prevP2;
  };

  const computeP3 = (start: string) => {
    if (!prevP1) return '';
    if (start && start !== prevP1) return prevP2;
    return prevP3;
  };

  const [periodDate2, setPeriodDate2] = useState<string>(computeP2(defaultStep1Date));
  const [periodDate3, setPeriodDate3] = useState<string>(computeP3(defaultStep1Date));

  const [age, setAge] = useState<number>(profile.age || 24);
  const [cycleLength, setCycleLength] = useState<number>(profile.cycleLength || 28);
  const [periodDuration, setPeriodDuration] = useState<number>(profile.periodDuration || 5);

  const [flowIntensity, setFlowIntensity] = useState<FlowLevel>(profile.flowIntensity || 'medium');
  const [crampIntensity, setCrampIntensity] = useState<CrampSeverity>(profile.crampIntensity || 'mild');

  // All symptoms deselected by default as requested
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(profile.symptoms || []);

  // Update dates when customStartDate changes in Step 1
  const handleSetCustomStartDate = (newDate: string) => {
    setCustomStartDate(newDate);
    if (hasPreviousHistory) {
      setPeriodDate2(computeP2(newDate));
      setPeriodDate3(computeP3(newDate));
    }
  };

  // Handle step 1 date quick pickers
  const handleQuickDateSelect = (option: 'today' | 'yesterday' | 'custom' | 'unsure') => {
    setLastPeriodOption(option);
    if (option === 'today') {
      handleSetCustomStartDate(formatDateYYYYMMDD(new Date()));
    } else if (option === 'yesterday') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      handleSetCustomStartDate(formatDateYYYYMMDD(y));
    } else if (option === 'unsure') {
      // Default to 14 days ago
      const d = new Date();
      d.setDate(d.getDate() - 14);
      handleSetCustomStartDate(formatDateYYYYMMDD(d));
    }
  };

  const handleFinish = () => {
    const todayStr = formatDateYYYYMMDD(new Date());
    const periodDates = [customStartDate, periodDate2, periodDate3].filter(Boolean);

    // Create current scan entry
    const newScanEntry: import('../types').CycleScanEntry = {
      id: `scan-${todayStr}`,
      date: todayStr,
      timestamp: new Date().toISOString(),
      age: Number(age) || 24,
      periodDates,
      cycleLength: Number(cycleLength) || 28,
      periodDuration: Number(periodDuration) || 5,
      flowIntensity,
      crampIntensity,
      symptoms: selectedSymptoms,
      selectedProduct: profile.selectedProduct,
    };

    // Filter out any existing entry on the SAME day to replace it cleanly without duplicates
    const existingHistory = profile.scanHistory || [];
    const nonTodayHistory = existingHistory.filter((entry) => entry.date !== todayStr);
    const updatedHistory = [newScanEntry, ...nonTodayHistory];

    const updated: UserProfile = {
      ...profile,
      age: Number(age) || 24,
      last3Periods: periodDates,
      cycleLength: Number(cycleLength) || 28,
      periodDuration: Number(periodDuration) || 5,
      flowIntensity,
      crampIntensity,
      symptoms: selectedSymptoms,
      completedOnboarding: true,
      lastCompletedOnboardingDate: todayStr,
      scanHistory: updatedHistory,
    };
    onSaveProfile(updated);
    persistUserProfile(updated);

    // Save/overwrite initial log for today without duplication
    saveSymptomLog({
      date: todayStr,
      flow: flowIntensity,
      cramps: crampIntensity,
      mood: 'calm',
      symptoms: selectedSymptoms,
    });

    const prediction = getCyclePrediction(updated);

    fetch('https://script.google.com/macros/s/AKfycbziBoE1A5DTEAXZ0kwOAq1nfoW-6RTrN2UW8WEs3RcBPbCWDb1teUQIXeZvvEET_FKkKA/exec', {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        age: age,
        period1: customStartDate ? new Date(customStartDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not provided',
        period2: periodDate2 ? new Date(periodDate2).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not provided',
        period3: periodDate3 ? new Date(periodDate3).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not provided',
        cycleLength: cycleLength,
        periodDuration: periodDuration,
        flowIntensity: flowIntensity,
        crampIntensity: crampIntensity,
        symptoms: selectedSymptoms.length > 0 ? selectedSymptoms.join(', ') : 'None selected',
        nextPeriod: prediction.nextPeriodStartDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        phase: prediction.phaseDisplayName,
      }),
    });

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
          <span>First scan, step {step} of 8</span>
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
            className="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-300"
            style={{ width: `${(step / 8) * 100}%` }}
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
                  handleSetCustomStartDate(d);
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

          {/* Explicit Previous History Autofill Callout Banner */}
          {hasPreviousHistory && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-950/40 to-pink-950/30 border border-rose-500/30 text-xs space-y-1.5 shadow-sm">
              <div className="flex items-center gap-1.5 font-bold text-rose-300">
                <Sparkles className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>Autofilled from your previously entered cycle records:</span>
              </div>
              <ul className="text-[11px] text-zinc-300 space-y-0.5 pl-4 list-disc marker:text-rose-400">
                <li>
                  <strong className="text-white">Most Recent:</strong> Updated with your Step 1 selection ({formatDateHuman(customStartDate)})
                </li>
                {prevP1 && (
                  <li>
                    <strong className="text-white">2nd Last:</strong> Replaced by your previously recorded most recent period ({formatDateHuman(prevP1)})
                  </li>
                )}
                {prevP2 && (
                  <li>
                    <strong className="text-white">3rd Last:</strong> Replaced by your previously recorded 2nd last period ({formatDateHuman(prevP2)})
                  </li>
                )}
              </ul>
              <p className="text-[10px] text-zinc-400 italic pt-1">
                You can freely modify any date or clear fields below if your cycle varied.
              </p>
            </div>
          )}

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
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-90 text-white font-bold text-sm shadow-lg shadow-rose-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Next: Flow Intensity</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: FLOW INTENSITY */}
      {step === 6 && (
        <div className="space-y-5 animate-in fade-in">
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Droplet className="w-5 h-5 text-rose-400 fill-rose-400/20" />
              <span>Flow Intensity</span>
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              How heavy is your menstrual flow typically during peak period days?
            </p>
          </div>

          <div className="space-y-2.5">
            {[
              { id: 'spotting', label: 'Spotting / Very Light', desc: 'Minimal occasional spotting, pantyliner is sufficient', icon: '💧' },
              { id: 'light', label: 'Light Flow', desc: 'Light steady flow, 1–2 regular pads/tampons a day', icon: '🩸' },
              { id: 'medium', label: 'Medium / Regular', desc: 'Standard moderate flow, changing pad every 4–6 hours', icon: '🩸🩸' },
              { id: 'heavy', label: 'Heavy Flow', desc: 'Heavy bleeding, changing pad/tampon every 2–3 hours', icon: '🌊' },
              { id: 'none', label: 'None / Irregular', desc: 'No flow currently or unpredictable cycle', icon: '✨' },
            ].map((opt) => {
              const isSelected = flowIntensity === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFlowIntensity(opt.id as FlowLevel)}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-rose-500/20 border-rose-500 text-white shadow-md'
                      : 'bg-[#27272a]/80 border-zinc-700/80 text-zinc-300 hover:bg-[#3f3f46]/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{opt.icon}</span>
                    <div>
                      <p className="text-xs font-bold text-white">{opt.label}</p>
                      <p className="text-[11px] text-zinc-400">{opt.desc}</p>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-rose-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => setStep(5)}
              className="py-3 px-4 rounded-xl bg-[#27272a] text-zinc-300 font-semibold text-xs hover:bg-[#3f3f46] cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={() => setStep(7)}
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-90 text-white font-bold text-sm shadow-lg shadow-rose-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Next: Cramp Intensity</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 7: CRAMP INTENSITY */}
      {step === 7 && (
        <div className="space-y-5 animate-in fade-in">
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-rose-400" />
              <span>Cramp Intensity</span>
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              What level of pelvic or abdominal cramps do you typically experience?
            </p>
          </div>

          <div className="space-y-2.5">
            {[
              { id: 'none', label: 'None / Pain-Free', desc: 'No cramps or discomfort throughout the cycle', icon: '🌿' },
              { id: 'mild', label: 'Mild Discomfort', desc: 'Dull ache or slight pelvic pressure, easily manageable', icon: '⚡' },
              { id: 'moderate', label: 'Moderate Cramps', desc: 'Noticeable pain, relieved with heat pads, rest, or tea', icon: '🔥' },
              { id: 'severe', label: 'Severe / Intense', desc: 'Sharp spasms, impacts daily activities, requires medication', icon: '💥' },
            ].map((opt) => {
              const isSelected = crampIntensity === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setCrampIntensity(opt.id as CrampSeverity)}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-rose-500/20 border-rose-500 text-white shadow-md'
                      : 'bg-[#27272a]/80 border-zinc-700/80 text-zinc-300 hover:bg-[#3f3f46]/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{opt.icon}</span>
                    <div>
                      <p className="text-xs font-bold text-white">{opt.label}</p>
                      <p className="text-[11px] text-zinc-400">{opt.desc}</p>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-rose-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => setStep(6)}
              className="py-3 px-4 rounded-xl bg-[#27272a] text-zinc-300 font-semibold text-xs hover:bg-[#3f3f46] cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={() => setStep(8)}
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-90 text-white font-bold text-sm shadow-lg shadow-rose-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Next: Symptoms & Health</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 8: SYMPTOMS & PREFERENCES */}
      {step === 8 && (
        <div className="space-y-5 animate-in fade-in">
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold tracking-tight text-white">
              Current Symptoms & Health Focus
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Select any symptoms you frequently experience to personalize remedies and nutrient advice. (All deselected by default)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 sm:max-h-72 overflow-y-auto pr-1">
            {SYMPTOM_OPTIONS.map((sym) => {
              const active = selectedSymptoms.includes(sym.id);
              return (
                <button
                  key={sym.id}
                  type="button"
                  onClick={() => toggleSymptom(sym.id)}
                  className={`p-3 rounded-xl text-left text-xs font-medium flex items-center justify-between border transition-all cursor-pointer ${
                    active
                      ? 'bg-rose-500/20 border-rose-500 text-white font-bold shadow-sm'
                      : 'bg-[#1c1c20] border-[#27272a] text-zinc-300 hover:bg-[#27272a] hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2 pr-2">
                    <span className="text-base shrink-0">{sym.icon}</span>
                    <span className="text-[11px] leading-tight">{sym.label}</span>
                  </span>
                  {active ? (
                    <Check className="w-4 h-4 text-rose-400 shrink-0" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-zinc-600 shrink-0 opacity-40" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep(7)}
              className="py-3 px-4 rounded-xl bg-[#27272a] text-zinc-300 font-semibold text-xs hover:bg-[#3f3f46] cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={handleFinish}
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-90 text-white font-bold text-sm shadow-lg shadow-rose-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
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
