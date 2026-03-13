'use client';

import { useState } from 'react';
import { GithubIcon, GoogleIcon } from '@/icons/icons';
import { useTranslations } from 'next-intl';
import { signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/lib/firebase';
import { useRouter } from '@/i18n/routing';
import { toast } from 'sonner';

export function SignInWithGoogle() {
  const t = useTranslations('Auth');
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Ensure user document exists in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          totalPoints: 0,
          coins: 0,
          level: 1,
          completedCases: 0,
          role: 'student',
          createdAt: serverTimestamp(),
        });
      }

      toast.success('Successfully logged in with Google!');
      router.push('/dashboard');
    } catch (error: any) {
      if (error.code === 'auth/cancelled-popup-request') {
        // User closed the popup, no need to show an error toast
        return;
      }
      toast.error(error.message || 'Failed to sign in with Google');
      console.error('Google Sign In Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={loading}
      type="button"
      className="bg-gray-100 text-left w-full justify-center dark:hover:bg-white/10 dark:hover:text-white/90 dark:bg-white/5 transition dark:text-gray-400 font-normal text-sm hover:bg-gray-200 rounded-full text-gray-700 hover:text-gray-800 flex items-center gap-3 px-4 sm:px-8 py-2.5 min-h-12 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      <GoogleIcon className="shrink-0" />
      <span>{loading ? '...' : t('google')}</span>
    </button>
  );
}

export function SignInWithGithub() {
  const t = useTranslations('Auth');

  return (
    <button className="bg-gray-100 w-full justify-center dark:hover:bg-white/10 dark:hover:text-white/90 dark:bg-white/5 transition dark:text-gray-400 font-normal text-sm hover:bg-gray-200 rounded-full text-gray-700 hover:text-gray-800 flex items-center gap-3 px-4 sm:px-8 py-2.5 text-left min-h-12">
      <GithubIcon className="size-6 shrink-0" />
      <span>{t('github')}</span>
    </button>
  );
}
