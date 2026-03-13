/**
 * Firebase Admin SDK — server-side only.
 * Never import this from client components.
 *
 * Required environment variables:
 *   FIREBASE_ADMIN_PROJECT_ID
 *   FIREBASE_ADMIN_CLIENT_EMAIL
 *   FIREBASE_ADMIN_PRIVATE_KEY  (with literal \n for newlines)
 */
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing Firebase Admin credentials. ' +
        'Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY.'
    );
  }

  return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

export function getAdminFirestore() {
  getAdminApp();
  return getFirestore();
}
