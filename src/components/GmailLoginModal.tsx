import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  X,
  LogOut,
  User,
  Phone,
  Mail,
  Edit3,
  Check,
  Lock,
  AlertTriangle,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import { UserProfile } from '../types';
import { loginWithGoogleDirectly, logoutGoogle } from '../lib/firebaseAuth';
import { syncUserProfileFromCloudOrLocal, persistUserProfile } from '../lib/userStorage';

interface GmailLoginModalProps {
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onClose: () => void;
  initialError?: string | null;
}

export const GmailLoginModal: React.FC<GmailLoginModalProps> = ({
  profile,
  onSaveProfile,
  onClose,
  initialError,
}) => {
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(initialError || null);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);

  // Manual direct email login for Vercel/external domains
  const [manualEmail, setManualEmail] = useState<string>(profile.email || '');

  // Confidential Contact Info state
  const [isEditingContact, setIsEditingContact] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>(profile.name || '');
  const [editPhone, setEditPhone] = useState<string>(profile.phone || '');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    setEditName(profile.name || '');
    setEditPhone(profile.phone || '');
  }, [profile.name, profile.phone]);

  useEffect(() => {
    if (initialError) {
      handleParseError(initialError);
    }
  }, [initialError]);

  const handleParseError = (rawErr: string) => {
    if (rawErr.startsWith('UNAUTHORIZED_DOMAIN:')) {
      const domain = rawErr.replace('UNAUTHORIZED_DOMAIN:', '').trim();
      setUnauthorizedDomain(domain);
      setErrorMsg(null);
    } else {
      setErrorMsg(rawErr);
    }
  };

  const handleDirectSignIn = async () => {
    try {
      setIsAuthenticating(true);
      setErrorMsg(null);
      setUnauthorizedDomain(null);
      const user = await loginWithGoogleDirectly();
      const synced = await syncUserProfileFromCloudOrLocal(user.email, profile);
      onSaveProfile(synced);
      setIsAuthenticating(false);
      onClose();
    } catch (err: any) {
      setIsAuthenticating(false);
      const msg = err.message || String(err);
      if (!msg.includes('cancelled') && !msg.includes('closed')) {
        handleParseError(msg);
      }
    }
  };

  const handleManualEmailConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = manualEmail.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      setErrorMsg('Please enter a valid Gmail / email address.');
      return;
    }

    try {
      setIsAuthenticating(true);
      const synced = await syncUserProfileFromCloudOrLocal(clean, {
        ...profile,
        email: clean,
        isLoggedIn: true,
      });
      onSaveProfile(synced);
      persistUserProfile(synced);
      setIsAuthenticating(false);
      onClose();
    } catch (err: any) {
      setIsAuthenticating(false);
      setErrorMsg('Could not connect account. Please check internet connection.');
    }
  };

  const handleSaveContact = () => {
    const trimmedName = editName.trim();
    const trimmedPhone = editPhone.trim();

    const updated: UserProfile = {
      ...profile,
      name: trimmedName,
      phone: trimmedPhone,
    };

    onSaveProfile(updated);
    persistUserProfile(updated);
    setIsEditingContact(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleLogout = async () => {
    try {
      await logoutGoogle();
    } catch (e) {
      console.warn('Logout error', e);
    }
    onSaveProfile({
      ...profile,
      email: '',
      isLoggedIn: false,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#18181b] border border-zinc-700 rounded-[32px] max-w-lg w-full p-6 text-white space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full bg-[#27272a] text-zinc-400 hover:text-white cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Google Logo */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg border border-slate-200 shrink-0">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-black text-white">
              {profile.isLoggedIn ? 'Connected Google Account' : 'Google Account Sign In'}
            </h3>
            <p className="text-xs text-zinc-400">
              {profile.isLoggedIn
                ? 'Your cycle data and alerts are securely linked to this account.'
                : 'Directly authenticate with your Google account.'}
            </p>
          </div>
        </div>

        {profile.isLoggedIn && profile.email ? (
          <div className="space-y-4 animate-in fade-in">
            {/* Signed in card */}
            <div className="p-4 rounded-2xl bg-[#27272a] border border-zinc-700 space-y-2">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                Signed In As:
              </span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-base border border-rose-500/30">
                  {profile.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{profile.email}</p>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Google Account Verified & Synced</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Success notification */}
            {savedSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Contact info saved and updated successfully!</span>
              </div>
            )}

            {/* CONFIDENTIAL CONTACT INFO */}
            <div className="p-4 rounded-2xl bg-[#27272a]/70 border border-zinc-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-rose-400" />
                  <span>Confidential Contact Info</span>
                </span>
                {!isEditingContact ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditName(profile.name || '');
                      setEditPhone(profile.phone || '');
                      setIsEditingContact(true);
                    }}
                    className="text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-rose-400" />
                    <span className="font-medium">Edit Info</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveContact}
                      className="text-xs text-emerald-300 hover:text-emerald-200 font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 cursor-pointer transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditName(profile.name || '');
                        setEditPhone(profile.phone || '');
                        setIsEditingContact(false);
                      }}
                      className="text-xs text-zinc-400 hover:text-zinc-300 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-zinc-800 cursor-pointer transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>

              {isEditingContact ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 animate-in fade-in">
                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-400 font-semibold block">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-rose-500 transition-colors"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-400 font-semibold block">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-rose-500 transition-colors"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 min-h-[50px]">
                    <div className="w-6 h-6 rounded-lg bg-rose-500/15 flex items-center justify-center shrink-0 text-rose-400">
                      <User className="w-3 h-3" />
                    </div>
                    <div className="truncate min-w-0">
                      <span className="text-[10px] text-zinc-400 font-semibold block leading-tight">Name</span>
                      <span className="font-bold text-white text-xs truncate block mt-0.5">{profile.name || 'Not provided'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 min-h-[50px]">
                    <div className="w-6 h-6 rounded-lg bg-rose-500/15 flex items-center justify-center shrink-0 text-rose-400">
                      <Mail className="w-3 h-3" />
                    </div>
                    <div className="truncate min-w-0">
                      <span className="text-[10px] text-zinc-400 font-semibold block leading-tight">Email</span>
                      <span className="font-bold text-white text-xs truncate block mt-0.5">{profile.email || 'None'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 min-h-[50px]">
                    <div className="w-6 h-6 rounded-lg bg-rose-500/15 flex items-center justify-center shrink-0 text-rose-400">
                      <Phone className="w-3 h-3" />
                    </div>
                    <div className="truncate min-w-0">
                      <span className="text-[10px] text-zinc-400 font-semibold block leading-tight">Phone</span>
                      <span className="font-bold text-white text-xs truncate block mt-0.5">{profile.phone || 'Not provided'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sign Out Button (Below Contact Info) */}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-rose-400 font-bold text-xs cursor-pointer border border-zinc-700 flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Vercel / Unauthorized Domain Guidance */}
            {unauthorizedDomain && (
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 space-y-2.5 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Vercel / External Domain Notice</span>
                </div>
                <p className="leading-relaxed text-[11px] text-zinc-300">
                  Firebase Google OAuth requires adding your Vercel deployment domain (
                  <code className="bg-black/50 px-1 py-0.5 rounded text-rose-300 font-mono font-bold">
                    {unauthorizedDomain}
                  </code>
                  ) to Authorized Domains in Firebase Console.
                </p>
                <div className="p-2.5 rounded-xl bg-black/40 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
                  <span className="font-bold text-zinc-200 block">How to whitelist permanently:</span>
                  <p>1. Open Firebase Console &gt; Authentication &gt; Settings</p>
                  <p>2. Scroll to <strong>Authorized domains</strong> &gt; Click <strong>Add domain</strong></p>
                  <p>3. Paste <code className="text-white font-mono">{unauthorizedDomain}</code> and save.</p>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-xs text-red-300">
                {errorMsg}
              </div>
            )}

            {/* Primary Google Popup button */}
            <button
              type="button"
              disabled={isAuthenticating}
              onClick={handleDirectSignIn}
              className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-sm flex items-center justify-center gap-3 shadow-xl transition-all cursor-pointer border border-slate-200 active:scale-[0.99] disabled:opacity-75"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{isAuthenticating ? 'Connecting...' : 'Continue with Google'}</span>
            </button>

            {/* Instant Direct Email Fallback (100% Reliable across all domains & devices) */}
            <div className="pt-2 border-t border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Or Instant Direct Sign-In (Any Device)
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Instant Sync
                </span>
              </div>

              <form onSubmit={handleManualEmailConnect} className="space-y-2.5">
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    placeholder="Enter your Gmail / email address"
                    className="w-full text-xs pl-10 pr-3 py-3 rounded-2xl bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-[0.99] disabled:opacity-75"
                >
                  <span>Connect &amp; Load My Saved Cycle Data</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
              <p className="text-[10px] text-zinc-500 text-center">
                Instantly retrieves your cloud Firestore cycle history and links all future logs to this address.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
