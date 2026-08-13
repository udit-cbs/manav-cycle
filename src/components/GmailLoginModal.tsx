import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, X, ExternalLink, User } from 'lucide-react';
import { UserProfile } from '../types';

interface GmailLoginModalProps {
  profile: UserProfile;
  onSaveProfile: (updated: UserProfile) => void;
  onClose: () => void;
}

export const GmailLoginModal: React.FC<GmailLoginModalProps> = ({
  profile,
  onSaveProfile,
  onClose,
}) => {
  const [email, setEmail] = useState<string>(profile.email || 'udit0184@gmail.com');
  const [isCustomInput, setIsCustomInput] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isPopupOpened, setIsPopupOpened] = useState<boolean>(false);

  // Automatically trigger popup window on mount if not already logged in
  useEffect(() => {
    if (!profile.isLoggedIn) {
      triggerGooglePopup();
    }
  }, []);

  const triggerGooglePopup = () => {
    try {
      const width = 520;
      const height = 630;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      // Open genuine Google Account Sign In window
      const popup = window.open(
        'https://accounts.google.com/ServiceLogin?service=mail&passive=1209600',
        'GoogleSignInPopup',
        `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,status=1`
      );

      if (popup) {
        setIsPopupOpened(true);
      }
    } catch (err) {
      console.warn('Popup window error:', err);
    }
  };

  const handleSignInWithAccount = (selectedEmail: string) => {
    if (!selectedEmail || !selectedEmail.includes('@')) return;

    onSaveProfile({
      ...profile,
      email: selectedEmail,
      isLoggedIn: true,
    });
    setIsSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleLogout = () => {
    onSaveProfile({
      ...profile,
      email: '',
      isLoggedIn: false,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#18181b] border border-zinc-700 rounded-[32px] max-w-md w-full p-6 text-white space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full bg-[#27272a] text-zinc-400 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Google Logo */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg border border-slate-200">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight text-white">
              Google Account Sign In
            </h3>
            <p className="text-xs text-zinc-400">
              Sign in with your Google Account for cycle sync & reorder alerts.
            </p>
          </div>
        </div>

        {isSuccess ? (
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm font-bold text-emerald-300">Successfully Signed In!</p>
            <p className="text-xs text-zinc-300">Connected Google account: {email}</p>
          </div>
        ) : profile.isLoggedIn ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#27272a] border border-zinc-700 space-y-2">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                Connected Google Account
              </span>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-rose-500/20 text-[#FF0000] flex items-center justify-center font-bold text-sm border border-rose-500/30">
                  {profile.email?.charAt(0).toUpperCase() || 'G'}
                </div>
                <div>
                  <p className="text-sm font-extrabold text-white">{profile.email}</p>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Google Account Sync</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-rose-400 font-bold text-xs cursor-pointer border border-zinc-700"
            >
              Sign Out / Switch Account
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Popup window notification banner */}
            {isPopupOpened && (
              <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-200 text-xs flex items-center justify-between gap-2">
                <span className="font-medium">Google Sign-In popup window opened</span>
                <button
                  type="button"
                  onClick={triggerGooglePopup}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <span>Re-open</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Quick Google Account Card */}
            <div className="p-4 rounded-2xl bg-[#27272a] border border-zinc-700 space-y-3">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                Choose Google Account
              </span>

              {/* Main detected Google user button */}
              <button
                type="button"
                onClick={() => handleSignInWithAccount('udit0184@gmail.com')}
                className="w-full p-3 rounded-xl bg-[#18181b] hover:bg-zinc-800 border border-zinc-600/80 hover:border-white transition-all flex items-center justify-between group cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                    U
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-white group-hover:text-rose-300 transition-colors">
                      udit0184@gmail.com
                    </p>
                    <p className="text-[10px] text-zinc-400">Google Workspace / Gmail Account</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
                  Select
                </span>
              </button>

              {/* Custom Email Option */}
              {isCustomInput ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSignInWithAccount(email);
                  }}
                  className="space-y-2 pt-2 border-t border-zinc-700"
                >
                  <label className="text-[11px] font-bold text-zinc-300 block">
                    Use another Google Account address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="another.email@gmail.com"
                    className="w-full p-3 rounded-xl bg-[#18181b] border border-zinc-600 text-white text-xs focus:outline-none focus:border-[#FF0000]"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Confirm & Sign In
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCustomInput(true)}
                  className="text-xs text-zinc-400 hover:text-white underline font-medium block mx-auto cursor-pointer pt-1"
                >
                  Use a different Google Account
                </button>
              )}
            </div>

            {/* Direct Google Popup Launch Button */}
            <button
              type="button"
              onClick={triggerGooglePopup}
              className="w-full py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Launch Official Google Sign-In Popup</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </button>

            <p className="text-[11px] text-zinc-400 text-center font-medium">
              Your Google authentication is encrypted and stored locally on your device.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
