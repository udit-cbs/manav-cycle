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
import { MotivationalQuotesCard } from './components/MotivationalQuotesCard';
import { ConnectedProfileHistoryCard } from './components/ConnectedProfileHistoryCard';
import { Sparkles, Calendar as CalendarIcon, Info } from 'lucide-react';
import { subscribeToAuth, checkRedirectAuth } from './lib/firebaseAuth';
import { syncUserProfileFromCloudOrLocal } from './lib/userStorage';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(loadUserProfile);
  const [symptomLogs, setSymptomLogs] = useState<Record<string, DailySymptomLog>>(loadSymptomLogs);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Views & Modals state
  const [activeTab, setActiveTab] = useState<'welcome' | 'mandatory_form' | 'calendar_input' | 'dashboard'>('welcome');
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showGeminiModal, setShowGeminiModal] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [loginModalError, setLoginModalError] = useState<string | null>(null);

  useEffect(() => {
    saveUserProfile(profile);
  }, [profile]);

  useEffect(() => {
    // Check if returning from a redirect login
    checkRedirectAuth().then(async (redirectUser) => {
      if (redirectUser && redirectUser.email) {
        const synced = await syncUserProfileFromCloudOrLocal(redirectUser.email, profile);
        setProfile(synced);
        saveUserProfile(synced);
      }
    });

    const unsubscribe = subscribeToAuth(async (user) => {
      if (user && user.email) {
        const synced = await syncUserProfileFromCloudOrLocal(user.email, profile);
        setProfile(synced);
        saveUserProfile(synced);
      }
    });
    return () => unsubscribe();
  }, []);

  const selectedDateStr = formatDateYYYYMMDD(selectedDate);
  const currentLog: DailySymptomLog = symptomLogs[selectedDateStr] || {
    date: selectedDateStr,
    flow: profile.flowIntensity || 'none',
    cramps: profile.crampIntensity || 'none',
    mood: 'calm',
    symptoms: profile.symptoms || [],
  };

  const prediction = getCyclePrediction(profile, selectedDate);

  const handleSaveProfile = (updated: UserProfile) => {
    setProfile(updated);
    saveUserProfile(updated);
  };

  const handleStartFromWelcome = () => {
    const todayStr = formatDateYYYYMMDD(new Date());
    const hasBasicContact = Boolean(profile.name && profile.phone && profile.email);

    if (!hasBasicContact) {
      // Brand new user without contact info -> mandatory user form
      setActiveTab('mandatory_form');
      return;
    }

    // Existing user who has contact info filled and linked to Google
    const completedScanToday = profile.lastCompletedOnboardingDate === todayStr;

    if (completedScanToday) {
      // Same day login/return -> land directly at the Cycle Dashboard
      setActiveTab('dashboard');
    } else {
      // New day -> start from daily cycle scan (Step 1 of 8: "When did your last period start?")
      setActiveTab('calendar_input');
    }
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
          onStart={handleStartFromWelcome}
          onOpenLogin={(err) => {
            setLoginModalError(err || null);
            setShowLoginModal(true);
          }}
        />
        {showLoginModal && (
          <GmailLoginModal
            profile={profile}
            onSaveProfile={handleSaveProfile}
            onClose={() => {
              setShowLoginModal(false);
              setLoginModalError(null);
            }}
            initialError={loginModalError}
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
          onSaveProfile={handleSaveProfile}
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
              
              {/* Left Widget Panel (Ring + Day Strip + Symptoms + Motivational Quotes + Refill Card) - Lg: 6 cols */}
              <div className="lg:col-span-6 bg-[#161618] border border-[#27272a] rounded-3xl p-4 sm:p-6 shadow-xl space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
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

                  {/* Motivational & Cycle Affirmation Quotes Card */}
                  <MotivationalQuotesCard
                    prediction={prediction}
                    profile={profile}
                    currentLog={currentLog}
                  />
                </div>

                {/* Packaging Refill Promo Card at bottom */}
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
                    <span>Ask AI Period Doubts, Symptoms & Food Advice</span>
                  </button>

                  <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-[#27272a]">
                    <span className="flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 text-zinc-400" />
                      Tracked 3 Periods: {profile.last3Periods?.length || 1} logged
                    </span>
                    <span className="text-[10px] text-zinc-500 font-medium">
                      Google Cloud Synced
                    </span>
                  </div>
                </div>

                {/* Google-Connected User Saved Profile & History Card */}
                <ConnectedProfileHistoryCard
                  profile={profile}
                  onSaveProfile={handleSaveProfile}
                  onRetakeScan={() => setActiveTab('calendar_input')}
                  onOpenLogin={() => setShowLoginModal(true)}
                />

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
          onClose={() => {
            setShowLoginModal(false);
            setLoginModalError(null);
          }}
          initialError={loginModalError}
        />
      )}
    </div>
  );
}
