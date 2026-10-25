import { matchDial } from "@/lib/auth/countries";

/** Indian mobile stored before country codes, or any E.164 number, as digits only. */
export function canonicalPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (/^[6-9]\d{9}$/.test(digits)) return `91${digits}`;
  if (digits.length >= 8 && digits.length <= 15) return digits;
  return "";
}

export function normalizeMobile(value: string) {
  const canonical = canonicalPhone(value);
  if (canonical.startsWith("91") && /^[6-9]\d{9}$/.test(canonical.slice(2))) return canonical.slice(2);
  return "";
}

export function phoneLookup(phone: string) {
  const canonical = canonicalPhone(phone);
  if (!canonical) return [phone];
  const values = new Set<string>([canonical, `+${canonical}`]);
  if (canonical.startsWith("91") && /^[6-9]\d{9}$/.test(canonical.slice(2))) {
    const local = canonical.slice(2);
    values.add(local);
    values.add(`0${local}`);
    values.add(`91${local}`);
    values.add(`+91${local}`);
  }
  return [...values];
}

export function formatPhone(value: string) {
  const canonical = canonicalPhone(value);
  if (!canonical) return "";
  const dial = matchDial(canonical);
  if (!dial) return `+${canonical}`;
  const national = canonical.slice(dial.length);
  if (dial === "91" && national.length === 10) {
    return `+91 ${national.slice(0, 5)} ${national.slice(5)}`;
  }
  return `+${dial} ${national}`;
}

export function toE164(local: string) {
  return `+91${local}`;
}
