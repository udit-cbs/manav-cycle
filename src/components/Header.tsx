import React from 'react';
import { Calendar, LayoutDashboard, Mail, Settings, User } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  profile: UserProfile;
  activeTab: 'calendar_input' | 'dashboard';
  onSelectTab: (tab: 'calendar_input' | 'dashboard') => void;
  onOpenSettings: () => void;
  onOpenLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  activeTab,
  onSelectTab,
  onOpenSettings,
  onOpenLogin,
}) => {
  return (
    <header className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-[#18181b] border-b border-zinc-800 text-white shadow-md">
      {/* User Brand info */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-[#27272a] border border-zinc-700 flex items-center justify-center text-zinc-300">
              <User className="w-5 h-5 text-[#FF0000]" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#18181b] rounded-full"></span>
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
              Flawsome Care
            </h1>
            <p className="text-xs text-zinc-400 font-medium">
              {profile.age ? `Age ${profile.age} • ` : ''}Cycle: {profile.cycleLength}d
            </p>
          </div>
        </div>

        {/* View switcher tabs for mobile & desktop */}
        <div className="flex items-center gap-1 bg-[#27272a] p-1 rounded-xl border border-zinc-700">
          <button
            onClick={() => onSelectTab('calendar_input')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'calendar_input'
                ? 'bg-[#FF0000] text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Inputs & Calendar</span>
          </button>
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-[#FF0000] text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Cycle Dashboard</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenLogin}
          className={`text-xs px-3.5 py-1.5 rounded-xl border transition-all font-bold flex items-center gap-1.5 cursor-pointer ${
            profile.isLoggedIn
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-[#FF0000]'
          }`}
        >
          <Mail className="w-3.5 h-3.5 text-[#FF0000]" />
          <span>{profile.isLoggedIn ? profile.email?.split('@')[0] : 'Optional Login (Gmail)'}</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="w-9 h-9 rounded-xl bg-[#27272a] hover:bg-[#3f3f46] border border-zinc-700 flex items-center justify-center text-zinc-300 transition-colors cursor-pointer"
          title="Settings & History"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

