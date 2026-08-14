import React, { useState } from 'react';
import { Pill, Sparkles, Utensils, Moon, Activity, CheckCircle, ShieldCheck, HeartPulse } from 'lucide-react';
import { CyclePrediction, DailySymptomLog, UserProfile } from '../types';
import { PHASE_KNOWLEDGE } from '../data/cycleKnowledge';
import { formatDateLong } from '../utils/cycleCalculations';

interface PhaseAndRemediesSectionProps {
  prediction: CyclePrediction;
  profile: UserProfile;
  currentLog?: DailySymptomLog;
  onOpenGeminiAdvice?: () => void;
}

export const PhaseAndRemediesSection: React.FC<PhaseAndRemediesSectionProps> = ({
  prediction,
  profile,
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
      <div className="p-5 rounded-3xl bg-[#161618] border border-[#27272a] shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#27272a] pb-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <HeartPulse className="w-3.5 h-3.5" />
              Cycle Prediction & Timeline
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">
              Next Period Begins {formatDateLong(nextPeriodStartDate)}
            </h3>
          </div>
          <div className="px-3.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold">
            In {daysUntilNextPeriod} {daysUntilNextPeriod === 1 ? 'day' : 'days'}
          </div>
        </div>

        {/* Key Cycle Inputs Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800/80">
            <span className="text-[10px] text-zinc-400 font-semibold uppercase">Cycle Length</span>
            <p className="text-base font-bold text-white mt-0.5">{cycleLength} Days</p>
          </div>
          <div className="p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800/80">
            <span className="text-[10px] text-zinc-400 font-semibold uppercase">Period Duration</span>
            <p className="text-base font-bold text-white mt-0.5">{periodDuration} Days</p>
          </div>
          <div className="p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800/80">
            <span className="text-[10px] text-zinc-400 font-semibold uppercase">User Age</span>
            <p className="text-base font-bold text-white mt-0.5">{profile.age || 24} Yrs</p>
          </div>
          <div className="p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800/80">
            <span className="text-[10px] text-zinc-400 font-semibold uppercase">Current Day</span>
            <p className="text-base font-bold text-rose-400 mt-0.5">Day {currentDayInCycle}</p>
          </div>
        </div>
      </div>

      {/* 2. Current Phase Overview Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#1c1c20] to-[#161618] border border-rose-500/30 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500 text-white uppercase tracking-wider">
            {phaseData.displayName}
          </span>
          <span className="text-xs font-semibold text-rose-300">
            {phaseData.dayRangeText} (Day {currentDayInCycle})
          </span>
        </div>

        <div className="space-y-1.5 pt-1">
          <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>{phaseData.tagline}</span>
          </h3>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-4xl">
            {phaseData.description}
          </p>
        </div>
      </div>

      {/* 3. Side-by-Side Symmetrical Row: Nourishing Foods (Left) vs Highlighted Vitamins (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN (Lg: 6 cols) - Nourishing Foods for this Phase */}
        <div className="lg:col-span-6">
          <div className="p-5 sm:p-6 rounded-3xl bg-[#161618] border border-[#27272a] shadow-xl space-y-4 h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-rose-400" />
                  <span>Nourishing Foods for this Phase</span>
                </h4>
                <span className="text-[11px] text-zinc-400 font-medium">Tailored for Day {currentDayInCycle}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {phaseData.foodsToIncrease.map((food, idx) => (
                  <div 
                    key={idx}
                    className="p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 hover:border-rose-500/30 transition-all space-y-1 min-h-[90px] flex flex-col justify-start"
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
            </div>

            {/* Foods to Limit or Avoid */}
            {phaseData.foodsToReduce.length > 0 && (
              <div className="pt-3 border-t border-[#27272a] mt-2">
                <span className="text-xs font-semibold text-zinc-400 block mb-1.5">Foods to Limit or Avoid:</span>
                <div className="flex flex-wrap gap-1.5">
                  {phaseData.foodsToReduce.map((item, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-xl bg-zinc-800/80 text-zinc-400 text-[11px] border border-zinc-700/50">
                      • {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (Lg: 6 cols) - HIGHLIGHTED VITAMINS (Shortened to match food height) */}
        <div className="lg:col-span-6">
          <div className="p-5 sm:p-6 rounded-3xl bg-[#161618] border border-[#27272a] shadow-xl space-y-4 h-full flex flex-col justify-between">
            <div className="space-y-3">
              {/* Panel Header */}
              <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
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
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-rose-500 text-white font-bold uppercase tracking-wider">
                  Phase Focus
                </span>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                Specially recommended nutrients to balance your body during Day {currentDayInCycle}:
              </p>

              {/* List of Highlighted Vitamin Cards */}
              <div className="space-y-2.5">
                {phaseData.vitaminsHighlighted.map((vit) => {
                  const isTaken = takenVitamins[vit.id];
                  return (
                    <div
                      key={vit.id}
                      className={`p-3 rounded-2xl border transition-all ${
                        isTaken
                          ? 'bg-emerald-950/20 border-emerald-500/40'
                          : 'bg-zinc-900/70 border-zinc-800/90 hover:border-rose-500/50 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          {/* Chemical/Symbol Badge */}
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white font-black text-xs flex items-center justify-center shadow-md shrink-0">
                            {vit.symbol}
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-white">{vit.name}</h5>
                            <span className="text-[10px] text-rose-300 font-semibold">{vit.dosage}</span>
                          </div>
                        </div>

                        {/* Taken Today Checkbox */}
                        <button
                          type="button"
                          onClick={() => toggleVitamin(vit.id)}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                            isTaken
                              ? 'bg-emerald-500 text-white'
                              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
                          }`}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          {isTaken ? 'Taken' : 'Take'}
                        </button>
                      </div>

                      <p className="text-[11px] text-zinc-300 mt-1.5 font-medium">
                        ✨ <span className="text-zinc-200">{vit.keyBenefit}</span>
                      </p>

                      <div className="mt-1.5 text-[10px] text-zinc-400 flex flex-wrap gap-1">
                        <span className="font-semibold text-zinc-400">Sources:</span>
                        {vit.sources.map((src, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded-lg bg-zinc-800 text-zinc-300">
                            {src}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quality & Safety Assurance */}
            <div className="p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 flex items-center gap-2.5 text-[11px] text-zinc-400 mt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Nutrition recommendations are synchronized with your cycle length and symptom inputs.</span>
            </div>
          </div>
        </div>

      </div>

      {/* 4. Full-Width Expanded Section: Rest, Sleep & Activity Guidance */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#161618] border border-[#27272a] shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Moon className="w-4 h-4 text-indigo-400" />
            <span>Rest, Sleep & Activity Guidance</span>
          </h4>
          <span className="text-[11px] text-zinc-400 font-medium">Holistic Daily Well-being</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-zinc-300">
          <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 flex items-start gap-3.5 hover:border-indigo-500/30 transition-all">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-400">
              <Moon className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <span className="font-bold text-white text-xs block">Rest & Sleep Recovery</span>
              <span className="text-xs text-zinc-400 leading-relaxed block">{phaseData.restAdvice}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 flex items-start gap-3.5 hover:border-rose-500/30 transition-all">
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0 text-rose-400">
              <Activity className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <span className="font-bold text-white text-xs block">Exercise & Movement</span>
              <span className="text-xs text-zinc-400 leading-relaxed block">{phaseData.exerciseAdvice}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
