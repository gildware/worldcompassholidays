"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { submitBusRequest } from "@/actions/bus-request";
import { SuccessModal } from "@/components/hotel-request/HotelRequestForm";
import { createPortal } from "react-dom";
import { initialFormState } from "@/lib/forms";

function todayIso() {
  const now = new Date();
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function BusBookPanel({
  name,
  fromCity,
  toCity,
  coach,
  slug,
  fare,
  signedIn,
  loginHref,
}: {
  name: string;
  fromCity: string;
  toCity: string;
  coach: string;
  slug: string;
  fare: string;
  signedIn: boolean;
  loginHref: string;
}) {
  const [state, action, pending] = useActionState(submitBusRequest, initialFormState);
  const [passengers, setPassengers] = useState(1);
  const [date, setDate] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const success =
    !pending && state.reference && !state.error
      ? state.reference
      : "";

  return (
    <aside className="bus-quote" id="bus-book" aria-label="Book this bus">
      <p className="bus-quote__price">{fare}</p>
      <p>Indicative fare. Nothing is booked until you accept a quote.</p>
      <p className="bus-quote__route">
        {fromCity} → {toCity}
      </p>
      <form action={action} className="bus-quote__form" noValidate>
        <input type="hidden" name="fromCity" value={fromCity} />
        <input type="hidden" name="toCity" value={toCity} />
        <input type="hidden" name="coach" value={coach} />
        <input type="hidden" name="timeWindow" value="any" />
        <input type="hidden" name="busName" value={name} />
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="passengers" value={String(passengers)} />
        <label className="bus-quote__field">
          Travel date
          <input name="travelDate" type="date" min={todayIso()} value={date} onChange={(event) => setDate(event.target.value)} required />
        </label>
        {state.fields?.travelDate ? <p className="bus-quote__error">{state.fields.travelDate}</p> : null}
        <div className="bus-quote__field">
          <span>Passengers</span>
          <div className="bus-quote__step">
            <button type="button" aria-label="Fewer passengers" disabled={passengers <= 1} onClick={() => setPassengers((count) => Math.max(1, count - 1))}>
              −
            </button>
            <b>{passengers}</b>
            <button type="button" aria-label="More passengers" disabled={passengers >= 20} onClick={() => setPassengers((count) => Math.min(20, count + 1))}>
              +
            </button>
          </div>
        </div>
        {state.error ? <p className="bus-quote__error">{state.error}</p> : null}
        {signedIn ? (
          <Submit />
        ) : (
          <Link className="bus-btn bus-btn--block" href={loginHref}>
            Login to book this bus
          </Link>
        )}
      </form>
      {mounted && success ? createPortal(<SuccessModal reference={success} exploreHref="/buses" detail="Nothing is booked until you accept a quote." />, document.body) : null}
    </aside>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button className="bus-btn bus-btn--block" type="submit" disabled={pending}>
      {pending ? "Sending…" : "Request this bus"}
    </button>
  );
}

export function BusBookLink({ signedIn, loginHref, className }: { signedIn: boolean; loginHref: string; className?: string }) {
  if (signedIn) {
    return (
      <a className={className} href="#bus-book">
        Request this bus
      </a>
    );
  }
  return (
    <Link className={className} href={loginHref}>
      Login to book this bus
    </Link>
  );
}
