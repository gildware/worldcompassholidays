import "server-only";

import type { FirebaseOptions } from "firebase/app";

/**
 * Read at request time. Next replaces `process.env.NEXT_PUBLIC_*` with the
 * value from `next build`, so a variable added on the running container is
 * invisible to that form. `globalThis.process` stays a real lookup.
 */
function readEnv(name: string) {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
  const value = env?.[name];
  return typeof value === "string" ? value.trim() : "";
}

function first(...names: string[]) {
  for (const name of names) {
    const value = readEnv(name);
    if (value) return value;
  }
  return "";
}

export function firebaseWebConfig(): FirebaseOptions | null {
  const apiKey = first("FIREBASE_WEB_API_KEY", "NEXT_PUBLIC_FIREBASE_API_KEY");
  const authDomain = first("FIREBASE_AUTH_DOMAIN", "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
  const projectId = first("FIREBASE_PROJECT_ID", "NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  const appId = first("FIREBASE_APP_ID", "NEXT_PUBLIC_FIREBASE_APP_ID");
  if (!apiKey || !authDomain || !projectId || !appId) return null;

  const messagingSenderId = first(
    "FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  );
  const storageBucket = first("FIREBASE_STORAGE_BUCKET", "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET");
  return {
    apiKey,
    authDomain,
    projectId,
    appId,
    ...(messagingSenderId ? { messagingSenderId } : {}),
    ...(storageBucket ? { storageBucket } : {}),
  };
}
