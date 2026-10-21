import type { FirebaseOptions } from "firebase/app";

export function firebaseWebConfig(): FirebaseOptions | null {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim() ?? "";
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() ?? "";
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() ?? "";
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim() ?? "";
  if (!apiKey || !authDomain || !projectId || !appId) return null;

  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim();
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim();
  return {
    apiKey,
    authDomain,
    projectId,
    appId,
    ...(messagingSenderId ? { messagingSenderId } : {}),
    ...(storageBucket ? { storageBucket } : {}),
  };
}
