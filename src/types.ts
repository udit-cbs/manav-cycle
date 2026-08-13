export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

export interface UserProfile {
  name?: string;
  email?: string;
  phone?: string;
  isLoggedIn?: boolean;
  lastGmailAlertSentDate?: string;
  age: number;
  cycleLength: number; // e.g. 28 days
  periodDuration: number; // e.g. 5 days
  last3Periods: string[]; // YYYY-MM-DD dates of period start dates (ordered latest first)
  completedOnboarding: boolean;
  selectedProduct: string; // e.g. "Organic Ultra-Thin Pads (Pack of 20)"
}

export type FlowLevel = 'none' | 'spotting' | 'light' | 'medium' | 'heavy';
export type CrampSeverity = 'none' | 'mild' | 'moderate' | 'severe';
export type MoodType = 'calm' | 'happy' | 'anxious' | 'irritable' | 'fatigued' | 'emotional';

export interface DailySymptomLog {
  date: string; // YYYY-MM-DD
  flow: FlowLevel;
  cramps: CrampSeverity;
  mood: MoodType;
  symptoms: string[]; // ['bloating', 'acne', 'cravings', 'headache', 'backache', 'insomnia', 'tender_breasts']
  notes?: string;
}

export interface VitaminItem {
  id: string;
  name: string;
  symbol: string; // e.g. "B6", "Fe", "Mg", "D3", "Zn", "C"
  dosage: string;
  keyBenefit: string;
  sources: string[];
  recommendedPhase: CyclePhase[];
  isHighlighted?: boolean;
}

export interface PhaseRemedies {
  phase: CyclePhase;
  displayName: string;
  dayRangeText: string;
  tagline: string;
  description: string;
  foodsToIncrease: { name: string; icon: string; reason: string }[];
  foodsToReduce: string[];
  restAdvice: string;
  exerciseAdvice: string;
  vitaminsHighlighted: VitaminItem[];
}

export interface CyclePrediction {
  currentDayInCycle: number;
  currentPhase: CyclePhase;
  phaseDisplayName: string;
  nextPeriodStartDate: Date;
  daysUntilNextPeriod: number;
  nextPeriodEndDate: Date;
  ovulationDate: Date;
  ovulationWindowStart: Date;
  ovulationWindowEnd: Date;
  cycleLength: number;
  periodDuration: number;
}
