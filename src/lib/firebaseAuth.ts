import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('email');
provider.addScope('profile');
provider.setCustomParameters({
  prompt: 'select_account',
});

export async function loginWithGoogleDirectly(): Promise<{ email: string; name: string; photoURL?: string }> {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    return {
      email: user.email || 'user@gmail.com',
      name: user.displayName || 'Google User',
      photoURL: user.photoURL || undefined,
    };
  } catch (error: any) {
    console.error('Direct Google Sign In error:', error);
    // If popup was blocked or closed by user, throw informative message
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in cancelled by user');
    }
    if (error.code === 'auth/popup-blocked') {
      throw new Error('Popup blocked by browser. Please allow popups.');
    }
    throw error;
  }
}

export async function logoutGoogle(): Promise<void> {
  await signOut(auth);
}

export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
