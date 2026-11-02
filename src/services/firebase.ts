import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyB5Gg4T2hIHtqXHjiqT1H63W6ZkIBxxqZw',
  authDomain: 'servejoy-pos-live.firebaseapp.com',
  projectId: 'servejoy-pos-live',
  storageBucket: 'servejoy-pos-live.appspot.com',
  messagingSenderId: '1098485743012',
  appId: '1:1098485743012:web:6e5e8e821e25e9e0',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
// Force Google to show the account picker screen so the user can choose which Google account to use
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

/**
 * Triggers the REAL Google Account chooser popup
 */
export const signInWithGoogleReal = async (): Promise<{
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    if (!user.email) {
      throw new Error('No email found on your Google Account.');
    }
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email.split('@')[0],
      photoURL: user.photoURL || undefined,
    };
  } catch (err: any) {
    if (err.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-In cancelled: Popup was closed.');
    }
    if (err.code === 'auth/popup-blocked') {
      // Fallback for mobile Safari / Chrome popup blockers
      await signInWithRedirect(auth, googleProvider);
      throw new Error('Redirecting to Google Sign-In...');
    }
    throw err;
  }
};

/**
 * Check if the user just returned from a Google OAuth redirect
 */
export const checkRedirectResult = async (): Promise<{
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
} | null> => {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user && result.user.email) {
      return {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName || result.user.email.split('@')[0],
        photoURL: result.user.photoURL || undefined,
      };
    }
    return null;
  } catch (err) {
    console.warn('Redirect auth check error:', err);
    return null;
  }
};

export const firebaseLogout = async (): Promise<void> => {
  try {
    await fbSignOut(auth);
  } catch (err) {
    console.warn('Firebase signOut error:', err);
  }
};
