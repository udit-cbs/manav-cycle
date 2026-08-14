import React, { useState } from 'react';
import { ArrowRight, Heart, ShieldCheck, Mail, LogIn, Sparkles, Calendar } from 'lucide-react';
import { LiveMovingOcean } from './LiveMovingOcean';
import { FlawsomeLogo } from './FlawsomeLogo';
import { UserProfile } from '../types';
import { loginWithGoogleDirectly } from '../lib/firebaseAuth';
import { syncUserProfileFromCloudOrLocal } from '../lib/userStorage';
import { formatDateYYYYMMDD } from '../utils/cycleCalculations';

interface WelcomeFrontPageProps {
  profile: UserProfile;
  onSaveProfile: (updated: UserProfile) => void;
  onStart: () => void;
  onOpenLogin: () => void;
}

export const WelcomeFrontPage: React.FC<WelcomeFrontPageProps> = ({
  profile,
  onSaveProfile,
  onStart,
  onOpenLogin,
}) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const todayStr = formatDateYYYYMMDD(new Date());

  const hasBasicContact = Boolean(
    profile.name && profile.phone && profile.email
  );

  const completedScanToday = Boolean(
    hasBasicContact &&
    profile.lastCompletedOnboardingDate === todayStr
  );

  const handleGoogleLogin = async () => {
    try {
      setIsAuthenticating(true);
      const user = await loginWithGoogleDirectly();
      const synced = await syncUserProfileFromCloudOrLocal(user.email, profile);
      onSaveProfile(synced);
    } catch (err: any) {
      console.warn('Direct sign in cancelled or failed:', err);
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden font-sans select-none text-white p-4">
      {/* Top Header Login bar */}
      <div className="absolute top-4 right-4 z-20">
        {profile.isLoggedIn ? (
          <button
            type="button"
            onClick={onOpenLogin}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-emerald-500/50 backdrop-blur-md text-emerald-300 text-xs font-extrabold shadow-xl cursor-pointer hover:bg-slate-800 transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Connected: {profile.email}</span>
          </button>
        ) : (
          <button
            type="button"
            disabled={isAuthenticating}
            onClick={handleGoogleLogin}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-white/30 hover:border-rose-500 backdrop-blur-md text-white text-xs font-extrabold shadow-xl hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-75"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{isAuthenticating ? 'Signing in...' : 'Sign in with Google'}</span>
          </button>
        )}
      </div>

      {/* Main Content Card */}
      <div className="relative z-10 max-w-lg w-full mx-auto p-6 sm:p-10 rounded-[40px] bg-slate-950/75 border border-white/20 backdrop-blur-2xl shadow-2xl text-center space-y-6 my-auto">
        
        {/* Flawsome Logo Section */}
        <div className="flex flex-col items-center justify-center py-2">
          <FlawsomeLogo size="lg" variant="light" />
        </div>

        {/* Welcome Text */}
        <div className="space-y-2 pt-2 border-t border-white/15">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-purple-200 to-indigo-200">
            Welcome to Flawsome Care
          </h1>
          <p className="text-base sm:text-lg font-bold text-cyan-200/90 tracking-wide">
            ready to map your cycle ?
          </p>
        </div>

        {/* Google Authentication Button */}
        <div className="space-y-2 pt-1">
          {profile.isLoggedIn ? (
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-full p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Google Account Connected ({profile.email})</span>
              </div>
              <button
                type="button"
                onClick={onOpenLogin}
                className="text-[11px] text-zinc-400 hover:text-white underline cursor-pointer"
              >
                Account Details & Sign Out
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={isAuthenticating}
              onClick={handleGoogleLogin}
              className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs shadow-xl transition-all flex items-center justify-center gap-2.5 border border-slate-300 cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-75"
            >
              {/* Official Google Logo SVG */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{isAuthenticating ? 'Connecting with Google...' : 'Sign in with Google'}</span>
            </button>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-1 space-y-2">
          {hasBasicContact && profile.name && (
            <p className="text-xs font-bold text-emerald-300 flex items-center justify-center gap-1.5 animate-in fade-in">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>
                {completedScanToday
                  ? `Welcome back, ${profile.name}! Today's dashboard is ready.`
                  : `Welcome back, ${profile.name}! Starting today's cycle scan.`}
              </span>
            </p>
          )}
          <button
            type="button"
            onClick={onStart}
            className="group relative w-full sm:w-80 py-3.5 px-8 rounded-full bg-gradient-to-r from-[#FF0000] via-rose-600 to-purple-600 hover:from-red-600 hover:to-purple-700 text-white font-extrabold text-base shadow-xl shadow-rose-900/50 hover:shadow-rose-600/60 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-3 mx-auto cursor-pointer border border-white/20"
          >
            <span>
              {!hasBasicContact
                ? 'YES'
                : completedScanToday
                ? 'OPEN CYCLE DASHBOARD'
                : "START TODAY'S CYCLE SCAN"}
            </span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
          </button>
        </div>

        {/* Footer Note */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-300 font-medium pt-1">
          <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
          <span>Private, confidential & connected to your Google account</span>
        </div>

      </div>
    </div>
  );
};


