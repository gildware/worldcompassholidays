"use client";

import { useEffect, useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from "react";
import { unstable_rethrow } from "next/navigation";
import type { FirebaseOptions } from "firebase/app";
import type { ConfirmationResult } from "firebase/auth";
import { finishPhoneLogin } from "@/actions/phone-auth";
import { CountryCodeSelect } from "@/components/auth/CountryCodeSelect";
import { countryByIso, countryFromTimeZone, nationalPhoneField, toInternational } from "@/lib/auth/countries";
import { formatPhone } from "@/lib/auth/phone";
import {
  clearPhoneVerifier,
  confirmFirebaseCode,
  firebaseAuthMessage,
  sendFirebaseCode,
} from "@/lib/firebase/phone-client";

const CODE_LENGTH = 6;

function constraintMessage(input: HTMLInputElement, message: string) {
  input.setCustomValidity("");
  if (input.validity.valid || input.validity.valueMissing) return;
  input.setCustomValidity(message);
}

export function PhoneLogin({
  next,
  config,
  defaultCountry = "",
}: {
  next: string;
  config: FirebaseOptions | null;
  defaultCountry?: string;
}) {
  const ready = config !== null;
  const [step, setStep] = useState<"phone" | "code" | "name">("phone");
  const [country, setCountry] = useState(countryByIso(defaultCountry)?.iso || "IN");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const confirmation = useRef<ConfirmationResult | null>(null);
  const idToken = useRef("");
  const sentTo = useRef("");
  const countryPicked = useRef(Boolean(countryByIso(defaultCountry)));
  const recaptcha = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const busy = useRef(false);
  const phoneField = nationalPhoneField(country);

  useEffect(() => {
    if (countryPicked.current) return;
    const fromZone = countryFromTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    if (fromZone) setCountry(fromZone);

    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 2500);
    fetch("https://ipwho.is/", { signal: controller.signal })
      .then((response) => response.json())
      .then((data: { success?: boolean; country_code?: string }) => {
        const iso = countryByIso(data.country_code ?? "")?.iso;
        if (data.success && iso && !countryPicked.current) setCountry(iso);
      })
      .catch(() => undefined)
      .finally(() => window.clearTimeout(timer));

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const input = phoneRef.current;
    if (!input) return;
    constraintMessage(input, phoneField.title);
  }, [phoneField.title]);

  useEffect(() => {
    if (step === "code") otpRefs.current[0]?.focus();
  }, [step]);

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
      setPhone(formatPhone(e164));
      clearOtp();
      setStep("code");
      otpRefs.current[0]?.focus();
    });
  }

  function submitCodeIfComplete() {
    const form = formRef.current;
    const digits = otpRefs.current;
    if (!form || busy.current || digits.length < CODE_LENGTH) return;
    if (!digits.every((input) => input?.value)) return;
    if (form.checkValidity()) form.requestSubmit();
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

  return (
    <form
      ref={formRef}
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        if (step === "phone") {
          const national = String(data.get("phone") ?? "").trim();
          void send(toInternational(country, national));
          return;
        }
        if (step === "code") {
          const entered = otpRefs.current.map((input) => input?.value ?? "").join("");
          void run(async () => {
            if (!confirmation.current) throw new Error("expired");
            if (!config) throw new Error("missing-config");
            idToken.current = await confirmFirebaseCode(confirmation.current, entered, config);
            const result = await finishPhoneLogin(idToken.current, next);
            if (result.error) {
              setError(result.error);
              return;
            }
            setPhone(formatPhone(result.phone));
            setStep("name");
          });
          return;
        }
        const enteredName = String(data.get("name") ?? "");
        void run(async () => {
          const result = await finishPhoneLogin(idToken.current, next, enteredName);
          if (result?.error) setError(result.error);
        });
      }}
    >
      <div ref={recaptcha} id="phone-recaptcha" />
      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {step === "phone" ? (
        <>
          <div className="grid gap-1 text-sm font-medium">
            <span id="phone-login-label">Mobile number</span>
            <div className="phone-login__row">
              <CountryCodeSelect
                value={country}
                disabled={!ready || pending}
                onChange={(iso) => {
                  countryPicked.current = true;
                  setCountry(iso);
                }}
              />
              <input
                ref={phoneRef}
                name="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="Mobile number"
                aria-labelledby="phone-login-label"
                required
                minLength={phoneField.minLength}
                maxLength={phoneField.maxLength}
                pattern={phoneField.pattern}
                title={phoneField.title}
                disabled={!ready || pending}
                onInput={(event) => constraintMessage(event.currentTarget, phoneField.title)}
              />
            </div>
          </div>
          {ready ? (
            <p className="text-sm text-muted">Enter the number without the country code. Firebase texts a 6-digit code.</p>
          ) : null}
          <button
            type="submit"
            disabled={!ready || pending}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-brand px-4 text-sm font-medium text-white hover:bg-[#2c46b5] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Sending code…" : "Send code"}
          </button>
          {ready ? null : (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-950">Phone login is not available yet.</p>
          )}
        </>
      ) : null}

      {step === "code" ? (
        <>
          <p className="text-sm text-muted">
            Enter the code sent to <strong>{phone}</strong>.
          </p>
          <div className="grid gap-1 text-sm font-medium">
            <span id="otp-label">Verification code</span>
            <div className="otp-inputs" role="group" aria-labelledby="otp-label">
              {Array.from({ length: CODE_LENGTH }, (_, index) => (
                <input
                  key={index}
                  ref={(node) => {
                    otpRefs.current[index] = node;
                  }}
                  name="code"
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
                  onInput={(event) => onDigitInput(index, event)}
                  onKeyDown={(event) => onDigitKeyDown(index, event)}
                  onPaste={(event) => onDigitPaste(index, event)}
                  onFocus={(event) => event.currentTarget.select()}
                />
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-brand px-4 text-sm font-medium text-white hover:bg-[#2c46b5] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Checking…" : "Verify phone"}
          </button>
          <button
            type="button"
            className="text-sm font-medium text-brand"
            disabled={pending}
            onClick={() => {
              clearPhoneVerifier();
              confirmation.current = null;
              void send(sentTo.current);
            }}
          >
            Send a new code
          </button>
        </>
      ) : null}

      {step === "name" ? (
        <>
          <p className="text-sm text-muted">
            <strong>{phone}</strong> is verified. Add your name to finish registering.
          </p>
          <label className="grid gap-1 text-sm font-medium">
            Your name
            <input
              name="name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                constraintMessage(event.currentTarget, "Enter your name.");
              }}
              autoComplete="name"
              required
              minLength={2}
              pattern={"(?:.*\\S){2}.*"}
              title="Enter your name."
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-brand px-4 text-sm font-medium text-white hover:bg-[#2c46b5] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Creating account…" : "Register and continue"}
          </button>
        </>
      ) : null}
    </form>
  );
}
