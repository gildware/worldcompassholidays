"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { theme } from "@/config/theme";
import { whatsAppHref } from "@/lib/visa";
import { CountryFlag } from "@/components/visa/CountryFlag";
import { WhatsAppIcon } from "@/components/visa/VisaIcons";
import { VisaRequestForm } from "@/components/visa/VisaRequestForm";

export function VisaApply({
  sent,
  reference,
  customer,
  compact = false,
  tile = false,
}: {
  sent: boolean;
  reference: string;
  customer: { name: string; email: string; phone: string } | null;
  compact?: boolean;
  tile?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const label = compact || tile
    ? "Check if you can take my country"
    : sent
      ? "Apply for another traveller"
      : "Apply for visa help";
  const whatsapp = whatsAppHref(theme.contact.whatsapp);
  const whatsappHref = whatsapp
    ? `${whatsapp}?text=${encodeURIComponent("Hello, I need visa help for an Indian passport.")}`
    : null;

  return (
    <>
      {sent && !compact && !tile ? (
        <div className="rounded-4 bg-blue-1-05 px-20 py-20 mt-20">
          <h2 className="text-18 fw-500">Application received</h2>
          <p className="text-14 text-light-1 mt-5">
            {reference ? `Reference ${reference}. ` : ""}
            We will email the document list and the fee. Nothing is filed until you accept the quote.
          </p>
        </div>
      ) : null}
      {tile ? (
        <article className="visa-country visa-country-ask">
          <div className="visa-country-name">
            <CountryFlag code="world" />
            <strong>Not on the list?</strong>
          </div>
          <p>Tell us the country. We will say if we can take the file.</p>
          <button type="button" className="visa-country-cta" onClick={() => setOpen(true)}>
            Check my country
            <span className="visa-action-arrow" aria-hidden="true">
              →
            </span>
          </button>
        </article>
      ) : (
      <div className={compact || sent ? "mt-20" : "visa-cta"}>
        {sent || compact ? null : (
          <>
            <p className="text-16 fw-500">Get the document list before you book</p>
            <p className="text-14 text-light-1 mt-5">
              Share your destination and travel dates. We reply within 24 hours with every paper you need. You pay nothing until you accept the quote.
            </p>
          </>
        )}
        {compact ? (
          <p className="text-15 mb-15">
            Your country can be on or off this list. Apply and we will say whether we can take the file.
          </p>
        ) : null}
        <div className="visa-actions">
          <button
            type="button"
            className="button -dark-1 h-60 px-40 rounded-4 bg-blue-1 text-white"
            onClick={() => setOpen(true)}
          >
            {label}
          </button>
          {whatsappHref && !compact ? (
            <a className="visa-whatsapp" href={whatsappHref} target="_blank" rel="noreferrer">
              <WhatsAppIcon />
              WhatsApp the desk
            </a>
          ) : null}
        </div>
      </div>
      )}
      <VisaApplyDialog open={open} onClose={() => setOpen(false)} customer={customer} />
    </>
  );
}

export function VisaApplyDialog({
  open,
  onClose,
  customer,
  country = "",
  visaType = "",
  heading = "",
}: {
  open: boolean;
  onClose: () => void;
  customer: { name: string; email: string; phone: string } | null;
  country?: string;
  visaType?: string;
  heading?: string;
}) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="worldcompassholiday-page">
      <div className="visa-modal" onClick={onClose}>
        <div
          className="visa-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="visa-apply-title"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="d-flex items-center justify-between">
            <h2 id="visa-apply-title" className="text-20 fw-500">
              {heading || (country ? `Visa help for ${country}` : "Apply for visa help")}
            </h2>
            <button type="button" className="visa-close" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>
          <p className="text-14 text-light-1 mt-5 mb-15">
            Tell us the trip. We reply with the document list and a quote. Nothing is filed until you accept it.
          </p>
          <VisaRequestForm
            key={`${country}|${visaType}|${heading}`}
            sent={false}
            reference=""
            customer={customer}
            defaultCountry={country}
            defaultVisaType={visaType}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
