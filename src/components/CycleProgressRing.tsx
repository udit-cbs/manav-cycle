import React from 'react';
import { CyclePrediction } from '../types';
import { formatDateShort } from '../utils/cycleCalculations';

interface CycleProgressRingProps {
  prediction: CyclePrediction;
  onRingClick?: () => void;
}

export const CycleProgressRing: React.FC<CycleProgressRingProps> = ({ prediction, onRingClick }) => {
  const { currentDayInCycle, cycleLength, phaseDisplayName, daysUntilNextPeriod, nextPeriodStartDate } = prediction;

  const size = 220;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate percentage of current day in total cycle
  const progressPercent = Math.min(100, Math.max(0, (currentDayInCycle / cycleLength) * 100));
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center py-6 px-4 text-center select-none">
      <div 
        onClick={onRingClick} 
        className="relative cursor-pointer group flex items-center justify-center transition-transform hover:scale-[1.02]"
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} className="transform -rotate-90 drop-shadow-md">
          <defs>
            <linearGradient id="roseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="50%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#be123c" />
            </linearGradient>
          </defs>

          {/* Background Ring Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#27272a"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Active Progress Gradient Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#roseGradient)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs uppercase tracking-widest text-zinc-400 font-medium">Day</span>
          <span className="text-5xl font-extrabold text-rose-500 font-sans tracking-tight leading-none mt-1 group-hover:text-rose-400 transition-colors">
            {currentDayInCycle}
          </span>
          <span className="text-[11px] text-zinc-400 mt-2">of {cycleLength} days</span>
        </div>
      </div>

      {/* Phase Label & Prediction Subtitle */}
      <div className="mt-5 space-y-1">
        <h2 className="text-xl font-bold text-white tracking-tight">{phaseDisplayName}</h2>
        <p className="text-sm font-medium text-rose-300/90">
          Next period in {daysUntilNextPeriod} {daysUntilNextPeriod === 1 ? 'day' : 'days'}, {formatDateShort(nextPeriodStartDate)}
        </p>
      </div>
    </div>
  );
};
