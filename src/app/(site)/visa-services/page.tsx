import type { Metadata } from "next";
import { WorldCompassHolidayFrame } from "@/components/worldcompassholiday/WorldCompassHolidayFrame";
import { VisaApply } from "@/components/visa/VisaApply";
import { VisaCountrySection } from "@/components/visa/VisaCountrySection";
import { VisaServiceSection } from "@/components/visa/VisaServiceSection";
import { VisaFaq } from "@/components/visa/VisaFaq";
import { CountryFlag } from "@/components/visa/CountryFlag";
import { PromiseIcon, VisaStatIcon, VisaStepIcon, WhatsAppIcon } from "@/components/visa/VisaIcons";
import { theme } from "@/config/theme";
import { getCurrentUser } from "@/lib/auth/session";
import { whatsAppHref } from "@/lib/visa";

const pageTitle = "Visa help for Indian passports";
const pageDescription =
  "Visa assistance for Indian passports. We list every document, quote the service fee before you pay, and keep the embassy fee separate. Thailand, Japan, the Schengen area, the UAE, and more.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: "/visa-services",
    images: [{ url: "/img/visa/visa-hero.jpg", alt: "Traveler with a passport at an airport window" }],
  },
};

const stats = [
  { icon: "places", figure: "14", label: "Destinations", detail: "The places listed on this page" },
  { icon: "reply", figure: "24 hrs", label: "First reply", detail: "Document list and a quote" },
  { icon: "file", figure: "2–3 days", label: "Our file time", detail: "After you send the papers. The embassy has its own clock." },
  { icon: "passport", figure: "India", label: "Passports we take", detail: "Tell us if the passport is from another country" },
] as const;

const services = [
  {
    title: "Tourist visa",
    visaType: "tourist",
    hint: "Apply for a tourist visa",
    heading: "Apply for a tourist visa",
    image: "/img/visa/visa-tourist.jpg?v=3",
    alt: "Passport and coffee on a sunlit cafe table",
    text: "Holiday and short stays. We check the photo rules, proof of funds, and the appointment window before a form is filed.",
  },
  {
    title: "Business visa",
    visaType: "business",
    hint: "Apply for a business visa",
    heading: "Apply for a business visa",
    image: "/img/visa/visa-business.jpg?v=3",
    alt: "Passport and notebook on a boardroom table at dusk",
    text: "Meetings and trade visits. The invitation, company papers, and travel plan are checked as one file.",
  },
  {
    title: "Family visit",
    visaType: "family",
    hint: "Apply for a family visit",
    heading: "Apply for a family visit",
    image: "/img/visa/visa-family.jpg?v=3",
    alt: "A family looking out of an airport window",
    text: "Visiting relatives. We line up the host letter, the relationship proof, and each traveller’s passport.",
  },
  {
    title: "Document check",
    visaType: "",
    hint: "Apply for a document check",
    heading: "Apply for a document check",
    image: "/img/visa/visa-documents.jpg?v=3",
    alt: "Passport, envelope, and pen arranged on linen",
    text: "A review before filing. A missing page or the wrong photo size is caught while it can still be fixed.",
  },
];

const promises = [
  { icon: "quote", label: "Quote before you pay" },
  { icon: "split", label: "Embassy fee kept separate" },
  { icon: "shield", label: "Nothing filed until you accept" },
] as const;

const countries = [
  { code: "th", name: "Thailand", note: "Tourist and business files, including the appointment window." },
  { code: "vn", name: "Vietnam", note: "Short-stay files with the photo and funds check done first." },
  { code: "sg", name: "Singapore", note: "Tourist, business, and family-visit papers prepared as one file." },
  { code: "my", name: "Malaysia", note: "Holiday and family visits, with each passport checked before filing." },
  { code: "id", name: "Indonesia", note: "Tourist stays, including the return date and proof of funds." },
  { code: "ae", name: "UAE", note: "Tourist and business visits, with the invitation read against the passport." },
  { code: "mv", name: "Maldives", note: "Holiday files for couples and families travelling together." },
  { code: "lk", name: "Sri Lanka", note: "Short stays, with the photo size and travel dates checked first." },
  { code: "np", name: "Nepal", note: "Tourist files, including overland and flight arrivals." },
  { code: "gb", name: "United Kingdom", note: "Visit visas, with funds, ties, and the travel plan in one file." },
  { code: "eu", name: "Schengen area", note: "A region, not one country. We prepare the file for the consulate that takes it." },
  { code: "tr", name: "Turkey", note: "Tourist and business visits, with the appointment booked after you accept the fee." },
  { code: "jp", name: "Japan", note: "Tourist and business files, including the itinerary and the photo rules." },
  { code: "au", name: "Australia", note: "Visitor files, with funds, travel dates, and each passport lined up." },
];

