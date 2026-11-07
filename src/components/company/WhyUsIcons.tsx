import type { WhyUsIconId } from "@/lib/why-us";

const paths: Record<WhyUsIconId, string> = {
  desks:
    "M4 10.5V6a2 2 0 0 1 2-2h5l2 2h5a2 2 0 0 1 2 2v2.5M4 10.5h16M4 10.5v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M9 15h6",
  fleet:
    "M5 17h14M5 17a2 2 0 1 1-2-2h1l1.5-5A2 2 0 0 1 7.4 8.5h9.2a2 2 0 0 1 1.9 1.5L20 15h1a2 2 0 1 1-2 2M7 17a2 2 0 1 0 0-.01M17 17a2 2 0 1 0 0-.01M7 11h10",
  quote:
    "M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-4 3v-3H6a2 2 0 0 1-2-2V7zm4 2h8M8 12h5",
  support:
    "M12 3a7 7 0 0 0-7 7v2.5A2.5 2.5 0 0 0 7.5 15H9v-4H5.2A6 6 0 0 1 12 5a6 6 0 0 1 6.8 6H15v4h1.5A2.5 2.5 0 0 0 19 12.5V10a7 7 0 0 0-7-7zm-3 14h6a1 1 0 0 1 0 2H9a1 1 0 1 1 0-2z",
  custom:
    "M4 6h7v5H4V6zm9 0h7v8h-7V6zM4 13h7v5H4v-5zm9 4h7v1h-7v-1z",
  company:
    "M4 20h16M6 20V8l6-4 6 4v12M10 20v-5h4v5M9 10h.01M12 10h.01M15 10h.01M9 13h.01M12 13h.01M15 13h.01",
};

export function WhyUsIcon({ id, className }: { id: WhyUsIconId; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={paths[id]} />
    </svg>
  );
}
