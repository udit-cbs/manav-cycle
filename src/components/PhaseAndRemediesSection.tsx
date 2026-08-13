import React, { useState } from 'react';
import { Pill, Sparkles, Utensils, Moon, Activity, CheckCircle, ShieldCheck, HeartPulse } from 'lucide-react';
import { CyclePrediction, DailySymptomLog, UserProfile } from '../types';
import { PHASE_KNOWLEDGE } from '../data/cycleKnowledge';
import { formatDateLong, formatDateShort } from '../utils/cycleCalculations';

interface PhaseAndRemediesSectionProps {
  prediction: CyclePrediction;
  profile: UserProfile;
  currentLog?: DailySymptomLog;
  onOpenGeminiAdvice?: () => void;
}

export const PhaseAndRemediesSection: React.FC<PhaseAndRemediesSectionProps> = ({
  prediction,
  profile,
  currentLog,
  onOpenGeminiAdvice,
}) => {
  const { currentPhase, currentDayInCycle, cycleLength, periodDuration, nextPeriodStartDate, daysUntilNextPeriod } = prediction;
  const phaseData = PHASE_KNOWLEDGE[currentPhase];

  const [takenVitamins, setTakenVitamins] = useState<Record<string, boolean>>({});

  const toggleVitamin = (id: string) => {
    setTakenVitamins((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="px-4 py-6 space-y-6">
      {/* 1. Cycle Predictions & Timeline Header */}
      <div className="p-5 rounded-2xl bg-[#1c1c20] border border-[#27272a] shadow-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#27272a] pb-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
              <HeartPulse className="w-3.5 h-3.5" />
              Cycle Prediction & Timeline
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">
              Next Period Begins {formatDateLong(nextPeriodStartDate)}
            </h3>
          </div>
          <div className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold">
            In {daysUntilNextPeriod} {daysUntilNextPeriod === 1 ? 'day' : 'days'}
          </div>
        </div>

        {/* Key Cycle Inputs Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-xl bg-[#121214] border border-[#27272a]">
            <span className="text-[10px] text-zinc-400 font-medium uppercase">Cycle Length</span>
            <p className="text-base font-bold text-white mt-0.5">{cycleLength} Days</p>
          </div>
          <div className="p-3 rounded-xl bg-[#121214] border border-[#27272a]">
            <span className="text-[10px] text-zinc-400 font-medium uppercase">Period Duration</span>
            <p className="text-base font-bold text-white mt-0.5">{periodDuration} Days</p>
          </div>
          <div className="p-3 rounded-xl bg-[#121214] border border-[#27272a]">
            <span className="text-[10px] text-zinc-400 font-medium uppercase">User Age</span>
            <p className="text-base font-bold text-white mt-0.5">{profile.age || 24} Yrs</p>
          </div>
          <div className="p-3 rounded-xl bg-[#121214] border border-[#27272a]">
            <span className="text-[10px] text-zinc-400 font-medium uppercase">Current Day</span>
            <p className="text-base font-bold text-rose-400 mt-0.5">Day {currentDayInCycle}</p>
          </div>
        </div>
      </div>

      {/* 2. Main Phase Status & Remedies Grid (Responsive Two-Column: Phase & Food Left, Highlighted Vitamins Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT / MAIN COLUMN (Lg: 7 cols) - Current Phase + Foods & Rest */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Phase Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1c1c20] to-[#161618] border border-rose-500/30 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500 text-white uppercase tracking-wider">
                {phaseData.displayName}
              </span>
              <span className="text-xs font-semibold text-rose-300">
                {phaseData.dayRangeText} (Day {currentDayInCycle})
              </span>
            </div>

            <div className="space-y-1 pt-1">
              <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>{phaseData.tagline}</span>
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {phaseData.description}
              </p>
            </div>

            {/* AI Custom Advice Trigger */}
            {onOpenGeminiAdvice && (
              <button
                onClick={onOpenGeminiAdvice}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4 text-rose-400" />
                <span>Get AI Personalized Symptom & Health Advice</span>
              </button>
            )}
          </div>

          {/* Recommended Nutrients & Foods */}
          <div className="p-5 rounded-2xl bg-[#1c1c20] border border-[#27272a] space-y-4">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-2.5">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Utensils className="w-4 h-4 text-rose-400" />
                Nutrients & Foods to Increase
              </h4>
              <span className="text-[11px] text-zinc-400">Tailored for Day {currentDayInCycle}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {phaseData.foodsToIncrease.map((food, idx) => (
                <div 
                  key={idx}
                  className="p-3 rounded-xl bg-[#121214] border border-[#27272a] hover:border-rose-500/30 transition-all space-y-1"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{food.icon}</span>
                    <span className="text-xs font-bold text-zinc-100">{food.name}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-normal pl-7">
                    {food.reason}
                  </p>
                </div>
              ))}
            </div>

            {/* Foods to Reduce */}
            {phaseData.foodsToReduce.length > 0 && (
              <div className="pt-2 border-t border-[#27272a]">
                <span className="text-xs font-semibold text-zinc-400 block mb-1.5">Minimize or Avoid:</span>
                <div className="flex flex-wrap gap-1.5">
                  {phaseData.foodsToReduce.map((item, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-zinc-800/60 text-zinc-400 text-[11px]">
                      • {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Rest & Activity Guidance */}
          <div className="p-5 rounded-2xl bg-[#1c1c20] border border-[#27272a] space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-400" />
              Rest, Sleep & Activity Guidance
            </h4>
            
            <div className="space-y-2 text-xs text-zinc-300">
              <div className="p-3 rounded-xl bg-[#121214] border border-[#27272a] flex items-start gap-2.5">
                <Moon className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block mb-0.5">Rest & Recovery</span>
                  <span>{phaseData.restAdvice}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#121214] border border-[#27272a] flex items-start gap-2.5">
                <Activity className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block mb-0.5">Exercise & Movement</span>
                  <span>{phaseData.exerciseAdvice}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (Lg: 5 cols) - HIGHLIGHTED VITAMINS (EXPLICIT USER MANDATE) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-4 p-5 rounded-2xl bg-gradient-to-b from-[#1c1c20] via-[#18181c] to-[#121214] border-2 border-rose-500/50 shadow-xl space-y-4">
            
            {/* Panel Header */}
            <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                  <Pill className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white tracking-tight">
                    Highlighted Vitamins
                  </h4>
                  <p className="text-[11px] text-rose-300 font-medium">
                    Essential for {phaseData.displayName}
                  </p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold uppercase tracking-wider">
                Phase Focus
              </span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              These key vitamins and minerals are specially recommended right now to balance your body during Day {currentDayInCycle}:
            </p>

            {/* List of Highlighted Vitamin Cards */}
            <div className="space-y-3">
              {phaseData.vitaminsHighlighted.map((vit) => {
                const isTaken = takenVitamins[vit.id];
                return (
                  <div
                    key={vit.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isTaken
                        ? 'bg-emerald-950/20 border-emerald-500/40'
                        : 'bg-[#121214] border-rose-500/30 hover:border-rose-500/60 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        {/* Chemical/Symbol Badge */}
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white font-black text-xs flex items-center justify-center shadow-md shrink-0">
                          {vit.symbol}
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-white">{vit.name}</h5>
                          <span className="text-[10px] text-rose-300 font-semibold">{vit.dosage}</span>
                        </div>
                      </div>

                      {/* Taken Today Checkbox */}
                      <button
                        onClick={() => toggleVitamin(vit.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                          isTaken
                            ? 'bg-emerald-500 text-white'
                            : 'bg-[#27272a] hover:bg-[#3f3f46] text-zinc-300 border border-[#3f3f46]'
                        }`}
                      >
                        <CheckCircle className="w-3 h-3" />
                        {isTaken ? 'Taken' : 'Take'}
                      </button>
                    </div>

                    <p className="text-[11px] text-zinc-300 mt-2 font-medium">
                      ✨ <span className="text-zinc-200">{vit.keyBenefit}</span>
                    </p>

                    <div className="mt-2 text-[10px] text-zinc-400 flex flex-wrap gap-1">
                      <span className="font-semibold text-zinc-400">Natural sources:</span>
                      {vit.sources.map((src, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-[#27272a] text-zinc-300">
                          {src}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quality & Safety Assurance */}
            <div className="p-3 rounded-xl bg-[#121214] border border-[#27272a] flex items-center gap-2 text-[11px] text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Nutrition recommendations are synchronized with your cycle length and symptom inputs.</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
