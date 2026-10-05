import "server-only";
import { randomBytes } from "node:crypto";
import { hashPassword } from "@/lib/auth/hash";

export { hashPassword, verifyPassword } from "@/lib/auth/hash";

// Compared against when the email is unknown, so a missing account and a wrong
// password take about the same time.
let dummyHash: Promise<string> | undefined;

export function getDummyHash() {
  dummyHash ??= hashPassword(randomBytes(16).toString("hex"));
  return dummyHash;
}
