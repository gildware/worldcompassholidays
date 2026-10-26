"use client";

import { usePathname } from "next/navigation";
import { theme } from "@/config/theme";
import { whatsAppHref } from "@/lib/visa";

const greeting = "Hello, I need help planning a trip.";

export function WhatsAppFloat({ phone }: { phone?: string }) {
  const pathname = usePathname() || "/";
  if (pathname.startsWith("/admin")) return null;

  const href = whatsAppHref(phone || theme.contact.whatsapp);
  if (!href) return null;

  return (
    <a
      className="whatsapp-float"
      href={`${href}?text=${encodeURIComponent(greeting)}`}
      target="_blank"
      rel="noreferrer"
      aria-label={`Chat with ${theme.brandName} on WhatsApp`}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12.04 2C6.58 2 2.15 6.4 2.15 11.83c0 1.74.46 3.44 1.34 4.94L2 22l5.39-1.4a10 10 0 0 0 4.65 1.18h.01c5.46 0 9.89-4.4 9.89-9.83C21.94 6.4 17.5 2 12.04 2zm5.76 13.9c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.12.11-1.81-.11-.41-.14-.95-.31-1.64-.61-2.88-1.24-4.76-4.14-4.9-4.33-.14-.19-1.16-1.54-1.16-2.94s.73-2.08 1-2.37c.24-.27.64-.39 1.02-.39.13 0 .24 0 .35.01.31.01.47.03.67.52.24.58.82 2 .89 2.15.07.14.12.31.02.5-.09.19-.14.31-.28.48-.14.16-.29.36-.41.48-.14.14-.28.29-.12.56.16.27.71 1.17 1.52 1.89 1.05.93 1.93 1.22 2.2 1.36.27.14.43.12.59-.07.16-.19.68-.79.86-1.06.18-.27.36-.22.6-.13.24.09 1.54.73 1.8.86.27.13.44.2.51.31.06.11.06.65-.18 1.33z"
        />
      </svg>
    </a>
  );
}
