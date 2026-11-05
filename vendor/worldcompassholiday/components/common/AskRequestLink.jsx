import Link from "next/link";
import "@/styles/ask-request.css";

function DefaultMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3.5a8.5 8.5 0 1 1 0 17 8.5 8.5 0 0 1 0-17Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 8v4.2l2.4 1.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AskRequestLink({ href, title, text, cta, className = "", icon }) {
  return (
    <Link prefetch={false} className={className ? `ask-request ${className}` : "ask-request"} href={href}>
      <span className="ask-request__mark" aria-hidden>
        {icon ?? <DefaultMark />}
      </span>
      <span className="ask-request__copy">
        <b className="ask-request__title">{title}</b>
        <span>{text}</span>
      </span>
      <span className="ask-request__cta">{cta}</span>
    </Link>
  );
}
