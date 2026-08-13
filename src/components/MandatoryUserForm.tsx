import React, { useState } from 'react';
import { User, Mail, Phone, ArrowRight, ShieldCheck, Lock, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';
import { getCyclePrediction } from '../utils/cycleCalculations';

interface MandatoryUserFormProps {
  profile: UserProfile;
  onSaveProfile: (updated: UserProfile) => void;
  onComplete: () => void;
}

export const MandatoryUserForm: React.FC<MandatoryUserFormProps> = ({
  profile,
  onSaveProfile,
  onComplete,
}) => {
  const [name, setName] = useState(profile.name || '');
  const [email, setEmail] = useState(profile.email || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid Gmail or Email address.');
      return;
    }
    if (!phone.trim() || phone.replace(/[^0-9]/g, '').length < 7) {
      setError('Please enter a valid phone number (at least 7 digits).');
      return;
    }

    onSaveProfile({
      ...profile,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      isLoggedIn: true,
    });

    const prediction = getCyclePrediction({
      ...profile,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      isLoggedIn: true,
    });

    fetch('https://script.google.com/macros/s/AKfycbxWiPZ4kMpx_eHZ6o1Nv2ISsdhJojMIe2vUbg0TdRCo3a9vvKeXGp9nCsVEaWIS4cnz1g/exec', {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        nextPeriod: prediction.nextPeriodStartDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      }),
    });

    onComplete();
  };

  return (
    <div className="relative z-10 max-w-md w-full mx-auto p-6 sm:p-8 rounded-[36px] bg-slate-950/85 border border-white/20 backdrop-blur-2xl shadow-2xl text-white space-y-6 animate-in fade-in zoom-in-95 duration-500 my-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-black uppercase tracking-wider border border-purple-500/30">
          <Lock className="w-3.5 h-3.5 text-rose-400" />
          <span>Mandatory Step</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-purple-200 to-indigo-200">
          Tell us about yourself
        </h2>
        <p className="text-xs text-purple-200/80 font-medium leading-relaxed">
          Please fill in your details below to activate confidential tracking & cycle notifications.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-bold text-center animate-shake">
          {error}
        </div>
      )}

      {/* Form Inputs */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-extrabold text-purple-200 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-rose-400" />
            <span>Full Name <span className="text-rose-400">*</span></span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Sarah Jenkins"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-slate-900/90 border border-purple-500/30 focus:border-rose-500 text-white placeholder-slate-400 font-bold text-sm outline-none transition-all shadow-inner"
          />
        </div>

        {/* Gmail / Email Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-extrabold text-purple-200 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-rose-400" />
              <span>Gmail / Email Address <span className="text-rose-400">*</span></span>
            </span>
            {profile.isLoggedIn && (
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
                <ShieldCheck className="w-3 h-3" /> Auto-filled
              </span>
            )}
          </label>
          <input
            type="email"
            required
            placeholder="e.g. sarah.jenkins@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-slate-900/90 border border-purple-500/30 focus:border-rose-500 text-white placeholder-slate-400 font-bold text-sm outline-none transition-all shadow-inner"
          />
        </div>

        {/* Phone Number Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-extrabold text-purple-200 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-rose-400" />
            <span>Phone Number <span className="text-rose-400">*</span></span>
          </label>
          <input
            type="tel"
            required
            placeholder="e.g. +1 (555) 234-5678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-slate-900/90 border border-purple-500/30 focus:border-rose-500 text-white placeholder-slate-400 font-bold text-sm outline-none transition-all shadow-inner"
          />
        </div>

        {/* Proceed Submit Button */}
        <button
          type="submit"
          className="w-full mt-4 py-4 px-6 rounded-2xl bg-gradient-to-r from-[#FF0000] via-rose-600 to-purple-600 hover:from-red-600 hover:to-purple-700 text-white font-black text-sm shadow-xl shadow-rose-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/20 active:scale-95"
        >
          <span>Proceed to Cycle Mapping</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Confidentiality Footer */}
      <div className="text-center pt-2 border-t border-white/10">
        <p className="text-[11px] text-purple-300/70 font-medium">
          🔒 Your contact details are stored securely on your device & used for period pad alerts.
        </p>
      </div>
    </div>
  );
};
