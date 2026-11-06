import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signInWithCredential,
  getRedirectResult,
  signOut as fbSignOut,
  setPersistence,
  browserLocalPersistence,
  User as FirebaseUser,
} from 'firebase/auth';

export const GOOGLE_CLIENT_ID =
  '289924631895-oj8kctqscscjf11ar9ecdug7ul8iektr.apps.googleusercontent.com';

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

// Explicitly configure browserLocalPersistence so auth credentials
// survive across mobile tab changes, redirects, and browser restarts.
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn('Firebase persistence warning:', err);
  });
}

export const googleProvider = new GoogleAuthProvider();
// Force Google to show the authentic account picker screen so the user selects their real Google account
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
};

/**
 * Sign in to Firebase Authentication using a Google ID Token
 * (obtained via Google Identity Services or native Credential Manager)
 */
export const signInWithGoogleIdToken = async (
  idToken: string
): Promise<{
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}> => {
  const credential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(auth, credential);
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
};

/**
 * Triggers Google Authentication for Web Browsers.
 * Uses Google Identity Services / popup flow to avoid mobile storage-partitioned sessionStorage loss.
 */
export const signInWithGoogleReal = async (): Promise<{
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}> => {
  // Desktop & popup-compatible browsers: use direct popup flow
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
    if (err.code === 'auth/configuration-not-found' || err.code === 'auth/operation-not-allowed') {
      const configErr: any = new Error(
        'Google Authentication is not yet enabled in Firebase Console for project "servejoy-pos-live".'
      );
      configErr.code = 'auth/configuration-not-found';
      throw configErr;
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
  } catch (err: any) {
    console.warn('Redirect auth check notice:', err);
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

