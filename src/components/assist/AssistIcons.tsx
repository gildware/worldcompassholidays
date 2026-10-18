export function AssistTypeIcon({
  name,
}: {
  name: "arrival" | "departure" | "transit" | "round";
}) {
  return (
    <span className="assist-type-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        {name === "arrival" ? (
          <>
            <path d="M4 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M4 16 12 8l3 2.2 5-1.4" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
            <path d="M12 8v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </>
        ) : null}
        {name === "departure" ? (
          <>
            <path d="M4 18h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M5 18 13 10l3 2.2 4-1.2" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
            <path d="M13 10V6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </>
        ) : null}
        {name === "transit" ? (
          <>
            <path d="M4 8h7l3-3 6 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 16h7l3 3 6-1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </>
        ) : null}
        {name === "round" ? (
          <>
            <path d="M7 7h8a4 4 0 0 1 0 8H8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M8 11 5 15l3 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </>
        ) : null}
      </svg>
    </span>
  );
}

export function AssistStepIcon({ name }: { name: "flight" | "quote" | "accept" | "meet" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {name === "flight" ? (
        <path d="M3 13h5l6-6v3l6 1.2L14 13v3l-6-6H3" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
      ) : null}
      {name === "quote" ? (
        <>
          <rect x="6" y="3.5" width="12" height="17" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M9 8.5h6M9 12h6M9 15.5h3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </>
      ) : null}
      {name === "accept" ? (
        <>
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8.2 12.2 11 15l4.8-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : null}
      {name === "meet" ? (
        <>
          <circle cx="8" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M3.6 18.2c.6-2.4 2.2-3.6 4.4-3.6s3.8 1.2 4.4 3.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <rect x="13" y="6" width="8" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.8" />
        </>
      ) : null}
    </svg>
  );
}

export function AssistExtraIcon({
  name,
}: {
  name: "board" | "immigration" | "baggage" | "wheelchair" | "lounge" | "transfer";
}) {
  return (
    <svg className="assist-extra-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {name === "board" ? (
        <>
          <rect x="4" y="4" width="16" height="11" rx="1.6" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 15v4M8 19h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </>
      ) : null}
      {name === "immigration" ? (
        <>
          <rect x="5" y="3.5" width="14" height="17" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="12" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8.5 16.2c.5-1.6 1.7-2.4 3.5-2.4s3 0.8 3.5 2.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </>
      ) : null}
      {name === "baggage" ? (
        <>
          <rect x="5" y="7" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" stroke="currentColor" strokeWidth="1.8" />
        </>
      ) : null}
      {name === "wheelchair" ? (
        <>
          <circle cx="12" cy="5" r="1.6" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="10" cy="16" r="4" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 8.5 10 12h5l2 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : null}
      {name === "lounge" ? (
        <>
          <path d="M4 14V9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M3 14h18v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2z" stroke="currentColor" strokeWidth="1.8" />
        </>
      ) : null}
      {name === "transfer" ? (
        <>
          <path d="M4 15h13l2-4H8L4 15z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <circle cx="8" cy="17.5" r="1.4" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="16" cy="17.5" r="1.4" stroke="currentColor" strokeWidth="1.6" />
        </>
      ) : null}
    </svg>
  );
}

export function AssistStatIcon({ name }: { name: "airports" | "reply" | "board" | "quote" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {name === "airports" ? (
        <>
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
          <ellipse cx="12" cy="12" rx="3.4" ry="8" stroke="currentColor" strokeWidth="1.8" />
          <path d="M4.5 12h15" stroke="currentColor" strokeWidth="1.8" />
        </>
      ) : null}
      {name === "reply" ? (
        <>
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 8v4.2l2.8 1.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : null}
      {name === "board" ? (
        <>
          <rect x="4" y="5" width="16" height="10" rx="1.6" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 15v4M8 19h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </>
      ) : null}
      {name === "quote" ? (
        <>
          <path d="M12 3.5l7 2.8v5.4c0 4.2-2.8 7-7 8.3-4.2-1.3-7-4.1-7-8.3V6.3l7-2.8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M8.5 12.2 11 14.6l4.6-5.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : null}
    </svg>
  );
}
