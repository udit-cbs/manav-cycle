import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile } from '../types';
import { DEFAULT_PROFILE } from '../utils/cycleCalculations';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

const PROFILE_KEY = 'period_tracker_profile_v1';

export function getPerUserStorageKey(email: string): string {
  return `flawsome_profile_${email.trim().toLowerCase()}`;
}

/**
 * Loads user profile from local storage and checks per-email storage if email is known.
 */
export function getSavedProfileForEmail(email: string): UserProfile | null {
  try {
    const key = getPerUserStorageKey(email);
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_PROFILE, ...parsed };
    }
  } catch (e) {
    console.warn('Could not read user profile for email', email, e);
  }
  return null;
}

/**
 * Save user profile to both primary local storage and user-specific local storage,
 * and asynchronously saves to Firestore under users/{email}.
 */
export async function persistUserProfile(profile: UserProfile): Promise<void> {
  try {
    // Primary general storage
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));

    // Per-email storage if email is available
    if (profile.email && profile.email.includes('@')) {
      const key = getPerUserStorageKey(profile.email);
      localStorage.setItem(key, JSON.stringify(profile));

      // Asynchronously sync with Firestore
      try {
        const userDocRef = doc(db, 'users', profile.email.toLowerCase().trim());
        await setDoc(userDocRef, {
          ...profile,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      } catch (firestoreErr) {
        console.warn('Firestore sync note (fallback to local):', firestoreErr);
      }
    }
  } catch (e) {
    console.error('Failed to persist user profile', e);
  }
}

/**
 * Fetches user profile for a given email from Firestore or local storage.
 */
export async function syncUserProfileFromCloudOrLocal(email: string, currentProfile: UserProfile): Promise<UserProfile> {
  const cleanEmail = email.toLowerCase().trim();
  let loadedProfile: UserProfile | null = null;

  // 1. Try local per-user cache first for instant response
  const localCached = getSavedProfileForEmail(cleanEmail);
  if (localCached && (localCached.completedOnboarding || localCached.name)) {
    loadedProfile = { ...currentProfile, ...localCached, email: cleanEmail, isLoggedIn: true };
  }

  // 2. Try Firestore cloud sync
  try {
    const userDocRef = doc(db, 'users', cleanEmail);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as Partial<UserProfile>;
      loadedProfile = {
        ...DEFAULT_PROFILE,
        ...currentProfile,
        ...localCached,
        ...data,
        email: cleanEmail,
        isLoggedIn: true,
      };
      // update local storage cache with cloud data
      localStorage.setItem(getPerUserStorageKey(cleanEmail), JSON.stringify(loadedProfile));
      localStorage.setItem(PROFILE_KEY, JSON.stringify(loadedProfile));
    }
  } catch (cloudErr) {
    console.warn('Could not fetch user from cloud firestore:', cloudErr);
  }

  if (loadedProfile) {
    return loadedProfile;
  }

  // If new user with no previous data, return current with email
  const newProfile: UserProfile = {
    ...currentProfile,
    email: cleanEmail,
    isLoggedIn: true,
  };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile));
  return newProfile;
}
