"use client";

import { useEffect, useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { unstable_rethrow } from "next/navigation";
import type { FirebaseOptions } from "firebase/app";
import type { ConfirmationResult } from "firebase/auth";
import { establishPhoneSession } from "@/actions/phone-auth";
import { CountryCodeSelect } from "@/components/auth/CountryCodeSelect";
import { countryByIso, nationalPhoneField, toInternational } from "@/lib/auth/countries";
import { canonicalPhone, formatPhone } from "@/lib/auth/phone";
import {
  clearPhoneVerifier,
  confirmFirebaseCode,
  firebaseAuthMessage,
  sendFirebaseCode,
} from "@/lib/firebase/phone-client";

const CODE_LENGTH = 6;

function e164FromAny(value: string) {
  const canonical = canonicalPhone(value);
  return canonical ? `+${canonical}` : "";
}

function constraintMessage(input: HTMLInputElement, message: string) {
  input.setCustomValidity("");
  if (input.validity.valid || input.validity.valueMissing) return;
  input.setCustomValidity(message);
}

export function RequestPhoneVerify({
  open,
  name,
  phone,
  config,
  defaultCountry = "IN",
  onClose,
  onVerified,
}: {
  open: boolean;
  name: string;
  phone: string;
  config: FirebaseOptions | null;
  defaultCountry?: string;
  onClose: () => void;
  onVerified: (details: { name: string; phone: string }) => void;
}) {
  const ready = config !== null;
  const initialE164 = e164FromAny(phone);
  const [stage, setStage] = useState<"phone" | "code" | "name">(initialE164 ? "code" : "phone");
  const [country, setCountry] = useState(countryByIso(defaultCountry)?.iso || "IN");
  const [national, setNational] = useState("");
  const [displayPhone, setDisplayPhone] = useState(formatPhone(initialE164) || initialE164);
  const [guestName, setGuestName] = useState(name.trim());
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [mounted, setMounted] = useState(false);
  const confirmation = useRef<ConfirmationResult | null>(null);
  const idToken = useRef("");
  const sentTo = useRef(initialE164);
  const started = useRef(false);
  const busy = useRef(false);
  const recaptcha = useRef<HTMLDivElement>(null);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const phoneField = nationalPhoneField(country);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      started.current = false;
      confirmation.current = null;
      idToken.current = "";
      clearPhoneVerifier();
      setError(null);
      setPending(false);
      return;
    }
    const nextE164 = e164FromAny(phone);
    sentTo.current = nextE164;
    setDisplayPhone(formatPhone(nextE164) || nextE164);
    setGuestName(name.trim());
    setStage(nextE164 ? "code" : "phone");
    setError(null);
  }, [name, open, phone]);

  useEffect(() => {
    if (!open || !ready || !initialE164 || started.current || stage !== "code") return;
    started.current = true;
    void send(initialE164);
  }, [initialE164, open, ready, stage]);

  useEffect(() => {
    if (open && stage === "code") otpRefs.current[0]?.focus();
  }, [open, stage]);

  async function run(task: () => Promise<void>) {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setError(null);
    try {
      await task();
    } catch (caught) {
      unstable_rethrow(caught);
      setError(firebaseAuthMessage(caught));
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  function clearOtp() {
    for (const input of otpRefs.current) {
      if (!input) continue;
      input.value = "";
      input.setCustomValidity("");
    }
  }

  function send(e164: string) {
    return run(async () => {
      if (!config) throw new Error("missing-config");
      const container = recaptcha.current;
      if (!container) throw new Error("missing-config");
      confirmation.current = await sendFirebaseCode(e164, container, config);
      idToken.current = "";
      sentTo.current = e164;
      setDisplayPhone(formatPhone(e164) || e164);
      clearOtp();
      setStage("code");
      otpRefs.current[0]?.focus();
    });
  }

  function submitCodeIfComplete() {
    if (busy.current || otpRefs.current.length < CODE_LENGTH) return;
    if (!otpRefs.current.every((input) => input?.value)) return;
    void verifyCode(otpRefs.current.map((input) => input?.value ?? "").join(""));
  }

  function writeDigits(start: number, raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!digits) return;
    const origin = digits.length === CODE_LENGTH ? 0 : start;
    const chars = digits.slice(0, CODE_LENGTH - origin).split("");
    chars.forEach((char, offset) => {
      const input = otpRefs.current[origin + offset];
      if (!input) return;
      input.value = char;
      input.setCustomValidity("");
    });
    const next = origin + chars.length;
    otpRefs.current[Math.min(next, CODE_LENGTH - 1)]?.focus();
    submitCodeIfComplete();
  }

  function onDigitInput(index: number, event: FormEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    if (input.value.length > 1) {
      const raw = input.value;
      input.value = "";
      writeDigits(index, raw);
      return;
    }
    constraintMessage(input, "Enter one digit.");
    if (!input.value || !input.validity.valid) return;
    if (index < CODE_LENGTH - 1) otpRefs.current[index + 1]?.focus();
    submitCodeIfComplete();
  }

  function onDigitKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      otpRefs.current[index - 1]?.focus();
      return;
    }
    if (event.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      event.preventDefault();
      otpRefs.current[index + 1]?.focus();
      return;
    }
    if (event.key !== "Backspace" || event.currentTarget.value || index === 0) return;
    event.preventDefault();
    const previous = otpRefs.current[index - 1];
    if (!previous) return;
    previous.value = "";
    previous.setCustomValidity("");
    previous.focus();
  }

  function onDigitPaste(index: number, event: ClipboardEvent<HTMLInputElement>) {
    const text = event.clipboardData.getData("text");
    if (!/\d/.test(text)) return;
    event.preventDefault();
    writeDigits(index, text);
  }

  async function finishWithToken(token: string, enteredName: string) {
    const result = await establishPhoneSession(token, enteredName);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.needsName) {
      setDisplayPhone(formatPhone(result.phone) || result.phone);
      setStage("name");
      return;
    }
    onVerified({ name: enteredName.trim() || name.trim(), phone: result.phone });
  }

  function verifyCode(entered: string) {
    return run(async () => {
      if (!confirmation.current) throw new Error("expired");
      if (!config) throw new Error("missing-config");
      idToken.current = await confirmFirebaseCode(confirmation.current, entered, config);
      await finishWithToken(idToken.current, guestName);
    });
  }

  if (!mounted || !open) return null;

  return createPortal(
    <div className="hotel-guide-otp" role="dialog" aria-modal="true" aria-labelledby="request-otp-title">
      <button type="button" className="hotel-guide-otp__backdrop" aria-label="Close verification" onClick={onClose} />
      <div className="hotel-guide-otp__card">
        <div ref={recaptcha} id="request-phone-recaptcha" />
        <p className="hotel-guide-otp__kicker">Verify mobile</p>
        <h2 id="request-otp-title">Confirm your number</h2>
        <p className="hotel-guide-otp__lede">
          {stage === "phone"
            ? "Enter the mobile number we should use for this request."
            : stage === "code"
              ? `We texted a 6-digit code to ${displayPhone || "your number"}.`
              : `${displayPhone} is verified. Add your name to finish.`}
        </p>
        {error ? <p className="hotel-guide-otp__alert" role="alert">{error}</p> : null}
        {!ready ? <p className="hotel-guide-otp__alert" role="alert">Phone verification is not available yet.</p> : null}

        {stage === "phone" ? (
          <form
            className="hotel-guide-otp__form"
            onSubmit={(event) => {
              event.preventDefault();
              const e164 = toInternational(country, national.trim());
              if (!e164) {
                setError("Enter a valid mobile number.");
                return;
              }
              void send(e164);
            }}
          >
            <label className="hotel-guide-otp__label" htmlFor="request-otp-phone">
              Mobile number
            </label>
            <div className="phone-login__row hotel-guide-otp__phone-row">
              <CountryCodeSelect
                value={country}
                disabled={!ready || pending}
                onChange={setCountry}
              />
              <input
                id="request-otp-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="Mobile number"
                required
                minLength={phoneField.minLength}
                maxLength={phoneField.maxLength}
                pattern={phoneField.pattern}
                title={phoneField.title}
                disabled={!ready || pending}
                value={national}
                onChange={(event) => setNational(event.target.value.replace(/\D/g, ""))}
                onInput={(event) => constraintMessage(event.currentTarget, phoneField.title)}
              />
            </div>
            <button type="submit" className="hotel-guide-primary" disabled={!ready || pending}>
              {pending ? "Sending code…" : "Send code"}
            </button>
          </form>
        ) : null}

        {stage === "code" ? (
          <div className="hotel-guide-otp__form">
            <span className="hotel-guide-otp__label" id="request-otp-label">Verification code</span>
            <div className="otp-inputs" role="group" aria-labelledby="request-otp-label">
              {Array.from({ length: CODE_LENGTH }, (_, index) => (
                <input
                  key={index}
                  ref={(node) => {
                    otpRefs.current[index] = node;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  aria-label={`Digit ${index + 1}`}
                  pattern="[0-9]"
                  maxLength={index === 0 ? CODE_LENGTH : 1}
                  title="Enter one digit."
                  required
                  spellCheck={false}
                  autoCorrect="off"
                  autoCapitalize="off"
                  disabled={pending}
                  onInput={(event) => onDigitInput(index, event)}
                  onKeyDown={(event) => onDigitKeyDown(index, event)}
                  onPaste={(event) => onDigitPaste(index, event)}
                  onFocus={(event) => event.currentTarget.select()}
                />
              ))}
            </div>
            <button
              type="button"
              className="hotel-guide-primary"
              disabled={pending}
              onClick={() => {
                const entered = otpRefs.current.map((input) => input?.value ?? "").join("");
                if (entered.length !== CODE_LENGTH) {
                  setError("Enter the 6-digit code.");
                  return;
                }
                void verifyCode(entered);
              }}
            >
              {pending ? "Checking…" : "Verify and send request"}
            </button>
            <div className="hotel-guide-otp__links">
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  clearPhoneVerifier();
                  confirmation.current = null;
                  void send(sentTo.current);
                }}
              >
                Send a new code
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  clearPhoneVerifier();
                  confirmation.current = null;
                  started.current = false;
                  setStage("phone");
                  setError(null);
                }}
              >
                Change number
              </button>
            </div>
          </div>
        ) : null}

        {stage === "name" ? (
          <form
            className="hotel-guide-otp__form"
            onSubmit={(event) => {
              event.preventDefault();
              const enteredName = guestName.trim();
              if (enteredName.length < 2) {
                setError("Enter your name.");
                return;
              }
              void run(async () => {
                await finishWithToken(idToken.current, enteredName);
              });
            }}
          >
            <label className="hotel-guide-otp__label" htmlFor="request-otp-name">Your name</label>
            <input
              id="request-otp-name"
              type="text"
              autoComplete="name"
              required
              minLength={2}
              value={guestName}
              onChange={(event) => setGuestName(event.target.value)}
            />
            <button type="submit" className="hotel-guide-primary" disabled={pending}>
              {pending ? "Creating account…" : "Continue"}
            </button>
          </form>
        ) : null}

        <button type="button" className="hotel-guide-otp__cancel" onClick={onClose} disabled={pending}>
          Cancel
        </button>
      </div>
    </div>,
    document.body,
  );
}
