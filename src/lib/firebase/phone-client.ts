"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
  type ConfirmationResult,
} from "firebase/auth";
import { firebaseWebConfig } from "@/lib/firebase/config";

let verifier: RecaptchaVerifier | null = null;

function clientAuth() {
  const config = firebaseWebConfig();
  if (!config) throw new Error("missing-config");
  const app = getApps().length ? getApp() : initializeApp(config);
  const auth = getAuth(app);
  auth.languageCode = "en";
  return auth;
}

export function clearPhoneVerifier() {
  verifier?.clear();
  verifier = null;
}

export async function sendFirebaseCode(e164: string, container: HTMLElement) {
  const auth = clientAuth();
  clearPhoneVerifier();
  verifier = new RecaptchaVerifier(auth, container, { size: "invisible" });
  try {
    return await signInWithPhoneNumber(auth, e164, verifier);
  } catch (error) {
    clearPhoneVerifier();
    throw error;
  }
}

export async function confirmFirebaseCode(confirmation: ConfirmationResult, code: string) {
  const credential = await confirmation.confirm(code);
  const idToken = await credential.user.getIdToken();
  await signOut(clientAuth()).catch(() => undefined);
  return idToken;
}

function phoneErrorText(error: unknown) {
  if (!error || typeof error !== "object") return "";
  const record = error as {
    code?: unknown;
    message?: unknown;
    customData?: { _serverResponse?: unknown };
  };
  return [record.code, record.message, record.customData?._serverResponse]
    .map((part) => (typeof part === "string" ? part : part ? JSON.stringify(part) : ""))
    .join(" ");
}

export function firebaseAuthMessage(error: unknown) {
  const code =
    typeof error === "object" && error && "code" in error ? String((error as { code: unknown }).code) : "";
  const text = phoneErrorText(error);
  if (error instanceof Error && error.message === "missing-config") {
    return "Phone login is not available yet.";
  }
  if (text.includes("BILLING_NOT_ENABLED") || code === "auth/billing-not-enabled") {
    return "Firebase will not text a real number until this project has a billing account. Add one in the Firebase console, then try again.";
  }
  switch (code) {
    case "auth/invalid-phone-number":
      return "Enter a valid mobile number.";
    case "auth/too-many-requests":
      return "Too many texts to this number. Wait a bit and try again.";
    case "auth/invalid-verification-code":
      return "That code is not right. Try again.";
    case "auth/code-expired":
    case "auth/session-expired":
      return "That code expired. Send a new one.";
    case "auth/captcha-check-failed":
    case "auth/missing-client-identifier":
    case "auth/invalid-app-credential":
      return "The security check failed. Send the code again.";
    case "auth/unauthorized-domain":
      return "This website is not on the Firebase authorized domain list yet.";
    case "auth/operation-not-allowed":
      return "Phone sign-in is turned off in Firebase.";
    case "auth/quota-exceeded":
      return "Firebase could not send another text right now. Try again later.";
    default:
      return "Could not verify that number. Try again.";
  }
}