const steps = [
  {
    icon: "apply",
    title: "You apply",
    text: "Send the country, the passport nationality, and the travel dates. This page does not take a payment.",
  },
  {
    icon: "quote",
    title: "We quote",
    text: "Within 24 hours you get the document list, our fee, and the embassy fee kept as a separate line.",
  },
  {
    icon: "accept",
    title: "You accept",
    text: "Only then do we prepare the file, book an appointment where one is required, and contact the embassy.",
  },
  {
    icon: "stay",
    title: "We stay with it",
    text: "The file is ready in 2–3 days after your papers arrive. We remain until the embassy gives a decision.",
  },
] as const;

const faqs = [
  {
    question: "When do I pay, and what are the two fees?",
    answer:
      "You pay nothing to send this form. The quote has two lines: our service fee, and the embassy fee, which is paid to the embassy. You pay only after you accept that quote.",
  },
  {
    question: "How fast do you reply, and how long does the embassy take?",
    answer:
      "The first reply, with the document list and both fees, is within 24 hours. After you send the papers, our file is ready in 2–3 days. The embassy then decides on its own clock.",
  },
  {
    question: "What if the visa is refused?",
    answer:
      "The embassy decides, and a complete file can still be refused. We read the refusal with you and say what it means. The embassy fee is not ours to return.",
  },
  {
    question: "Do you book the appointment, and do you come with me?",
    answer:
      "When the country uses an appointment, we book it after you accept the fee. We prepare you for it. We do not sit the interview for you.",
  },
  {
    question: "Can one application cover my family?",
    answer:
      "Yes. Put the number of travellers on the form and name children or a shared appointment in the note. Each person still needs their own passport.",
  },
  {
    question: "What should I have ready before I apply?",
    answer:
      "The passport country, the destination, and the travel dates are enough to start. Passports, photos, and bank papers come after we send the list for your exact trip.",
  },
];

