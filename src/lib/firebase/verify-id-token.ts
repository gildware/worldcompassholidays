import "server-only";

import { createRemoteJWKSet, jwtVerify } from "jose";
import { canonicalPhone } from "@/lib/auth/phone";
import { firebaseWebConfig } from "@/lib/firebase/config";

const jwks = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);

export async function phoneFromFirebaseToken(idToken: string) {
  const config = firebaseWebConfig();
  if (!config?.projectId || !idToken) return "";

  const { payload } = await jwtVerify(idToken, jwks, {
    issuer: `https://securetoken.google.com/${config.projectId}`,
    audience: config.projectId,
  });
  const provider = (payload.firebase as { sign_in_provider?: string } | undefined)?.sign_in_provider;
  if (provider !== "phone") return "";
  return canonicalPhone(typeof payload.phone_number === "string" ? payload.phone_number : "");
}
