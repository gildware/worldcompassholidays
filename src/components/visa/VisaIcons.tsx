import type { ReactNode } from "react";

export function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12.04 2C6.58 2 2.15 6.4 2.15 11.83c0 1.74.46 3.44 1.34 4.94L2 22l5.39-1.4a10 10 0 0 0 4.65 1.18h.01c5.46 0 9.89-4.4 9.89-9.83C21.94 6.4 17.5 2 12.04 2zm5.76 13.9c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.12.11-1.81-.11-.41-.14-.95-.31-1.64-.61-2.88-1.24-4.76-4.14-4.9-4.33-.14-.19-1.16-1.54-1.16-2.94s.73-2.08 1-2.37c.24-.27.64-.39 1.02-.39.13 0 .24 0 .35.01.31.01.47.03.67.52.24.58.82 2 .89 2.15.07.14.12.31.02.5-.09.19-.14.31-.28.48-.14.16-.29.36-.41.48-.14.14-.28.29-.12.56.16.27.71 1.17 1.52 1.89 1.05.93 1.93 1.22 2.2 1.36.27.14.43.12.59-.07.16-.19.68-.79.86-1.06.18-.27.36-.22.6-.13.24.09 1.54.73 1.8.86.27.13.44.2.51.31.06.11.06.65-.18 1.33z"
      />
    </svg>
  );
}

export function VisaTypeIcon({ name }: { name: "tourist" | "business" | "family" | "transit" | "other" }) {
  return (
    <span className="visa-type-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        {name === "tourist" ? (
          <>
            <rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="12" cy="13.5" r="3" stroke="currentColor" strokeWidth="1.8" />
            <path d="M9 7.2 10.2 5h3.6L15 7.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </>
        ) : null}
        {name === "business" ? (
          <>
            <rect x="3" y="8" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
            <path d="M9 8V6.6A1.6 1.6 0 0 1 10.6 5h2.8A1.6 1.6 0 0 1 15 6.6V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M3 13h18" stroke="currentColor" strokeWidth="1.8" />
          </>
        ) : null}
        {name === "family" ? (
          <>
            <circle cx="9" cy="8" r="2.1" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="16" cy="9" r="1.6" stroke="currentColor" strokeWidth="1.8" />
            <path d="M4.2 18.5v-.8A3.2 3.2 0 0 1 7.4 14.5h3.2a3.2 3.2 0 0 1 3.2 3.2v.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M13.6 14.8h.8a2.6 2.6 0 0 1 2.6 2.6v1.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </>
        ) : null}
        {name === "transit" ? (
          <path
            d="M3 12.2h4.8L14.2 7v3.2L21 12.2l-6.8 2V17.4L7.8 12.2H3"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ) : null}
        {name === "other" ? (
          <>
            <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
            <path d="M9.6 9.4a2.5 2.5 0 1 1 3.4 2.3c-.7.4-1 1-1 1.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M12 17.2h.01" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </>
        ) : null}
      </svg>
    </span>
  );
}

export function PromiseIcon({ name }: { name: "quote" | "split" | "shield" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {name === "quote" ? (
        <>
          <rect x="6" y="3.5" width="12" height="17" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M9 8.5h6M9 12h6M9 15.5h3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </>
      ) : null}
      {name === "split" ? (
        <>
          <rect x="3.5" y="6" width="7" height="12" rx="1.6" stroke="currentColor" strokeWidth="1.8" />
          <rect x="13.5" y="6" width="7" height="12" rx="1.6" stroke="currentColor" strokeWidth="1.8" />
        </>
      ) : null}
      {name === "shield" ? (
        <>
          <path
            d="M12 3.5l7 2.8v5.4c0 4.2-2.8 7-7 8.3-4.2-1.3-7-4.1-7-8.3V6.3l7-2.8z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M9 12.1l2 2 4-4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : null}
    </svg>
  );
}

function Mark({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {children}
    </svg>
  );
}

export function VisaStepIcon({ name }: { name: "apply" | "quote" | "accept" | "stay" }) {
  if (name === "apply") {
    return (
      <Mark>
        <path d="M5 4.5h9.5L19 9v10.5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-14a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M14 4.5V9h5M8 13h8M8 16.5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </Mark>
    );
  }
  if (name === "quote") {
    return (
      <Mark>
        <rect x="5" y="3.5" width="14" height="17" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8.5 8.5h7M8.5 12h7M8.5 15.5h3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </Mark>
    );
  }
  if (name === "accept") {
    return (
      <Mark>
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8.2 12.2l2.4 2.4 5.2-5.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </Mark>
    );
  }
  return (
    <Mark>
      <path d="M12 3.5l7 2.8v5.4c0 4.2-2.8 7-7 8.3-4.2-1.3-7-4.1-7-8.3V6.3l7-2.8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 12.1l2 2 4-4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Mark>
  );
}

export function VisaStatIcon({ name }: { name: "places" | "reply" | "file" | "passport" }) {
  if (name === "places") {
    return (
      <Mark>
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
        <path d="M4 12h16M12 4c2.2 2.4 3.3 5.1 3.3 8S14.2 17.6 12 20c-2.2-2.4-3.3-5.1-3.3-8S9.8 6.4 12 4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </Mark>
    );
  }
  if (name === "reply") {
    return (
      <Mark>
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 8v4.2l2.8 1.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </Mark>
    );
  }
  if (name === "file") {
    return (
      <Mark>
        <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 9h8M8 12.5h8M8 16h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </Mark>
    );
  }
  return (
    <Mark>
      <rect x="5" y="3.5" width="14" height="17" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="11" r="2.2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.2 16.8c.6-1.6 1.8-2.4 3.8-2.4s3.2.8 3.8 2.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </Mark>
  );
}