export default async function VisaPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; ref?: string }>;
}) {
  const [{ sent, ref }, user] = await Promise.all([searchParams, getCurrentUser()]);
  const customer =
    user?.scope === "customer"
      ? { name: user.name, email: user.email, phone: user.phone }
      : null;
  const reference = ref && /^BK-[A-Z0-9]+$/.test(ref) ? ref : "";
  const whatsapp = whatsAppHref(theme.contact.whatsapp);
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <WorldCompassHolidayFrame>
      <style>{`
        .worldcompassholiday-page .visa-control input,
        .worldcompassholiday-page .visa-control select,
        .worldcompassholiday-page .visa-control textarea {
          border: 1px solid var(--color-border) !important;
          background-color: #fff !important;
          width: 100%;
          border-radius: 4px;
          min-height: 42px;
          padding: 0 12px;
          font-size: 14px;
        }
        .worldcompassholiday-page .visa-control textarea {
          padding: 10px 12px;
          min-height: 68px;
        }
        .worldcompassholiday-page .visa-control input::placeholder,
        .worldcompassholiday-page .visa-control textarea::placeholder {
          color: #8b90a0;
        }
        .worldcompassholiday-page .visa-control.is-invalid input,
        .worldcompassholiday-page .visa-control.is-invalid select,
        .worldcompassholiday-page .visa-control.is-invalid textarea {
          border-color: #d92d20 !important;
          background-color: #fff6f5 !important;
        }
        .worldcompassholiday-page .visa-picker > button {
          display: flex !important;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          width: 100%;
          height: 42px;
          min-height: 42px;
          padding: 0 12px;
          border: 1px solid var(--color-border) !important;
          border-radius: 4px !important;
          background: #fff !important;
          color: #051036;
          font-size: 14px;
          font-weight: 400;
          line-height: 1.2;
          text-align: left;
          cursor: pointer;
          box-shadow: none;
        }
        .worldcompassholiday-page .visa-picker > button[aria-expanded="true"] {
          border-color: #3554d1 !important;
        }
        .worldcompassholiday-page .visa-picker.is-invalid > button {
          border-color: #d92d20 !important;
          background: #fff6f5 !important;
        }
        .worldcompassholiday-page .visa-picker > button > svg {
          width: 16px;
          height: 16px;
          flex: none;
          color: #697488;
        }
        .worldcompassholiday-page .visa-picker > button .text-muted {
          color: #8b90a0;
        }
        .worldcompassholiday-page .visa-picker > button > span {
          display: flex !important;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }
        .worldcompassholiday-page .visa-picker > input {
          position: absolute !important;
          width: 1px !important;
          height: 1px !important;
          min-height: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          border: 0 !important;
          opacity: 0 !important;
          pointer-events: none;
          overflow: hidden;
        }
        .app-select-menu button > span:has(.visa-mark),
        .app-select-menu button > span:has(.visa-type-icon) {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }
        .visa-type-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 16px;
          flex: none;
          color: #3554d1;
        }
        .visa-type-icon svg {
          width: 16px;
          height: 16px;
          display: block;
        }
        .visa-mark {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 16px;
          flex: none;
          font-size: 16px;
          line-height: 1;
        }
        .worldcompassholiday-page .visa-date {
          position: relative;
        }
        .worldcompassholiday-page .visa-date-container {
          display: block !important;
          width: 100%;
        }
        .worldcompassholiday-page .visa-date input {
          padding-right: 36px !important;
          color: #051036;
          cursor: pointer;
        }
        .worldcompassholiday-page .visa-date-icon {
          position: absolute;
          top: 50%;
          right: 12px;
          transform: translateY(-50%);
          color: #697488;
          font-size: 16px;
          line-height: 1;
          pointer-events: none;
        }
        .visa-calendar.rmdp-wrapper {
          border-radius: 8px;
          box-shadow: 0 12px 32px rgba(5, 16, 54, 0.16);
        }
        .visa-calendar .rmdp-day.rmdp-selected span:not(.highlight) {
          background-color: #051036 !important;
        }
        .visa-calendar .rmdp-day.rmdp-today span,
        .visa-calendar .rmdp-arrow-container:hover {
          background-color: #3554d1 !important;
          color: #fff;
        }
        .visa-calendar .rmdp-day:not(.rmdp-disabled):not(.rmdp-day-hidden) span:hover {
          background-color: #51658d !important;
          color: #fff;
        }
        .visa-calendar .rmdp-week-day {
          color: #3554d1 !important;
        }
        .visa-calendar .rmdp-arrow {
          margin-top: 7px;
        }
        .worldcompassholiday-page .visa-error {
          margin: 4px 0 0;
          color: #d92d20;
          font-size: 12px;
          line-height: 1.4;
        }
        .worldcompassholiday-page .visa-banner {
          margin: 0;
          border-radius: 4px;
          background: #fde8e6;
          color: #b42318;
          padding: 10px 12px;
          font-size: 14px;
        }
        .worldcompassholiday-page .visa-kicker {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border-radius: 100px;
          background: #e5f0fd;
          color: #3554d1;
          padding: 6px 12px;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.02em;
        }
        .worldcompassholiday-page .visa-kicker .visa-flag {
          width: 22px;
          height: 15px;
          box-shadow: 0 0 0 1px rgba(53, 84, 209, 0.2);
        }
        .worldcompassholiday-page .visa-promises {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 18px;
        }
        .worldcompassholiday-page .visa-promise {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 100px;
          border: 1px solid #d5d8e2;
          padding: 7px 12px;
          font-size: 13px;
          color: #051036;
          transition: transform 0.22s ease, border-color 0.22s ease, background 0.22s ease;
        }
        .worldcompassholiday-page .visa-promise:hover {
          transform: translateY(-2px);
          border-color: #3554d1;
          background: #f4f7ff;
        }
        .worldcompassholiday-page .visa-promise svg { color: #3554d1; flex: none; }
        .worldcompassholiday-page .visa-board {
          border-radius: 16px;
          background:
            radial-gradient(circle at 100% 0%, rgba(53, 84, 209, 0.55), transparent 42%),
            #051036;
          padding: 22px;
          color: #fff;
        }
        .worldcompassholiday-page .visa-stat {
          height: 100%;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: 16px 16px 14px;
          transition: transform 0.25s ease, background 0.25s ease, border-color 0.25s ease;
        }
        .worldcompassholiday-page .visa-stat:hover {
          transform: translateY(-4px) scale(1.03);
          background: rgba(255, 255, 255, 0.16);
          border-color: rgba(255, 255, 255, 0.28);
        }
        .worldcompassholiday-page .visa-stat-top {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .worldcompassholiday-page .visa-stat-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          flex: none;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.14);
          color: #fff;
        }
        .worldcompassholiday-page .visa-stat-icon svg {
          width: 18px;
          height: 18px;
          display: block;
        }
        .worldcompassholiday-page .visa-stat strong {
          display: block;
          color: #fff;
          font-size: 26px;
          font-weight: 600;
          line-height: 1.1;
        }
        .worldcompassholiday-page .visa-stat-label {
          display: block;
          margin-top: 8px;
          color: #fff;
          font-size: 14px;
          font-weight: 500;
        }
        .worldcompassholiday-page .visa-stat p {
          margin: 4px 0 0;
          color: rgba(255, 255, 255, 0.72);
          font-size: 13px;
          line-height: 1.45;
        }
        .worldcompassholiday-page .visa-hero {
          position: relative;
          overflow: hidden;
          border-radius: 22px;
          min-height: 520px;
          background: #051036;
        }
        .worldcompassholiday-page .visa-hero img {
          width: 100%;
          height: 560px;
          object-fit: cover;
          object-position: center 30%;
          transition: transform 0.6s ease;
        }
        .worldcompassholiday-page .visa-hero:hover img { transform: scale(1.04); }
        .worldcompassholiday-page .visa-hero-shade {
          position: absolute;
          right: 0;
          bottom: 0;
          left: 0;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          padding: 72px 16px 16px;
          background: linear-gradient(180deg, rgba(5, 16, 54, 0), rgba(5, 16, 54, 0.92) 42%);
        }
        .worldcompassholiday-page .visa-service {
          height: 100%;
          overflow: hidden;
          border-radius: 18px;
          background: #fff;
          border: 1px solid #e6e1d8;
          box-shadow: 0 18px 40px rgba(5, 16, 54, 0.08);
          transition: transform 0.28s ease, box-shadow 0.28s ease;
        }
        .worldcompassholiday-page .visa-service:hover {
          transform: translateY(-8px);
          box-shadow: 0 26px 48px rgba(5, 16, 54, 0.14);
        }
        .worldcompassholiday-page .visa-shot { position: relative; overflow: hidden; }
        .worldcompassholiday-page .visa-shot img {
          width: 100%;
          height: 200px;
          object-fit: cover;
          transition: transform 0.45s ease;
        }
        .worldcompassholiday-page .visa-service:hover .visa-shot img { transform: scale(1.08); }
        .worldcompassholiday-page .visa-shot::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(5, 16, 54, 0.02), rgba(5, 16, 54, 0.28));
        }
        .worldcompassholiday-page button.visa-service {
          display: flex;
          flex-direction: column;
          width: 100%;
          padding: 0;
          text-align: left;
          cursor: pointer;
          font: inherit;
          color: inherit;
        }
        .worldcompassholiday-page button.visa-service:focus-visible {
          outline: 2px solid #3554d1;
          outline-offset: 3px;
        }
        .worldcompassholiday-page .visa-service-body { padding: 18px 18px 22px; }
        .worldcompassholiday-page .visa-service-hint {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 12px;
          color: #3554d1;
          font-size: 13px;
          font-weight: 600;
          opacity: 0;
          transform: translateY(4px);
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        .worldcompassholiday-page button.visa-service:hover .visa-service-hint,
        .worldcompassholiday-page button.visa-service:focus-visible .visa-service-hint {
          opacity: 1;
          transform: none;
        }
        .worldcompassholiday-page .visa-track-head {
          max-width: 640px;
          margin: 0 auto;
          text-align: center;
        }
        .worldcompassholiday-page .visa-track-head p {
          margin: 10px auto 0;
          max-width: 520px;
          color: rgba(255, 255, 255, 0.72);
        }
        .worldcompassholiday-page .visa-timeline {
          position: relative;
          display: grid;
          gap: 28px;
          margin-top: 36px;
        }
        .worldcompassholiday-page .visa-time {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          border-radius: 14px;
          padding: 8px;
          transition: transform 0.25s ease, background 0.25s ease;
        }
        .worldcompassholiday-page .visa-time:hover {
          transform: translateY(-4px);
          background: rgba(255, 255, 255, 0.06);
        }
        .worldcompassholiday-page .visa-time:hover .visa-node { background: #3554d1; }
        .worldcompassholiday-page .visa-time:not(:last-child)::before {
          content: "";
          position: absolute;
          z-index: 0;
          top: 52px;
          left: 50%;
          width: 2px;
          height: calc(100% - 12px);
          transform: translateX(-50%);
          background: rgba(255, 255, 255, 0.28);
        }
        .worldcompassholiday-page .visa-arrows {
          position: absolute;
          z-index: 1;
          top: 60px;
          left: 50%;
          width: 16px;
          height: calc(100% - 36px);
          overflow: hidden;
          transform: translateX(-50%);
          pointer-events: none;
        }
        .worldcompassholiday-page .visa-arrows span {
          display: block;
          width: 100%;
          height: 200%;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='28' viewBox='0 0 16 28'%3E%3Cpath d='M3 6l5 5 5-5' fill='none' stroke='%23ffffff' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: repeat-y;
          background-size: 16px 28px;
          background-position: center 0;
          animation: visa-arrows-y 1.15s linear infinite;
        }
        .worldcompassholiday-page .visa-node {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #051036;
          border: 2px solid #fff;
          color: #fff;
          box-shadow: 0 0 0 4px rgba(53, 84, 209, 0.45);
          animation: visa-node-pulse 2.8s ease-in-out infinite;
        }
        .worldcompassholiday-page .visa-node svg {
          width: 22px;
          height: 22px;
          display: block;
        }
        .worldcompassholiday-page .visa-step-no {
          position: absolute;
          top: -6px;
          right: -6px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3554d1;
          border: 2px solid #051036;
          color: #fff;
          font-size: 11px;
          font-weight: 600;
          line-height: 1;
        }
        .worldcompassholiday-page .visa-time:nth-child(2) .visa-node,
        .worldcompassholiday-page .visa-time:nth-child(2) .visa-arrows span { animation-delay: 0.2s; }
        .worldcompassholiday-page .visa-time:nth-child(3) .visa-node,
        .worldcompassholiday-page .visa-time:nth-child(3) .visa-arrows span { animation-delay: 0.4s; }
        .worldcompassholiday-page .visa-time:nth-child(4) .visa-node { animation-delay: 0.6s; }
        .worldcompassholiday-page .visa-time h3 { color: #fff; font-size: 18px; font-weight: 500; margin-top: 14px; }
        .worldcompassholiday-page .visa-time p { margin-top: 6px; color: rgba(255, 255, 255, 0.78); font-size: 14px; line-height: 1.55; }
        .worldcompassholiday-page .visa-faq-list { display: grid; gap: 10px; margin-top: 22px; }
        .worldcompassholiday-page .visa-faq-item {
          border-radius: 14px;
          background: #fff;
          border: 1px solid #e6e1d8;
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
        }
        .worldcompassholiday-page .visa-faq-item:hover {
          transform: translateY(-2px);
          border-color: #c9d3f4;
        }
        .worldcompassholiday-page .visa-faq-item h3 { margin: 0; }
        .worldcompassholiday-page .visa-faq-item button {
          display: flex;
          width: 100%;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          border: 0;
          background: transparent;
          padding: 18px 20px;
          color: #051036;
          font-size: 16px;
          font-weight: 500;
          text-align: left;
          cursor: pointer;
        }
        .worldcompassholiday-page .visa-faq-mark {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          flex: none;
          border-radius: 50%;
          background: #e5f0fd;
          color: #3554d1;
          font-size: 18px;
          line-height: 1;
        }
        .worldcompassholiday-page .visa-faq-item p {
          margin: 0;
          padding: 0 20px 18px;
          color: #697488;
          font-size: 14px;
          line-height: 1.6;
        }
        .worldcompassholiday-page .visa-faq-item.is-open { box-shadow: 0 12px 30px rgba(5, 16, 54, 0.06); }
        .worldcompassholiday-page .visa-country {
          height: 100%;
          border-radius: 14px;
          background: #fff;
          border: 1px solid #e7e9f0;
          padding: 14px 16px;
          transition: transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease;
        }
        .worldcompassholiday-page button.visa-country {
          display: block;
          width: 100%;
          text-align: left;
          cursor: pointer;
          font: inherit;
          color: inherit;
        }
        .worldcompassholiday-page button.visa-country:hover,
        .worldcompassholiday-page button.visa-country:focus-visible {
          position: relative;
          z-index: 3;
          transform: scale(1.06);
          border-color: #b7c6f6;
          box-shadow: 0 16px 34px rgba(53, 84, 209, 0.16);
        }
        .worldcompassholiday-page button.visa-country:focus-visible {
          outline: 2px solid #3554d1;
          outline-offset: 3px;
        }
        .worldcompassholiday-page .visa-country-ask:hover {
          transform: scale(1.06);
          box-shadow: 0 16px 34px rgba(53, 84, 209, 0.16);
        }
        .worldcompassholiday-page .visa-country-name {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .worldcompassholiday-page .visa-country strong { display: block; font-size: 15px; font-weight: 600; line-height: 1.2; }
        .worldcompassholiday-page .visa-flag {
          display: block;
          width: 32px;
          height: 22px;
          flex: none;
          border-radius: 3px;
          overflow: hidden;
          box-shadow: 0 0 0 1px rgba(5, 16, 54, 0.12);
        }
        .worldcompassholiday-page .visa-country p { margin: 6px 0 0; color: #697488; font-size: 13px; line-height: 1.45; }
        .worldcompassholiday-page .visa-country-hint {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 10px;
          color: #3554d1;
          font-size: 12px;
          font-weight: 600;
          opacity: 0;
          transform: translateY(4px);
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        .worldcompassholiday-page .visa-action-arrow {
          display: inline-block;
          transition: transform 0.2s ease;
        }
        .worldcompassholiday-page button.visa-country:hover .visa-action-arrow,
        .worldcompassholiday-page button.visa-country:focus-visible .visa-action-arrow,
        .worldcompassholiday-page button.visa-service:hover .visa-action-arrow,
        .worldcompassholiday-page button.visa-service:focus-visible .visa-action-arrow,
        .worldcompassholiday-page .visa-country-cta:hover .visa-action-arrow {
          transform: translateX(3px);
        }
        .worldcompassholiday-page button.visa-country:hover .visa-country-hint,
        .worldcompassholiday-page button.visa-country:focus-visible .visa-country-hint {
          opacity: 1;
          transform: none;
        }
        .worldcompassholiday-page .visa-country-ask {
          display: flex;
          flex-direction: column;
          background: #f4f7ff;
          border-color: #d5def8;
        }
        .worldcompassholiday-page .visa-country-cta {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          align-self: flex-start;
          margin-top: 12px;
          height: 34px;
          padding: 0 12px;
          border: 0;
          border-radius: 8px;
          background: #3554d1;
          color: #fff;
          font-size: 13px;
          font-weight: 500;
          line-height: 1;
          cursor: pointer;
        }
        .worldcompassholiday-page .visa-country-cta:hover { background: #2b46b8; }
        .worldcompassholiday-page .visa-band { background: #f6f3ee; }
        .worldcompassholiday-page .visa-track { background: #051036; color: #fff; }
        @keyframes visa-arrows-y {
          from { background-position: center -28px; }
          to { background-position: center 0; }
        }
        @keyframes visa-arrows-x {
          from { background-position: -28px center; }
          to { background-position: 0 center; }
        }
        @keyframes visa-node-pulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(53, 84, 209, 0.45); }
          50% { box-shadow: 0 0 0 8px rgba(53, 84, 209, 0.12); }
        }
        @media (prefers-reduced-motion: reduce) {
          .worldcompassholiday-page .visa-node,
          .worldcompassholiday-page .visa-arrows span { animation: none; }
          .worldcompassholiday-page .visa-country,
          .worldcompassholiday-page .visa-service,
          .worldcompassholiday-page .visa-stat,
          .worldcompassholiday-page .visa-promise,
          .worldcompassholiday-page .visa-time,
          .worldcompassholiday-page .visa-faq-item,
          .worldcompassholiday-page .visa-hero img,
          .worldcompassholiday-page .visa-shot img,
          .worldcompassholiday-page .visa-country-hint,
          .worldcompassholiday-page .visa-service-hint,
          .worldcompassholiday-page .visa-action-arrow,
          .worldcompassholiday-page button.visa-country:hover .visa-action-arrow,
          .worldcompassholiday-page button.visa-service:hover .visa-action-arrow,
          .worldcompassholiday-page .visa-country-cta:hover .visa-action-arrow {
            transition: none;
            transform: none;
          }
          .worldcompassholiday-page button.visa-country:hover,
          .worldcompassholiday-page button.visa-country:focus-visible,
          .worldcompassholiday-page .visa-country-ask:hover,
          .worldcompassholiday-page .visa-service:hover,
          .worldcompassholiday-page .visa-stat:hover,
          .worldcompassholiday-page .visa-promise:hover,
          .worldcompassholiday-page .visa-time:hover,
          .worldcompassholiday-page .visa-faq-item:hover,
          .worldcompassholiday-page .visa-hero:hover img,
          .worldcompassholiday-page .visa-service:hover .visa-shot img { transform: none; }
        }
        @media (min-width: 992px) {
          .worldcompassholiday-page .visa-timeline {
            grid-template-columns: repeat(4, 1fr);
            gap: 28px;
            align-items: start;
          }
          .worldcompassholiday-page .visa-time:not(:last-child)::before {
            top: 25px;
            left: 50%;
            width: calc(100% + 28px);
            height: 2px;
            transform: none;
          }
          .worldcompassholiday-page .visa-arrows {
            top: 14px;
            left: calc(50% + 32px);
            width: calc(100% - 24px);
            height: 24px;
            transform: none;
          }
          .worldcompassholiday-page .visa-arrows span {
            width: 200%;
            height: 100%;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='12' viewBox='0 0 28 12'%3E%3Cpath d='M4 2l5 4-5 4' fill='none' stroke='%23ffffff' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
            background-repeat: repeat-x;
            background-size: 28px 12px;
            background-position: 0 center;
            animation-name: visa-arrows-x;
          }
        }
        .worldcompassholiday-page .visa-modal {
          position: fixed;
          inset: 0;
          z-index: 1200;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          overflow: auto;
          padding: 32px 16px;
          background: rgba(5, 16, 54, 0.55);
        }
        .worldcompassholiday-page .visa-dialog {
          width: min(920px, 100%);
          margin: auto;
          border-radius: 12px;
          background: #fff;
          padding: 22px;
        }
        .worldcompassholiday-page .visa-cta { margin-top: 28px; }
        .worldcompassholiday-page .visa-form-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 16px;
          margin-top: 8px;
          padding: 18px 4px 4px;
        }
        .worldcompassholiday-page .visa-close {
          width: 36px;
          height: 36px;
          border: 0;
          border-radius: 50%;
          background: #f5f5f5;
          color: #051036;
          font-size: 22px;
          line-height: 1;
        }
        .worldcompassholiday-page .visa-actions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px;
          margin-top: 16px;
        }
        .worldcompassholiday-page .visa-whatsapp {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 60px;
          padding: 0 28px;
          border: 0;
          border-radius: 4px;
          background: #128c7e;
          color: #fff;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
        }
        .worldcompassholiday-page .visa-whatsapp:hover { background: #0e7569; color: #fff; }
        .worldcompassholiday-page .visa-whatsapp:disabled { opacity: 0.7; cursor: default; }
        .worldcompassholiday-page .visa-whatsapp-form { height: 50px; padding: 0 18px; }
        .worldcompassholiday-page .visa-footer-links a {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .worldcompassholiday-page .visa-footer {
          background: #051036;
          color: #fff;
        }
        .worldcompassholiday-page .visa-footer a { color: #fff; }
        .worldcompassholiday-page .visa-footer-links {
          display: flex;
          flex-wrap: wrap;
          gap: 10px 18px;
        }
        @media (max-width: 767px) {
          .worldcompassholiday-page .visa-modal { padding: 12px; }
          .worldcompassholiday-page .visa-dialog { padding: 16px; }
        }
      `}</style>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <section className="pt-40 pb-40">
        <div className="container">
          <div className="row y-gap-30 items-center">
            <div className="col-lg-6">
              <p className="visa-kicker">
                <CountryFlag code="in" />
                Indian passports
              </p>
              <h1 className="text-40 fw-600 mt-15">Visa help, quoted before anything is filed</h1>
              <p className="text-15 text-light-1 mt-15">
                {theme.brandName} reads the rules for your passport, lists every document, and prepares the file. You pay nothing to apply.
              </p>
              <div className="visa-promises">
                {promises.map((item) => (
                  <span className="visa-promise" key={item.label}>
                    <PromiseIcon name={item.icon} />
                    {item.label}
                  </span>
                ))}
              </div>
              <VisaApply sent={sent === "1"} reference={reference} customer={customer} />
              <p className="text-14 mt-15">
                <a href="/contact">Talk to the desk before you apply</a>
              </p>
            </div>
            <div className="col-lg-6">
              <div className="visa-hero">
                <img src="/img/visa/visa-hero.jpg?v=3" alt="Traveler with a passport at an airport window" />
                <div className="visa-hero-shade">
                  {stats.map((item) => (
                    <article className="visa-stat" key={item.label}>
                      <div className="visa-stat-top">
                        <span className="visa-stat-icon">
                          <VisaStatIcon name={item.icon} />
                        </span>
                        <strong>{item.figure}</strong>
                      </div>
                      <span className="visa-stat-label">{item.label}</span>
                      <p>{item.detail}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <VisaServiceSection services={services} customer={customer} />

      <section className="visa-track pt-40 pb-40">
        <div className="container">
          <div className="visa-track-head">
            <h2 className="text-26 fw-500">How an application moves</h2>
            <p className="text-15">
              Four steps, in order. The embassy is not contacted until you accept the quote.
            </p>
          </div>
          <div className="visa-timeline">
            {steps.map((step, index) => (
              <article className="visa-time" key={step.title}>
                <div className="visa-node">
                  <VisaStepIcon name={step.icon} />
                  <span className="visa-step-no">{index + 1}</span>
                </div>
                {index < steps.length - 1 ? (
                  <span className="visa-arrows" aria-hidden="true">
                    <span />
                  </span>
                ) : null}
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <VisaCountrySection
        countries={countries}
        sent={sent === "1"}
        reference={reference}
        customer={customer}
      />

      <section className="visa-band pt-40 pb-40">
        <div className="container">
          <div className="row justify-center">
            <div className="col-lg-8">
              <h2 className="text-26 fw-500">Questions before you apply</h2>
              <p className="text-15 text-light-1 mt-10">
                Fees, timing, a refusal, and who the form can cover.
              </p>
              <VisaFaq items={faqs} />
            </div>
          </div>
        </div>
      </section>
      <footer className="visa-footer pt-30 pb-30">
        <div className="container">
          <h2 className="text-18 fw-500">{theme.brandName} visa desk</h2>
          <p className="text-14 mt-10">
            {theme.contact.city}. Indian passports. We quote before you pay, and the embassy fee stays separate.
          </p>
          <div className="visa-footer-links mt-15 text-14">
            <a href={`tel:${theme.contact.phone.replace(/\s/g, "")}`}>{theme.contact.phone}</a>
            <a href={`mailto:${theme.contact.email}`}>{theme.contact.email}</a>
            {whatsapp ? (
              <a
                href={`${whatsapp}?text=${encodeURIComponent("Hello, I need visa help for an Indian passport.")}`}
                target="_blank"
                rel="noreferrer"
              >
                <WhatsAppIcon />
                WhatsApp
              </a>
            ) : null}
            <a href="/contact">Contact</a>
            <a href="/">Home</a>
          </div>
        </div>
      </footer>
    </WorldCompassHolidayFrame>
  );
}
