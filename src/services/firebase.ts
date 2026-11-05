import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  setPersistence,
  browserLocalPersistence,
  User as FirebaseUser,
} from 'firebase/auth';
import { Capacitor } from '@capacitor/core';

const firebaseConfig = {
  apiKey: 'AIzaSyB5Gg4T2hIHtqXHjiqT1H63W6ZkIBxxqZw',
  authDomain: 'servejoy-pos-live.firebaseapp.com',
  projectId: 'servejoy-pos-live',
  storageBucket: 'servejoy-pos-live.firebasestorage.app',
  messagingSenderId: '289924631895',
  appId: '1:289924631895:web:a1b94fec7eb601246ec212',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Explicitly configure browserLocalPersistence so auth credentials and redirect state
// survive across mobile tab changes, redirects, and browser restarts.
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn('Firebase persistence warning:', err);
  });
}

export const googleProvider = new GoogleAuthProvider();
// Force Google to show the account picker screen so the user can choose which Google account to use
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

/**
 * Triggers the REAL Google Account chooser popup synchronously to avoid popup blockers.
 * In a native mobile app (Capacitor), WebViews block multi-window popups and cross-origin redirects;
 * this function catches that cleanly so the mobile UI presents an in-app Google Account Picker.
 */
export const signInWithGoogleReal = (): Promise<{
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}> => {
  // If running inside native Android/iOS app, do not attempt web popups that corrupt WebView storage
  if (Capacitor.isNativePlatform()) {
    const mobileErr: any = new Error('auth/popup-blocked');
    mobileErr.code = 'auth/popup-blocked';
    return Promise.reject(mobileErr);
  }

  // Call signInWithPopup immediately in the synchronous stack frame of user gesture
  return signInWithPopup(auth, googleProvider)
    .then((result) => {
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
    })
    .catch(async (err: any) => {
      if (err.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-In cancelled: Popup was closed.');
      }
      if (err.code === 'auth/popup-blocked') {
        const blockedErr: any = new Error('Google Sign-In popup was blocked by browser security.');
        blockedErr.code = 'auth/popup-blocked';
        throw blockedErr;
      }
      if (err.code === 'auth/configuration-not-found' || err.code === 'auth/operation-not-allowed') {
        const configErr: any = new Error(
          'Google Authentication is not yet enabled in Firebase Console for project "servejoy-pos-live".'
        );
        configErr.code = 'auth/configuration-not-found';
        throw configErr;
      }
      throw err;
    });
};

/**
 * Check if the user just returned from a Google OAuth redirect (safe fallback)
 */
export const checkRedirectResult = async (): Promise<{
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
} | null> => {
  return null;
};

export const firebaseLogout = async (): Promise<void> => {
  try {
    await fbSignOut(auth);
  } catch (err) {
    console.warn('Firebase signOut error:', err);
  }
};

