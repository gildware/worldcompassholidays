const plane =
  "M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z";

function Plane({ x, y, rotate, scale = 1 }: { x: number; y: number; rotate: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale}) translate(-12 -12)`}>
      <path fill="currentColor" d={plane} />
    </g>
  );
}

export function AssistTypeIcon({
  name,
}: {
  name: "arrival" | "departure" | "transit" | "round";
}) {
  return (
    <span className="assist-type-icon" aria-hidden="true">
      <svg viewBox="0 0 48 48">
        {name === "arrival" ? (
          <>
            <Plane x={24} y={18} rotate={135} scale={1.15} />
            <path d="M8 40h32" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
          </>
        ) : null}
        {name === "departure" ? (
          <>
            <Plane x={24} y={20} rotate={-45} scale={1.15} />
            <path d="M8 40h32" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
          </>
        ) : null}
        {name === "transit" ? (
          <>
            <Plane x={14} y={32} rotate={135} scale={0.72} />
            <path d="M20 28c6-1 8-6 10-12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M27 14.5h6v6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            <Plane x={36} y={14} rotate={-45} scale={0.72} />
          </>
        ) : null}
        {name === "round" ? (
          <>
            <path d="M34 12a14 14 0 1 0 4 12" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
            <path d="M34 18v8h-8" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            <Plane x={22} y={26} rotate={-45} scale={0.7} />
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
