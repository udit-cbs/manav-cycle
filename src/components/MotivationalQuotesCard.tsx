import React, { useState, useMemo } from 'react';
import { Quote, Sparkles, RefreshCw, Copy, Check, Heart, Sun, Moon, Flame, Wind } from 'lucide-react';
import { CyclePrediction, DailySymptomLog, UserProfile } from '../types';

interface MotivationalQuotesCardProps {
  prediction: CyclePrediction;
  profile: UserProfile;
  currentLog: DailySymptomLog;
}

interface QuoteItem {
  id: string;
  quote: string;
  author: string;
  theme: string;
  tag: string;
  accent: string;
  icon: 'sun' | 'flame' | 'moon' | 'wind' | 'heart';
}

export const MotivationalQuotesCard: React.FC<MotivationalQuotesCardProps> = ({
  prediction,
  profile,
  currentLog,
}) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const phase = prediction.phase;
  const phaseName = prediction.phaseDisplayName;
  const day = prediction.currentDayInCycle;
  const symptoms = currentLog?.symptoms || profile.symptoms || [];
  const flow = currentLog?.flow || profile.flowIntensity || 'none';
  const cramps = currentLog?.cramps || profile.crampIntensity || 'none';
  const mood = currentLog?.mood || 'calm';

  // Generate tailored quote library based on entered info
  const quoteLibrary: QuoteItem[] = useMemo(() => {
    const list: QuoteItem[] = [];

    // --- PHASE SPECIFIC QUOTES ---
    if (phase === 'ovulation') {
      list.push(
        {
          id: 'ov-1',
          quote: "You are at your peak creative power and natural magnetism. Trust your voice, step into the spotlight, and celebrate the vitality pulsing through you.",
          author: "Cycle Wisdom",
          theme: "Radiance & Vitality",
          tag: `Day ${day} • Ovulation Peak`,
          accent: "from-amber-500/20 via-rose-500/15 to-purple-500/20 border-amber-500/30",
          icon: 'sun',
        },
        {
          id: 'ov-2',
          quote: "Your confidence is not an accident—it's nature aligning with your strength. Speak your truth boldly and let your enthusiasm lead the way.",
          author: "Flawsome Affirmation",
          theme: "Magnetic Confidence",
          tag: `Day ${day} • Ovulation Radiance`,
          accent: "from-rose-500/20 via-pink-500/20 to-amber-500/15 border-rose-500/30",
          icon: 'flame',
        },
        {
          id: 'ov-3',
          quote: "When your energy shines brightest, you inspire everyone around you simply by showing up authentically.",
          author: "Empowerment Mantra",
          theme: "Unstoppable Energy",
          tag: `Day ${day} • High Vitality`,
          accent: "from-pink-500/20 via-rose-500/20 to-orange-500/15 border-pink-500/30",
          icon: 'sparkles' as any,
        }
      );
    } else if (phase === 'follicular') {
      list.push(
        {
          id: 'fol-1',
          quote: "A fresh cycle brings fresh beginnings. Your mind is sharp, your curiosity is awakened, and any seed you plant today has the power to flourish.",
          author: "Cycle Wisdom",
          theme: "New Beginnings & Clarity",
          tag: `Day ${day} • Follicular Rise`,
          accent: "from-emerald-500/20 via-teal-500/15 to-cyan-500/20 border-emerald-500/30",
          icon: 'wind',
        },
        {
          id: 'fol-2',
          quote: "You don't have to have it all figured out. Just take one inspired, energizing step forward today.",
          author: "Flawsome Affirmation",
          theme: "Rising Momentum",
          tag: `Day ${day} • Rising Energy`,
          accent: "from-teal-500/20 via-emerald-500/20 to-lime-500/15 border-teal-500/30",
          icon: 'sun',
        }
      );
    } else if (phase === 'luteal') {
      list.push(
        {
          id: 'lut-1',
          quote: "Your intuition is speaking louder now. Slow down, honor your boundaries, and give yourself the grace to decline what drains your peace.",
          author: "Cycle Wisdom",
          theme: "Intuitive Boundary Setting",
          tag: `Day ${day} • Luteal Wisdom`,
          accent: "from-purple-500/20 via-indigo-500/15 to-rose-500/20 border-purple-500/30",
          icon: 'moon',
        },
        {
          id: 'lut-2',
          quote: "Slowing down is not giving up. It is the sacred pause that allows your mind and body to recalibrate with truth.",
          author: "Flawsome Affirmation",
          theme: "Honoring Your Pace",
          tag: `Day ${day} • Gentle Energy`,
          accent: "from-indigo-500/20 via-purple-500/20 to-pink-500/15 border-indigo-500/30",
          icon: 'heart',
        }
      );
    } else {
      // Menstrual phase
      list.push(
        {
          id: 'men-1',
          quote: "Your body is performing a miraculous renewal. Rest is not a reward you earn; it is the foundation of your resilience.",
          author: "Cycle Wisdom",
          theme: "Rest & Renewal",
          tag: `Day ${day} • Menstrual Care`,
          accent: "from-rose-500/25 via-pink-500/20 to-red-500/20 border-rose-500/40",
          icon: 'heart',
        },
        {
          id: 'men-2',
          quote: "Listen to the quiet whispers of your body. Wrap yourself in warmth, sip something nourishing, and let the world wait.",
          author: "Flawsome Affirmation",
          theme: "Nurturing Self-Care",
          tag: `Day ${day} • Sacred Rest`,
          accent: "from-pink-500/25 via-rose-500/20 to-purple-500/20 border-pink-500/40",
          icon: 'moon',
        }
      );
    }

    // --- SYMPTOM & PHYSICAL INPUT SPECIFIC QUOTES ---
    if (cramps === 'severe' || cramps === 'moderate' || symptoms.includes('cramps')) {
      list.push({
        id: 'cramp-sym',
        quote: "Breathe into the tension and soften your shoulders. Your body is doing intense physical work; give it patience, warmth, and gentle kindness.",
        author: "Body Compassion",
        theme: "Pelvic Comfort & Release",
        tag: `Tailored for Cramp Relief`,
        accent: "from-rose-600/20 via-amber-500/15 to-red-500/20 border-rose-400/30",
        icon: 'heart',
      });
    }

    if (mood === 'anxious' || mood === 'emotional' || mood === 'irritable' || symptoms.includes('mood')) {
      list.push({
        id: 'mood-sym',
        quote: "Whatever you are feeling right now is completely valid. Emotions are passing weather; your inner peace is the unchanging sky.",
        author: "Mindful Reflection",
        theme: "Emotional Harmony",
        tag: `Tailored for Emotional Calm`,
        accent: "from-violet-500/20 via-purple-500/15 to-pink-500/20 border-violet-400/30",
        icon: 'moon',
      });
    }

    if (symptoms.includes('fatigue') || symptoms.includes('sleep') || symptoms.includes('low_energy')) {
      list.push({
        id: 'fatigue-sym',
        quote: "When tired, learn to rest, not to quit. Your worth is measured by who you are, never by your productivity on low-energy days.",
        author: "Wellness Mantra",
        theme: "Restorative Grace",
        tag: `Tailored for Energy Restoration`,
        accent: "from-blue-500/20 via-indigo-500/15 to-teal-500/20 border-blue-400/30",
        icon: 'wind',
      });
    }

    if (flow === 'heavy' || flow === 'medium') {
      list.push({
        id: 'flow-sym',
        quote: "Hydrate, nourish with iron-rich foods, and honor the natural rhythm of release. You are stronger than you know.",
        author: "Flawsome Care",
        theme: "Physical Vitality",
        tag: `Tailored for Flow Support`,
        accent: "from-rose-500/20 via-red-500/15 to-pink-500/20 border-rose-400/30",
        icon: 'heart',
      });
    }

    // Always include a universal empowering Flawsome quote
    list.push({
      id: 'universal-1',
      quote: "You are wonderfully flawed, wonderfully awesome—perfect in your continuous evolution. Trust the intelligence of your cycle.",
      author: "Flawsome Philosophy",
      theme: "Unconditional Self-Love",
      tag: "Flawsome Daily Affirmation",
      accent: "from-pink-500/20 via-rose-500/15 to-purple-500/20 border-pink-500/30",
      icon: 'sparkles' as any,
    });

    return list;
  }, [phase, phaseName, day, symptoms, flow, cramps, mood]);

  // Safe index handler
  const currentQuote = quoteLibrary[quoteIndex % quoteLibrary.length] || quoteLibrary[0];

  const handleNextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % quoteLibrary.length);
  };

  const handleCopyQuote = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`"${currentQuote.quote}" — ${currentQuote.author}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'sun':
        return <Sun className="w-4 h-4 text-amber-400" />;
      case 'flame':
        return <Flame className="w-4 h-4 text-rose-400" />;
      case 'moon':
        return <Moon className="w-4 h-4 text-indigo-400" />;
      case 'wind':
        return <Wind className="w-4 h-4 text-teal-400" />;
      case 'heart':
      default:
        return <Heart className="w-4 h-4 text-pink-400 fill-pink-400/20" />;
    }
  };

  return (
    <div
      className={`p-6 rounded-3xl bg-gradient-to-br ${currentQuote.accent} bg-[#161618] border backdrop-blur-md shadow-xl relative overflow-hidden transition-all duration-500 space-y-4`}
    >
      {/* Subtle Background Graphic */}
      <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 rounded-full bg-rose-500/10 blur-2xl pointer-events-none"></div>

      {/* Top Header with dynamic context tag and actions */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
            {renderIcon(currentQuote.icon)}
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-300 block">
              {currentQuote.theme}
            </span>
            <span className="text-[11px] text-zinc-400 font-medium">{currentQuote.tag}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyQuote}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-all cursor-pointer"
            title="Copy quote"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleNextQuote}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold"
            title="Next affirmation"
          >
            <RefreshCw className="w-3.5 h-3.5 text-rose-400 hover:rotate-180 transition-transform duration-300" />
            <span className="hidden sm:inline text-[11px]">Shuffle</span>
          </button>
        </div>
      </div>

      {/* Quote Body */}
      <div className="relative z-10 space-y-2.5 pt-1">
        <div className="flex items-start gap-2.5">
          <Quote className="w-6 h-6 text-rose-400/50 shrink-0 rotate-180 -mt-1" />
          <p className="text-sm sm:text-base font-semibold text-white/95 leading-relaxed tracking-tight italic">
            "{currentQuote.quote}"
          </p>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[11px] text-zinc-400">
          <span className="font-medium text-rose-300/90">— {currentQuote.author}</span>
          <span className="text-[10px] text-zinc-500 font-mono">
            Affirmation {((quoteIndex % quoteLibrary.length) + 1)} of {quoteLibrary.length}
          </span>
        </div>
      </div>
    </div>
  );
};
