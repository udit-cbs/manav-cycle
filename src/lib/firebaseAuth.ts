import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
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

export interface AuthResult {
  email: string;
  name: string;
  photoURL?: string;
}

export async function loginWithGoogleDirectly(): Promise<AuthResult> {
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
    
    // Check for Firebase unauthorized domain error (common when deploying to Vercel, Netlify, custom domains)
    if (error.code === 'auth/unauthorized-domain') {
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'your-domain';
      throw new Error(
        `UNAUTHORIZED_DOMAIN:${currentHost}`
      );
    }
    
    // If popup was blocked or closed by user
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in popup was closed before completing.');
    }
    
    if (error.code === 'auth/popup-blocked') {
      // Try redirect fallback on mobile or popup-blocked browsers
      try {
        await signInWithRedirect(auth, provider);
        return new Promise(() => {}); // Execution will redirect
      } catch (redirectErr: any) {
        throw new Error('Popup blocked by browser. Please allow popups or use direct email sign in.');
      }
    }
    
    throw error;
  }
}

/**
 * Checks for any pending redirect auth result upon page load
 */
export async function checkRedirectAuth(): Promise<AuthResult | null> {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      return {
        email: result.user.email || 'user@gmail.com',
        name: result.user.displayName || 'Google User',
        photoURL: result.user.photoURL || undefined,
      };
    }
  } catch (err) {
    console.warn('Redirect auth check notice:', err);
  }
  return null;
}

export async function logoutGoogle(): Promise<void> {
  try {
    await signOut(auth);
  } catch (e) {
    console.warn('Logout signOut error', e);
  }
}

export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
