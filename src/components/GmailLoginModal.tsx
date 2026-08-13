import React, { useState } from 'react';
import { Mail, ShieldCheck, CheckCircle2, X } from 'lucide-react';
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
  const [email, setEmail] = useState<string>(profile.email || '');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    onSaveProfile({
      ...profile,
      email,
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#18181b] border border-zinc-700 rounded-[32px] max-w-md w-full p-6 text-white space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full bg-[#27272a] text-zinc-400 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-[#FF0000]">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight text-white">
              Optional Gmail Sign In
            </h3>
            <p className="text-xs text-zinc-400">
              Get low pad reorder alerts & cycle sync directly in your inbox.
            </p>
          </div>
        </div>

        {isSuccess ? (
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm font-bold text-emerald-300">Successfully Signed In!</p>
            <p className="text-xs text-zinc-300">Logged in as {email}</p>
          </div>
        ) : profile.isLoggedIn ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#27272a] border border-zinc-700 space-y-1">
              <span className="text-[11px] font-bold text-zinc-400 uppercase">Currently Signed In</span>
              <p className="text-sm font-extrabold text-white">{profile.email}</p>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Low pad reorder reminders active</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-rose-400 font-bold text-xs cursor-pointer"
            >
              Log Out
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-zinc-300 block">
                Enter Gmail / Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@gmail.com"
                className="w-full p-3.5 rounded-xl bg-[#27272a] border border-zinc-700 text-white text-sm focus:outline-none focus:border-[#FF0000]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#FF0000] hover:bg-red-700 text-white font-extrabold text-xs shadow-lg shadow-red-900/40 transition-all cursor-pointer"
            >
              Sign In with Gmail
            </button>

            <p className="text-[11px] text-zinc-400 text-center font-medium">
              Optional feature. Your cycle data stays private and safe on your device.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
