import { CyclePhase, CyclePrediction, DailySymptomLog, UserProfile } from '../types';
import { PHASE_KNOWLEDGE } from '../data/cycleKnowledge';

export const DEFAULT_PROFILE: UserProfile = {
  name: '',
  email: '',
  phone: '',
  isLoggedIn: false,
  age: 24,
  cycleLength: 28,
  periodDuration: 5,
  last3Periods: [
    new Date(Date.now() - 13 * 86400000).toISOString().split('T')[0], // 13 days ago (Day 14 today)
    new Date(Date.now() - 41 * 86400000).toISOString().split('T')[0], // 41 days ago
    new Date(Date.now() - 69 * 86400000).toISOString().split('T')[0], // 69 days ago
  ],
  completedOnboarding: false,
  selectedProduct: 'Organic Ultra-Thin Cotton Pads (Pack of 20)',
};

const PROFILE_KEY = 'period_tracker_profile_v1';
const SYMPTOMS_KEY = 'period_tracker_symptoms_v1';

export function loadUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_PROFILE, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load user profile', e);
  }
  return DEFAULT_PROFILE;
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save user profile', e);
  }
}

export function loadSymptomLogs(): Record<string, DailySymptomLog> {
  try {
    const raw = localStorage.getItem(SYMPTOMS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load symptom logs', e);
  }
  return {};
}

export function saveSymptomLog(log: DailySymptomLog): void {
  try {
    const logs = loadSymptomLogs();
    logs[log.date] = log;
    localStorage.setItem(SYMPTOMS_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save symptom log', e);
  }
}

/**
 * Calculates average cycle length if user provides 2 or 3 past period start dates
 */
export function calculateAverageCycleLength(periodDates: string[]): number {
  if (!periodDates || periodDates.length < 2) return 28;
  const sorted = [...periodDates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  let totalDays = 0;
  let count = 0;
  for (let i = 0; i < sorted.length - 1; i++) {
    const d1 = new Date(sorted[i]).getTime();
    const d2 = new Date(sorted[i + 1]).getTime();
    const diffDays = Math.round((d1 - d2) / (1000 * 3600 * 24));
    if (diffDays > 15 && diffDays < 60) {
      totalDays += diffDays;
      count++;
    }
  }
  return count > 0 ? Math.round(totalDays / count) : 28;
}

export function getCyclePrediction(profile: UserProfile, targetDate: Date = new Date()): CyclePrediction {
  const lastPeriodStart = profile.last3Periods && profile.last3Periods.length > 0
    ? new Date(profile.last3Periods[0] + 'T00:00:00')
    : new Date(Date.now() - 13 * 86400000);

  const cycleLength = profile.cycleLength || calculateAverageCycleLength(profile.last3Periods) || 28;
  const periodDuration = profile.periodDuration || 5;

  const targetTime = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()).getTime();
  const startTime = new Date(lastPeriodStart.getFullYear(), lastPeriodStart.getMonth(), lastPeriodStart.getDate()).getTime();

  let diffDays = Math.floor((targetTime - startTime) / (1000 * 3600 * 24));
  
  // Cycle day calculation (1-indexed)
  let dayInCycle = (diffDays % cycleLength);
  if (dayInCycle < 0) {
    dayInCycle += cycleLength;
  }
  dayInCycle += 1; // Day 1 to Day cycleLength

  // Compute Current Phase
  let phase: CyclePhase = 'menstrual';
  if (dayInCycle <= periodDuration) {
    phase = 'menstrual';
  } else if (dayInCycle < 12) {
    phase = 'follicular';
  } else if (dayInCycle <= 16) {
    phase = 'ovulation';
  } else {
    phase = 'luteal';
  }

  // Next Period Start Date
  const cyclesPassed = Math.floor(diffDays / cycleLength);
  const nextPeriodTime = startTime + ((cyclesPassed + 1) * cycleLength * 86400000);
  const nextPeriodStartDate = new Date(nextPeriodTime);
  
  const daysUntilNextPeriod = Math.max(0, Math.ceil((nextPeriodTime - targetTime) / (1000 * 3600 * 24)));

  const nextPeriodEndDate = new Date(nextPeriodStartDate.getTime() + (periodDuration - 1) * 86400000);

  // Ovulation Date (typically 14 days before next period)
  const ovulationTime = nextPeriodTime - (14 * 86400000);
  const ovulationDate = new Date(ovulationTime);
  const ovulationWindowStart = new Date(ovulationTime - (2 * 86400000));
  const ovulationWindowEnd = new Date(ovulationTime + (2 * 86400000));

  return {
    currentDayInCycle: dayInCycle,
    currentPhase: phase,
    phaseDisplayName: PHASE_KNOWLEDGE[phase].displayName,
    nextPeriodStartDate,
    daysUntilNextPeriod,
    nextPeriodEndDate,
    ovulationDate,
    ovulationWindowStart,
    ovulationWindowEnd,
    cycleLength,
    periodDuration,
  };
}

export function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

export function formatDateLong(date: Date): string {
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDayOfWeek(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

export function formatDateYYYYMMDD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDateHuman(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const date = new Date(year, month, day);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
