import React from 'react';
import { formatDateYYYYMMDD, formatDayOfWeek } from '../utils/cycleCalculations';

interface DayStripCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  periodDuration: number;
}

export const DayStripCalendar: React.FC<DayStripCalendarProps> = ({
  selectedDate,
  onSelectDate,
}) => {
  // Generate 7 days around selected date (-3 to +3)
  const days: Date[] = [];
  const base = new Date(selectedDate);
  for (let i = -3; i <= 3; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    days.push(d);
  }

  const todayStr = formatDateYYYYMMDD(new Date());
  const selectedStr = formatDateYYYYMMDD(selectedDate);

  return (
    <div className="w-full px-4 py-2">
      <div className="flex items-center justify-between gap-1 max-w-md mx-auto">
        {days.map((d) => {
          const dStr = formatDateYYYYMMDD(d);
          const isSelected = dStr === selectedStr;
          const isToday = dStr === todayStr;

          return (
            <button
              key={dStr}
              onClick={() => onSelectDate(d)}
              className={`flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-xl transition-all ${
                isSelected
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20 scale-105 font-bold'
                  : 'bg-[#1c1c20] hover:bg-[#27272a] text-zinc-300 border border-[#27272a]'
              }`}
            >
              <span className={`text-base font-semibold leading-tight ${isSelected ? 'text-white' : 'text-zinc-100'}`}>
                {d.getDate()}
              </span>
              <span className={`text-[10px] font-medium uppercase tracking-wider mt-0.5 ${isSelected ? 'text-rose-100' : 'text-zinc-400'}`}>
                {formatDayOfWeek(d)}
              </span>
              {isToday && !isSelected && (
                <span className="w-1 h-1 rounded-full bg-rose-400 mt-1"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
