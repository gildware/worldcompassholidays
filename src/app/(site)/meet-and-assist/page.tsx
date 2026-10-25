import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AssistDesk } from "@/components/assist/AssistDesk";
import { WorldCompassHolidayFrame } from "@/components/worldcompassholiday/WorldCompassHolidayFrame";
import { pageMetadata } from "@/lib/seo";
import "@/styles/assist-desk.css";

const pageTitle = "Meet and assist at the airport";
const pageDescription =
  "A greeter meets you on arrival, departure, or a connection. We quote the fee before anyone is booked.";

export const metadata: Metadata = pageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: "/meet-and-assist",
  image: "/img/assist/assist-arrival.jpg",
  imageAlt: "A greeter meeting a traveller at an airport",
});

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
  const { sent, ref } = await searchParams;
  if (sent === "1") {
    const reference = ref && /^BK-[A-Z0-9]+$/.test(ref) ? ref : "";
    redirect(reference ? `/meet-and-assist/request?sent=1&ref=${reference}` : "/meet-and-assist/request?sent=1");
  }

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
      <AssistDesk />
    </WorldCompassHolidayFrame>
  );
}
