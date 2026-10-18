import type { Metadata } from "next";
import { AssistDesk } from "@/components/assist/AssistDesk";
import { WorldCompassHolidayFrame } from "@/components/worldcompassholiday/WorldCompassHolidayFrame";
import { getCurrentUser } from "@/lib/auth/session";
import "@/styles/assist-desk.css";

const pageTitle = "Meet and assist at the airport";
const pageDescription =
  "A greeter meets you on arrival, departure, or a connection. We quote the fee before anyone is booked.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: "/meet-and-assist",
  },
};

const faqs = [
  {
    question: "Is this the same as visa help?",
    answer: "No. Meet and assist is someone at the airport on the day you fly. Visa help prepares the file before you travel.",
  },
  {
    question: "When do I pay?",
    answer: "You pay nothing to send the flight. The quote names the fee. A greeter is booked only after you accept it.",
  },
  {
    question: "What if my flight is late?",
    answer: "Send the flight number. The greeter follows that flight, not the time printed on the ticket.",
  },
  {
    question: "Can one request cover my family?",
    answer: "Yes. Put the number of travellers on the slip and the name for the board in the note.",
  },
];

export default async function MeetAndAssistPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; ref?: string }>;
}) {
  const [{ sent, ref }, user] = await Promise.all([searchParams, getCurrentUser()]);
  const customer = user?.scope === "customer" ? { name: user.name, email: user.email, phone: user.phone } : null;
  const reference = ref && /^BK-[A-Z0-9]+$/.test(ref) ? ref : "";
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <AssistDesk sent={sent === "1"} reference={reference} customer={customer} />
    </WorldCompassHolidayFrame>
  );
}
