import React, { useState } from 'react';
import { ArrowRight, Heart, ShieldCheck, Mail, LogIn } from 'lucide-react';
import { LiveMovingOcean } from './LiveMovingOcean';
import { UserProfile } from '../types';

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
  const [isLoggingInGoogle, setIsLoggingInGoogle] = useState(false);

  const handleGoogleLogin = () => {
    setIsLoggingInGoogle(true);
    setTimeout(() => {
      onSaveProfile({
        ...profile,
        email: profile.email || 'user.flawsome@gmail.com',
        isLoggedIn: true,
      });
      setIsLoggingInGoogle(false);
    }, 600);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden font-sans select-none text-white p-4">
      {/* Top Header Login bar */}
      <div className="absolute top-4 right-4 z-20">
        {profile.isLoggedIn ? (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-emerald-500/50 backdrop-blur-md text-emerald-300 text-xs font-extrabold shadow-xl">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Logged in: {profile.email}</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenLogin}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-white/30 hover:border-rose-500 backdrop-blur-md text-white text-xs font-extrabold shadow-xl hover:bg-slate-800 transition-all cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 text-rose-400" />
            <span>Sign in with Google / Gmail</span>
          </button>
        )}
      </div>

      {/* Main Content Card */}
      <div className="relative z-10 max-w-lg w-full mx-auto p-6 sm:p-10 rounded-[40px] bg-slate-950/75 border border-white/20 backdrop-blur-2xl shadow-2xl text-center space-y-6 my-auto">
        
        {/* Flawsome Logo Section */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 rounded-full blur-xl opacity-40 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
            
            {/* SVG Logo: Official FLAWSOME Crescent Moon & Silhouette Dancer */}
            <div className="relative w-32 h-36 sm:w-40 sm:h-44 flex items-center justify-center">
              <svg viewBox="0 0 400 480" className="w-full h-full filter drop-shadow-[0_10px_20px_rgba(168,85,247,0.35)]">
                <defs>
                  {/* Moon Lavender-Silver Gradient */}
                  <linearGradient id="flawsomeMoonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#E2D9EC" stopOpacity="0.95" />
                    <stop offset="50%" stopColor="#C4B5FD" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.5" />
                  </linearGradient>

                  {/* Deep Velvet Purple Silhouette Gradient */}
                  <linearGradient id="flawsomeDancerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6B21A8" />
                    <stop offset="45%" stopColor="#581C87" />
                    <stop offset="100%" stopColor="#3B0764" />
                  </linearGradient>

                  <linearGradient id="flawsomePlumeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7E22CE" />
                    <stop offset="100%" stopColor="#3B0764" />
                  </linearGradient>
                </defs>

                {/* 1. Crescent Moon sweeping from top-center down to left and back up */}
                <path
                  d="M 190 12 
                     C 105 55 55 170 120 280 
                     C 165 355 255 375 295 315 
                     C 225 365 145 330 115 255 
                     C 80 170 125 70 190 12 Z"
                  fill="url(#flawsomeMoonGrad)"
                />

                {/* 2. Silhouette Dancer Figure */}
                {/* Right arm touching top tip of crescent moon (190, 12) */}
                <path
                  d="
                    M 190 12
                    C 192 10, 196 14, 195 25
                    C 180 75 160 120 152 160
                    C 160 152, 172 145, 185 142
                    C 200 138, 222 140, 280 155
                    C 285 156, 282 163, 272 166
                    C 230 178, 202 195, 182 205
                    C 168 212, 155 198, 148 180
                    C 142 165, 138 158, 135 156
                    C 135 175, 140 210, 155 255
                    C 170 300, 205 365, 230 405
                    C 232 408, 228 410, 222 402
                    C 198 370, 168 310, 150 265
                    C 132 215, 128 175, 130 138
                    C 135 100, 155 50, 190 12 Z
                  "
                  fill="url(#flawsomeDancerGrad)"
                />

                {/* Head Profile tilted gracefully back facing top right */}
                <path
                  d="
                    M 165 140
                    C 168 126, 182 120, 192 124
                    C 202 128, 205 140, 198 148
                    C 190 152, 172 150, 165 140 Z
                  "
                  fill="url(#flawsomeDancerGrad)"
                />

                {/* 4 Flowing Dress Feathers/Wing Plumes sweeping right and down (Image 1 style) */}
                <path
                  d="
                    M 150 250
                    C 175 300, 215 380, 260 445
                    C 255 415, 215 330, 172 265 Z
                  "
                  fill="url(#flawsomePlumeGrad)"
                />
                <path
                  d="
                    M 145 270
                    C 168 320, 205 405, 238 475
                    C 230 435, 198 350, 162 285 Z
                  "
                  fill="url(#flawsomeDancerGrad)"
                />
                <path
                  d="
                    M 140 290
                    C 160 340, 190 425, 212 470
                    C 205 430, 180 350, 152 305 Z
                  "
                  fill="url(#flawsomePlumeGrad)"
                />
                <path
                  d="
                    M 136 310
                    C 152 355, 175 435, 188 460
                    C 182 425, 162 355, 145 322 Z
                  "
                  fill="url(#flawsomeDancerGrad)"
                />
              </svg>
            </div>
          </div>

          {/* Typography matching official Image 1 logo */}
          <div className="space-y-1">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-[0.25em] text-white uppercase font-serif drop-shadow-lg">
              FLAWSOME
            </h2>
            <p className="text-sm sm:text-base text-purple-200/90 font-serif italic tracking-wider font-medium">
              Flawlessly Awesome
            </p>
          </div>
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
            <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Google Account Connected ({profile.email})</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoggingInGoogle}
              className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs shadow-xl transition-all flex items-center justify-center gap-2.5 border border-slate-300 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              {/* Official Google Logo SVG */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{isLoggingInGoogle ? 'Signing in with Google...' : 'Sign in with Google'}</span>
            </button>
          )}
        </div>

        {/* YES Action Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={onStart}
            className="group relative w-full sm:w-64 py-3.5 px-8 rounded-full bg-gradient-to-r from-[#FF0000] via-rose-600 to-purple-600 hover:from-red-600 hover:to-purple-700 text-white font-extrabold text-base shadow-xl shadow-rose-900/50 hover:shadow-rose-600/60 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-3 mx-auto cursor-pointer border border-white/20"
          >
            <span>YES</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
          </button>
        </div>

        {/* Footer Note */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-300 font-medium pt-1">
          <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
          <span>Private, confidential & saved on your device</span>
        </div>

      </div>
    </div>
  );
};
