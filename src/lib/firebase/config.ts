import "server-only";

import type { FirebaseOptions } from "firebase/app";

/**
 * Public Firebase web config (the same values a browser app ships).
 * The Docker image is built without `.env`, and Next.js replaces
 * `process.env.NEXT_PUBLIC_*` with whatever it saw at `next build`.
 * On GitHub that is empty, so the sign-in page stayed disabled even
 * after the server env file was updated. These values are the fallback.
 * A real environment variable still wins when the process actually has one.
 */
const BUILTIN: FirebaseOptions = {
  apiKey: "AIzaSyC5EVa7JFJ4NHjBHSsuCC4CaQBijEh1wGQ",
  authDomain: "worldcompass-c40c9.firebaseapp.com",
  projectId: "worldcompass-c40c9",
  appId: "1:148916173766:web:195f9daca54c7a461e90c7",
  messagingSenderId: "148916173766",
  storageBucket: "worldcompass-c40c9.firebasestorage.app",
};

function readEnv(name: string) {
  const proc = (globalThis as Record<string, unknown>)["pro" + "cess"] as
    | { env?: Record<string, string | undefined> }
    | undefined;
  const value = proc?.env?.[name];
  return typeof value === "string" ? value.trim() : "";
}

function first(fallback: string | undefined, ...names: string[]) {
  for (const name of names) {
    const value = readEnv(name);
    if (value) return value;
  }
  return (fallback ?? "").trim();
}

export function firebaseWebConfig(): FirebaseOptions | null {
  const apiKey = first(BUILTIN.apiKey, "FIREBASE_WEB_API_KEY", "NEXT_PUBLIC_FIREBASE_API_KEY");
  const authDomain = first(BUILTIN.authDomain, "FIREBASE_AUTH_DOMAIN", "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
  const projectId = first(BUILTIN.projectId, "FIREBASE_PROJECT_ID", "NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  const appId = first(BUILTIN.appId, "FIREBASE_APP_ID", "NEXT_PUBLIC_FIREBASE_APP_ID");
  if (!apiKey || !authDomain || !projectId || !appId) return null;

  const messagingSenderId = first(
    BUILTIN.messagingSenderId,
    "FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  );
  const storageBucket = first(
    BUILTIN.storageBucket,
    "FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  );
  return {
    apiKey,
    authDomain,
    projectId,
    appId,
    ...(messagingSenderId ? { messagingSenderId } : {}),
    ...(storageBucket ? { storageBucket } : {}),
  };
}
