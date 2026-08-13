import React, { useState, useEffect } from 'react';
import { UserProfile, DailySymptomLog } from './types';
import {
  loadUserProfile,
  saveUserProfile,
  loadSymptomLogs,
  saveSymptomLog,
  getCyclePrediction,
  formatDateYYYYMMDD,
  formatDateLong,
} from './utils/cycleCalculations';
import { Header } from './components/Header';
import { CycleProgressRing } from './components/CycleProgressRing';
import { DayStripCalendar } from './components/DayStripCalendar';
import { SymptomTracker } from './components/SymptomTracker';
import { PackagingReorderCard } from './components/PackagingReorderCard';
import { PhaseAndRemediesSection } from './components/PhaseAndRemediesSection';
import { OnboardingWizard } from './components/OnboardingWizard';
import { Last3PeriodsModal } from './components/Last3PeriodsModal';
import { GeminiAdviceModal } from './components/GeminiAdviceModal';
import { GmailLoginModal } from './components/GmailLoginModal';
import { WelcomeFrontPage } from './components/WelcomeFrontPage';
import { MandatoryUserForm } from './components/MandatoryUserForm';
import { LiveMovingOcean } from './components/LiveMovingOcean';
import { Sparkles, Calendar as CalendarIcon, Info } from 'lucide-react';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(loadUserProfile);
  const [symptomLogs, setSymptomLogs] = useState<Record<string, DailySymptomLog>>(loadSymptomLogs);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Views & Modals state
  const [activeTab, setActiveTab] = useState<'welcome' | 'mandatory_form' | 'calendar_input' | 'dashboard'>('welcome');
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showGeminiModal, setShowGeminiModal] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  useEffect(() => {
    saveUserProfile(profile);
  }, [profile]);

  const selectedDateStr = formatDateYYYYMMDD(selectedDate);
  const currentLog: DailySymptomLog = symptomLogs[selectedDateStr] || {
    date: selectedDateStr,
    flow: 'none',
    cramps: 'none',
    mood: 'calm',
    symptoms: [],
  };

  const prediction = getCyclePrediction(profile, selectedDate);

  const handleSaveProfile = (updated: UserProfile) => {
    setProfile(updated);
    saveUserProfile(updated);
  };

  const handleUpdateSymptomLog = (log: DailySymptomLog) => {
    const updated = { ...symptomLogs, [log.date]: log };
    setSymptomLogs(updated);
    saveSymptomLog(log);
  };

  if (activeTab === 'welcome') {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 font-sans selection:bg-rose-500 selection:text-white">
        <LiveMovingOcean />
        <WelcomeFrontPage
          profile={profile}
          onSaveProfile={handleSaveProfile}
          onStart={() => setActiveTab('mandatory_form')}
          onOpenLogin={() => setShowLoginModal(true)}
        />
        {showLoginModal && (
          <GmailLoginModal
            profile={profile}
            onSaveProfile={handleSaveProfile}
            onClose={() => setShowLoginModal(false)}
          />
        )}
      </div>
    );
  }

  if (activeTab === 'mandatory_form') {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-slate-950 font-sans selection:bg-rose-500 selection:text-white">
        <LiveMovingOcean />
        <MandatoryUserForm
          profile={profile}
          onSaveProfile={handleSaveProfile}
          onComplete={() => setActiveTab('calendar_input')}
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-white flex flex-col font-sans selection:bg-rose-500 selection:text-white overflow-x-hidden">
      {/* Global Purple Moving Ocean Background for All Pages */}
      <LiveMovingOcean />

      {/* Top Navigation Header */}
      <div className="relative z-10">
        <Header
          profile={profile}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenSettings={() => setShowSettings(true)}
          onOpenLogin={() => setShowLoginModal(true)}
        />
      </div>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto pb-12">
        
        {/* INPUTS & WALL CALENDAR VIEW */}
        {activeTab === 'calendar_input' ? (
          <div className="p-4 sm:p-8 flex items-center justify-center min-h-[85vh]">
            <div className="w-full max-w-md mx-auto">
              <OnboardingWizard
                profile={profile}
                onSaveProfile={(p) => {
                  handleSaveProfile(p);
                  setActiveTab('dashboard');
                }}
                onOpenLogin={() => setShowLoginModal(true)}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Top Interactive Row: Cycle Ring + Day Strip + Symptoms + Refill Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 px-2 sm:px-4">
              
              {/* Left Widget Panel (Ring + Day Strip + Symptoms) - Lg: 6 cols */}
              <div className="lg:col-span-6 bg-[#161618] border border-[#27272a] rounded-3xl p-2 sm:p-4 shadow-xl space-y-4">
                
                {/* Circular Ring Tracker */}
                <CycleProgressRing
                  prediction={prediction}
                  onRingClick={() => setShowSettings(true)}
                />

                {/* Day Strip Calendar */}
                <DayStripCalendar
                  selectedDate={selectedDate}
                  onSelectDate={(d) => setSelectedDate(d)}
                  periodDuration={prediction.periodDuration}
                />

                {/* Symptom Tracker Pills */}
                <SymptomTracker
                  currentLog={currentLog}
                  onUpdateLog={handleUpdateSymptomLog}
                  dateLabel={formatDateLong(selectedDate)}
                />

                {/* Packaging Refill Promo Card */}
                <PackagingReorderCard productName={profile.selectedProduct} />
              </div>

              {/* Right Quick Summary & AI Companion Widget - Lg: 6 cols */}
              <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
                
                {/* Quick Info & AI Generator Banner */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-[#1c1c20] to-[#161618] border border-[#27272a] shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-rose-400" />
                      Smart Cycle Companion
                    </span>
                    <span className="text-xs text-zinc-400 font-medium">Age {profile.age || 24}</span>
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-xl font-extrabold text-white">
                      {prediction.phaseDisplayName} Active
                    </h2>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Your current inputs indicate Day <strong className="text-rose-400">{prediction.currentDayInCycle}</strong> of a <strong className="text-white">{prediction.cycleLength}-day</strong> cycle. Next period starts on <strong className="text-white">{formatDateLong(prediction.nextPeriodStartDate)}</strong>.
                    </p>
                  </div>

                  {/* AI Advice Launch Button */}
                  <button
                    onClick={() => setShowGeminiModal(true)}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-500/25 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-rose-200 animate-pulse" />
                    <span>Get AI Personalized Symptom & Food Advice</span>
                  </button>

                  <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-[#27272a]">
                    <span className="flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 text-zinc-400" />
                      Tracked 3 Periods: {profile.last3Periods?.length || 1} logged
                    </span>
                    <button
                      onClick={() => setActiveTab('calendar_input')}
                      className="text-[#FF0000] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <CalendarIcon className="w-3 h-3" />
                      Manage Inputs & Calendar
                    </button>
                  </div>
                </div>

                {/* Packaging QR Note */}
                <div className="p-4 rounded-2xl bg-[#161618] border border-[#27272a] text-xs text-zinc-400 space-y-2">
                  <div className="flex items-center justify-between text-zinc-200 font-semibold">
                    <span>📱 Packaging QR Connection</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Active</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Scanned directly from your product box. All data stays saved locally on your device for fast access whenever you scan again.
                  </p>
                </div>

              </div>

            </div>

            {/* Main Phase & Remedies Section */}
            <PhaseAndRemediesSection
              prediction={prediction}
              profile={profile}
              currentLog={currentLog}
              onOpenGeminiAdvice={() => setShowGeminiModal(true)}
            />

          </div>
        )}

      </main>

      {/* Settings / Last 3 Periods Modal */}
      {showSettings && (
        <Last3PeriodsModal
          profile={profile}
          onSave={handleSaveProfile}
          onClose={() => setShowSettings(false)}
          onReopenOnboarding={() => {
            setShowSettings(false);
            setActiveTab('calendar_input');
          }}
        />
      )}

      {/* Gemini AI Advice Modal */}
      {showGeminiModal && (
        <GeminiAdviceModal
          profile={profile}
          prediction={prediction}
          currentLog={currentLog}
          onClose={() => setShowGeminiModal(false)}
        />
      )}

      {/* Optional Gmail Login Modal */}
      {showLoginModal && (
        <GmailLoginModal
          profile={profile}
          onSaveProfile={handleSaveProfile}
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </div>
  );
}
