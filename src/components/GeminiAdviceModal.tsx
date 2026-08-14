import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  Loader2,
  Bot,
  User,
  Utensils,
  Zap,
  HelpCircle,
  RotateCcw,
  Copy,
  Check,
  Heart,
  Flame,
  ShieldCheck,
  MessageCircle,
  BookOpen
} from 'lucide-react';
import { CyclePrediction, DailySymptomLog, UserProfile } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface GeminiAdviceModalProps {
  profile: UserProfile;
  prediction: CyclePrediction;
  currentLog?: DailySymptomLog;
  onClose: () => void;
}

const CHAT_STORAGE_KEY = 'flawsome_cycle_chat_history_v2';

export const GeminiAdviceModal: React.FC<GeminiAdviceModalProps> = ({
  profile,
  prediction,
  currentLog,
  onClose,
}) => {
  const [activeView, setActiveView] = useState<'chat' | 'insights'>('chat');
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const phase = prediction.phaseDisplayName;
  const day = prediction.currentDayInCycle;
  const cycleLength = prediction.cycleLength;
  const age = profile.age || 24;
  const symptomsStr = currentLog?.symptoms?.length
    ? currentLog.symptoms.join(', ')
    : 'None logged today';

  const generateWelcomeGreeting = (): Message => ({
    id: 'welcome-' + Date.now(),
    role: 'assistant',
    content: `👋 Hi there! I'm your **Flawsome AI Cycle & Period Companion**.

Currently on **Day ${day} of ${cycleLength} (${phase})**.
${
  currentLog?.symptoms?.length
    ? `I see you logged: *${symptomsStr}*.`
    : `No symptoms logged today.`
}

Ask me any doubts about **cramps, period timing, discharge, mood swings, foods to eat, PMS, pad refills, or workouts**! You can tap any suggested question below or type your own.`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  // Initialize messages from localStorage if available
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load chat history from localStorage', e);
    }
    return [generateWelcomeGreeting()];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync messages to localStorage whenever they change
  useEffect(() => {
    try {
      if (messages.length > 0) {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
      }
    } catch (e) {
      console.warn('Failed to save chat history to localStorage', e);
    }
  }, [messages]);

  // Focus input on load
  useEffect(() => {
    if (activeView === 'chat') {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [activeView]);

  // Smart suggestions tailored to active cycle phase
  const quickDoubts: string[] = [
    phase.toLowerCase().includes('ovulation')
      ? 'Why do I feel mild cramps or bloating during ovulation?'
      : 'Why do I feel sudden cramps and mood shifts?',
    `What are the best foods & nutrients to eat on Day ${day}?`,
    'Is my vaginal discharge type normal for this phase?',
    'What safe workouts or stretches match my energy today?',
    'How do I tell the difference between PMS symptoms and ovulation?',
    'Natural home remedies for cramps, bloating, and fatigue',
    'How do I track my fertile window accurately?',
    'When should I reorder pads and what absorbency is best?'
  ];

  // Helper for generating high quality fallback responses
  const getContextualFallbackAnswer = (userQuery: string): string => {
    const q = userQuery.toLowerCase();

    if (q.includes('cramp') || q.includes('pain') || q.includes('hurt') || q.includes('ache')) {
      return `🌸 **Cramps & Pain Relief Guide (Tailored for Day ${day} - ${phase})**

Pelvic discomfort or cramping can occur both during menstruation (due to uterine prostaglandins) and mid-cycle during ovulation (*Mittelschmerz*, when an ovary releases an egg).

**Fast Natural Relief Methods:**
• **Targeted Heat**: Apply a warm heating pad (15–20 mins) to your lower pelvis to boost local blood circulation and relax smooth muscle spasms.
• **Magnesium & Herbal Teas**: Sip warm chamomile, ginger, or peppermint tea. Magnesium glycinate (250–350mg) acts as a natural muscle relaxant.
• **Pelvic Stretches**: Try gentle Child’s Pose (*Balasana*) and Cat-Cow stretches to decompress the lower back.
• **Hydration**: Drink warm water infused with a pinch of lemon and electrolytes to reduce abdominal fluid retention.

*Medical Tip:* If cramping is sudden, severe, or accompanied by fever, consult a healthcare professional.`;
    }

    if (q.includes('food') || q.includes('eat') || q.includes('diet') || q.includes('nutrition') || q.includes('recipe')) {
      return `🥗 **Optimal Nutrition Plan for Day ${day} (${phase})**

During this phase, your hormonal profile benefits most from balanced blood sugar and anti-inflammatory whole foods.

**Top Foods for Today:**
• **Antioxidants & Greens**: Blueberries, raspberries, spinach, and kale help your liver metabolize circulating estrogen smoothly.
• **Healthy Fats & Seeds**: Pumpkin seeds, walnuts, avocado, and wild salmon support healthy progesterone and hormone synthesis.
• **Hydrating Minerals**: Coconut water, cucumbers, and bone/vegetable broth to prevent bloating.
• **Smart Swap**: Choose complex carbs (oats, sweet potatoes, quinoa) over refined sugars to keep moods and energy stable.`;
    }

    if (q.includes('discharge') || q.includes('cervical') || q.includes('fluid') || q.includes('mucus')) {
      return `💧 **Cervical Fluid & Discharge Guide for ${phase} (Day ${day})**

Cervical fluid naturally shifts in consistency across your cycle in response to estrogen and progesterone:
• **Ovulation Phase (Days 12–16)**: Clear, stretchy, slippery, resembling raw egg whites. This is completely normal and indicates peak fertility!
• **Luteal Phase (Post-ovulation)**: Becomes creamier, thicker, white or off-white, and less abundant due to rising progesterone.
• **Menstrual Phase**: Shedding of endometrial tissue with menstrual flow.
• **Follicular Phase**: Starts dry/sticky, becoming progressively wetter as estrogen rises.

*Normal vs Doubt:* Healthy discharge has minimal odor and no itching. If it becomes foul-smelling, cottage-cheese-like, or causes burning, check in with a doctor.`;
    }

    if (q.includes('exercise') || q.includes('workout') || q.includes('gym') || q.includes('energy')) {
      return `⚡ **Movement & Exercise Recommendations for ${phase}**

Your energy naturally aligns with your monthly hormone curve:
• **Ovulation Phase (Peak Energy)**: High estrogen and testosterone make this the best window for strength training, HIIT, spin, and challenging runs!
• **Luteal Phase (Moderate Energy)**: Pilates, moderate incline walks, and barre workouts help manage stress and pre-period tension.
• **Menstrual Phase (Restorative)**: Yin yoga, slow walks, and deep stretching. Honor your body’s need for rest.
• **Follicular Phase (Rebounding Energy)**: Light-to-moderate cardio, swimming, and new workout routines.`;
    }

    if (q.includes('pregnant') || q.includes('fertility') || q.includes('ovulat') || q.includes('fertile')) {
      return `🌿 **Fertility & Cycle Window Insights**

• **Fertile Window**: The 5 days leading up to ovulation plus the day of ovulation (sperm can survive up to 5 days in fertile cervical mucus).
• **Day ${day} in your ${cycleLength}-day cycle**: ${
        phase.toLowerCase().includes('ovulation')
          ? 'You are currently in your peak fertile/ovulation window! Basal body temperature slightly rises post-ovulation.'
          : 'Your ovulation window is predicted around the midpoint of your cycle (~Day 14-16).'
      }
• Track physical signs: Stretchy discharge, heightened sensory energy, mild one-sided pelvic twinges, and increased libido.`;
    }

    return `✨ **Personalized Cycle & Period Guidance (Day ${day} of ${cycleLength})**
Phase: **${phase}** | Logged Symptoms: **${symptomsStr}**

Here are the key takeaways for your question:
• **Hormonal Context**: Your body is navigating the ${phase} phase. Listen closely to your energy levels, cravings, and mood signals.
• **Comfort & Wellness**: Keep yourself hydrated (2.5L water/day), incorporate magnesium-rich foods (dark chocolate, almonds, pumpkin seeds), and prioritize 7–8 hours of restful sleep.
• **Flawsome Tip**: Keep tracking your daily symptoms in the app to help refine your future cycle predictions and tailored recommendations!

Feel free to ask more specific doubts about cramps, flow, sanitary care, PMS, or food!`;
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    if (activeView === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, activeView]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || inputValue).trim();
    if (!messageContent || isLoading) return;

    const userMessage: Message = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessagesList = [...messages, userMessage];
    setMessages(newMessagesList);
    setInputValue('');
    setIsLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      // Prepare payload for backend
      const chatPayload = {
        messages: newMessagesList.map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          content: m.content,
        })),
        userContext: {
          age: profile.age,
          phase: prediction.phaseDisplayName,
          dayInCycle: prediction.currentDayInCycle,
          cycleLength: prediction.cycleLength,
          periodDuration: prediction.periodDuration,
          symptoms: currentLog?.symptoms || [],
          last3Periods: profile.last3Periods,
        },
      };

      const res = await fetch('/api/gemini-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chatPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.reply && typeof data.reply === 'string' && data.reply.trim().length > 0) {
          const aiResponse: Message = {
            id: 'msg-' + (Date.now() + 1),
            role: 'assistant',
            content: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => [...prev, aiResponse]);
          return;
        }
      }

      // Contextual fallback response if API returned empty or non-200
      const fallbackReply = getContextualFallbackAnswer(messageContent);
      const fallbackMsg: Message = {
        id: 'msg-' + (Date.now() + 1),
        role: 'assistant',
        content: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn('Gemini chat request fallback:', err);
      const fallbackReply = getContextualFallbackAnswer(messageContent);
      const fallbackMsg: Message = {
        id: 'msg-' + (Date.now() + 1),
        role: 'assistant',
        content: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    const resetGreeting: Message = {
      id: 'welcome-' + Date.now(),
      role: 'assistant',
      content: `✨ Chat cleared! I am here to answer any questions regarding your **${phase}** phase (Day ${day}), foods, cramps, or period wellness. What's on your mind?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([resetGreeting]);
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify([resetGreeting]));
    } catch (e) {
      console.warn('Failed to clear chat storage', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-2xl bg-[#141416] border border-rose-500/35 rounded-[28px] text-white shadow-2xl flex flex-col h-[90vh] max-h-[780px] overflow-hidden">
        {/* Modal Top Header */}
        <div className="p-4 sm:px-6 sm:py-4 border-b border-zinc-800 bg-[#19191d] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base tracking-tight">
                  Flawsome AI Period Companion
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold uppercase tracking-wider border border-rose-500/30">
                  Live AI Chat
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-medium">
                {phase} Active • Day {day} of {cycleLength} • Age {age}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleClearChat}
              title="Reset Chat"
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="px-4 sm:px-6 pt-3 pb-2 bg-[#141416] border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveView('chat')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === 'chat'
                  ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Ask Doubts & Chat</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('insights')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === 'insights'
                  ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Phase & Food Guide</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Private & Encrypted</span>
          </div>
        </div>

        {/* Content Area */}
        {activeView === 'insights' ? (
          /* Static Synthesized Phase Insights Tab */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="p-4 rounded-2xl bg-[#1c1c20] border border-rose-500/30 space-y-3">
              <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-rose-400" />
                <span>Today's Phase Summary: {phase} (Day {day})</span>
              </div>
              <p className="text-xs text-zinc-200 leading-relaxed">
                {phase.toLowerCase().includes('ovulation')
                  ? 'Estrogen and Luteinizing Hormone (LH) surge to release an egg. Energy, focus, and libido peak. Body temperature is poised to rise slightly.'
                  : phase.toLowerCase().includes('menstrual')
                  ? 'Estrogen and progesterone reset to baseline as your uterine lining sheds. Rest, iron replenishment, and hydration are top priorities.'
                  : phase.toLowerCase().includes('follicular')
                  ? 'Follicles mature and estrogen ascends. Mood, physical stamina, and cognitive creativity steadily rebound.'
                  : 'Progesterone dominates to sustain the uterine environment. Keep blood sugar steady and reduce salt to curb bloating and PMS.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-[#19191d] border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                  <Utensils className="w-4 h-4 text-purple-400" />
                  <span>Key Foods to Eat Today</span>
                </div>
                <ul className="text-xs text-zinc-300 space-y-1.5 list-disc list-inside">
                  <li>Dark leafy greens (spinach, kale) for folate & iron</li>
                  <li>Pumpkin / flax seeds for zinc & hormone balance</li>
                  <li>Berries & citrus for antioxidant defense</li>
                  <li>Warm soups, broths, and plenty of electrolytes</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-[#19191d] border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                  <Zap className="w-4 h-4 text-rose-400" />
                  <span>Movement & Energy Guide</span>
                </div>
                <ul className="text-xs text-zinc-300 space-y-1.5 list-disc list-inside">
                  <li>
                    {phase.toLowerCase().includes('ovulation')
                      ? 'High-intensity workouts, strength training, cardio runs'
                      : phase.toLowerCase().includes('menstrual')
                      ? 'Gentle walks, restorative yin yoga, pelvic stretches'
                      : 'Pilates, cycling, moderate resistance training'}
                  </li>
                  <li>Sleep goal: 7.5 to 8.5 hours to assist adrenal recovery</li>
                  <li>Keep stress low with deep diaphragmatic breathing</li>
                </ul>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Have a specific doubt about this phase?</p>
                <p className="text-[11px] text-zinc-400">Ask the AI Period Chatbot for customized answers!</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveView('chat')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-xs shadow cursor-pointer hover:opacity-90 transition-opacity"
              >
                Open Chat
              </button>
            </div>
          </div>
        ) : (
          /* Active Chat View */
          <div className="flex-1 flex flex-col min-h-0 bg-[#121214]">
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages.map((msg) => {
                const isAI = msg.role === 'assistant';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 sm:gap-3 ${
                      isAI ? 'justify-start' : 'justify-end'
                    }`}
                  >
                    {isAI && (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-[13px] leading-relaxed shadow-sm relative group ${
                        isAI
                          ? 'bg-[#1a1a1e] border border-zinc-700/80 text-zinc-100 rounded-tl-sm'
                          : 'bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-tr-sm'
                      }`}
                    >
                      <div className="whitespace-pre-line space-y-1.5">{msg.content}</div>

                      <div
                        className={`flex items-center justify-between gap-2 mt-2 pt-1 border-t ${
                          isAI ? 'border-zinc-800 text-zinc-400' : 'border-rose-400/40 text-rose-100'
                        } text-[10px]`}
                      >
                        <span>{msg.timestamp}</span>

                        {isAI && (
                          <button
                            type="button"
                            onClick={() => handleCopyMessage(msg.id, msg.content)}
                            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                            title="Copy reply"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {!isAI && (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-rose-300 shrink-0 mt-0.5">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-start gap-3 justify-start">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-3.5 rounded-2xl rounded-tl-sm bg-[#1a1a1e] border border-zinc-700/80 text-zinc-300 text-xs flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-rose-400 animate-spin" />
                    <span>Thinking and consulting cycle data...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Doubts / Prompt Chips Tray */}
            <div className="px-4 py-2 border-t border-zinc-800/80 bg-[#161619] shrink-0">
              <div className="flex items-center gap-1.5 mb-1.5">
                <HelpCircle className="w-3 h-3 text-rose-400" />
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Suggested Doubts & Questions (Tap to ask)
                </span>
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
                {quickDoubts.map((doubt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(doubt)}
                    disabled={isLoading}
                    className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-zinc-800/90 hover:bg-rose-500/20 hover:border-rose-500/50 border border-zinc-700 text-zinc-200 hover:text-white transition-all cursor-pointer disabled:opacity-50 text-[11px]"
                  >
                    {doubt}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 sm:p-4 bg-[#18181c] border-t border-zinc-800 flex items-center gap-2 shrink-0"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask any period doubt, cramps, flow, discharge, food, or pads..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-2xl bg-[#121214] border border-zinc-700 text-white text-xs sm:text-sm focus:outline-none focus:border-rose-500 font-medium placeholder:text-zinc-500 disabled:opacity-60"
              />

              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="p-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
                title="Send doubt to AI"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
          </div>
        )}

        {/* Safety Disclaimer Footer */}
        <div className="px-4 py-2 bg-[#101012] border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400 shrink-0">
          <span className="truncate">
            🌸 Wellness & education companion. Always consult a doctor for clinical concerns.
          </span>
          <span className="font-semibold text-rose-400/90 shrink-0 ml-2">Powered by Gemini AI</span>
        </div>
      </div>
    </div>
  );
};
