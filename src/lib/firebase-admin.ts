// Firebase Admin Initialization
let adminDb: any = null;
let adminAuth: any = null;

try {
  const admin = require('firebase-admin');
  if (!admin.apps.length) {
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'trunch-store';

    if (clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } else {
      admin.initializeApp({
        projectId,
      });
    }
  }
  adminDb = admin.firestore();
  adminAuth = admin.auth();
} catch (error) {
  // Silent fallback when environment variables are not set during static compilation
}

export { adminDb, adminAuth };
