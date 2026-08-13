import React, { useState } from 'react';
import { Sparkles, X, Loader2, Heart, CheckCircle2 } from 'lucide-react';
import { CyclePrediction, DailySymptomLog, UserProfile } from '../types';

interface GeminiAdviceModalProps {
  profile: UserProfile;
  prediction: CyclePrediction;
  currentLog?: DailySymptomLog;
  onClose: () => void;
}

export const GeminiAdviceModal: React.FC<GeminiAdviceModalProps> = ({
  profile,
  prediction,
  currentLog,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [adviceText, setAdviceText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAdvice = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/gemini-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: profile.age,
          phase: prediction.phaseDisplayName,
          dayInCycle: prediction.currentDayInCycle,
          cycleLength: prediction.cycleLength,
          periodDuration: prediction.periodDuration,
          symptoms: currentLog?.symptoms || [],
          last3Periods: profile.last3Periods,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch AI recommendations');
      }
      setAdviceText(data.advice);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error connecting to Gemini AI');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAdvice();
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#161618] border border-rose-500/40 rounded-2xl p-6 text-white space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Gemini AI Cycle Companion</h3>
              <p className="text-xs text-rose-300 font-medium">Personalized for Day {prediction.currentDayInCycle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#27272a] flex items-center justify-center text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-rose-400 animate-spin mx-auto" />
            <p className="text-xs text-zinc-300 font-medium">
              Analyzing your age ({profile.age}), cycle day ({prediction.currentDayInCycle}), and symptoms...
            </p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/50 text-rose-200 text-xs space-y-3">
            <p className="font-semibold">Unable to connect to AI server:</p>
            <p className="text-zinc-300">{error}</p>
            <button
              onClick={fetchAdvice}
              className="py-2 px-4 rounded-lg bg-rose-500 text-white font-bold text-xs"
            >
              Retry AI Analysis
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#121214] border border-[#27272a] text-xs text-zinc-200 leading-relaxed whitespace-pre-line">
              {adviceText}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#27272a]">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Evidence-informed holistic advice</span>
              </div>
              <button
                onClick={onClose}
                className="py-2 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
