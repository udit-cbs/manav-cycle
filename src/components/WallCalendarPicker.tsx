import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { formatDateHuman, formatDateYYYYMMDD } from '../utils/cycleCalculations';

interface WallCalendarPickerProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void;
  title?: string;
}

export const WallCalendarPicker: React.FC<WallCalendarPickerProps> = ({
  selectedDate,
  onSelectDate,
}) => {
  // Parse initial date or default to today
  const initDate = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date();
  const [viewYear, setViewYear] = useState<number>(initDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initDate.getMonth()); // 0-11

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Days calculations
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  // Create grid matrix
  const daysArray: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d);
  }

  const handleDayClick = (dayNum: number) => {
    const mStr = String(viewMonth + 1).padStart(2, '0');
    const dStr = String(dayNum).padStart(2, '0');
    const dateFormatted = `${viewYear}-${mStr}-${dStr}`;
    onSelectDate(dateFormatted);
  };

  return (
    <div className="w-full max-w-sm mx-auto shadow-2xl rounded-b-3xl overflow-hidden font-sans border-2 border-[#E52E2E] transition-all select-none bg-white">
      {/* Hanging Spiral Ring & Pin Header matching user reference image */}
      <div className="bg-[#EAEBED] py-2 relative flex items-center justify-center border-b border-zinc-300">
        {/* Red hanging push pin */}
        <div className="w-4 h-4 rounded-full bg-[#E52E2E] border-2 border-red-900 shadow-md mx-auto z-10"></div>
        {/* Metal spiral rings */}
        <div className="absolute inset-x-0 bottom-0 flex justify-between px-4 translate-y-1/2">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="w-1.5 h-4 bg-gradient-to-b from-zinc-300 via-white to-zinc-400 rounded-full border border-zinc-500 shadow-2xs"></div>
          ))}
        </div>
      </div>

      {/* Red Banner Header (Exact match to uploaded "Calendar" red banner) */}
      <div className="bg-[#FF0000] text-white px-6 pt-6 pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-3xl font-black tracking-tight drop-shadow-xs font-sans uppercase">
            Calendar
          </h3>
          <span className="text-xs font-extrabold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full backdrop-blur-xs">
            {monthNames[viewMonth]} {viewYear}
          </span>
        </div>

        {/* Month Navigation Controls */}
        <div className="flex items-center justify-between mt-3 text-white text-xs font-bold pt-2 border-t border-white/20">
          <button
            onClick={handlePrevMonth}
            type="button"
            className="flex items-center gap-1 hover:bg-white/20 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>
          <span className="font-extrabold text-sm tracking-wide">{monthNames[viewMonth]} {viewYear}</span>
          <button
            onClick={handleNextMonth}
            type="button"
            className="flex items-center gap-1 hover:bg-white/20 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid Header (Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday) */}
      <div className="bg-white px-2 pt-3 pb-1 border-b border-zinc-200">
        <div className="grid grid-cols-7 text-center">
          <span className="text-[11px] font-extrabold text-[#FF0000] uppercase">Sunday</span>
          <span className="text-[11px] font-bold text-zinc-800 uppercase">Monday</span>
          <span className="text-[11px] font-bold text-zinc-800 uppercase">Tuesday</span>
          <span className="text-[11px] font-bold text-zinc-800 uppercase">Wed</span>
          <span className="text-[11px] font-bold text-zinc-800 uppercase">Thu</span>
          <span className="text-[11px] font-bold text-zinc-800 uppercase">Friday</span>
          <span className="text-[11px] font-extrabold text-[#FF0000] uppercase">Saturday</span>
        </div>
      </div>

      {/* Calendar Dates Grid */}
      <div className="bg-white p-2">
        <div className="grid grid-cols-7 gap-1 text-center">
          {daysArray.map((dayNum, index) => {
            if (dayNum === null) {
              return <div key={`empty-${index}`} className="aspect-square"></div>;
            }

            const colIndex = index % 7; // 0 = Sun, 6 = Sat
            const isSunday = colIndex === 0;
            const isSaturday = colIndex === 6;

            const mStr = String(viewMonth + 1).padStart(2, '0');
            const dStr = String(dayNum).padStart(2, '0');
            const dateStr = `${viewYear}-${mStr}-${dStr}`;
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === formatDateYYYYMMDD(new Date());

            return (
              <button
                key={`day-${dayNum}`}
                type="button"
                onClick={() => handleDayClick(dayNum)}
                className={`aspect-square flex flex-col items-center justify-center rounded-xl text-base font-black transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-[#FF0000] text-white border-[#FF0000] shadow-md scale-105 z-10'
                    : isToday
                    ? 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100'
                    : 'bg-white border-zinc-100 hover:bg-zinc-100 hover:border-zinc-300'
                }`}
              >
                <span
                  className={
                    isSelected
                      ? 'text-white font-extrabold'
                      : isSunday || isSaturday
                      ? 'text-[#FF0000] font-black'
                      : 'text-zinc-900 font-bold'
                  }
                >
                  {dayNum}
                </span>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-white -mt-0.5 stroke-[3]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Selected Date Banner */}
      <div className="bg-zinc-50 border-t border-zinc-200 p-3 text-center text-xs font-bold text-zinc-700 flex items-center justify-between px-4">
        <span className="text-zinc-500 font-medium">Selected Start Date:</span>
        <span className="bg-[#FF0000] text-white px-3 py-1 rounded-full font-black text-xs">
          {selectedDate ? formatDateHuman(selectedDate) : 'None Selected'}
        </span>
      </div>
    </div>
  );
};
