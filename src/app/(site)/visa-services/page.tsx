import type { Metadata } from "next";
import { WorldCompassHolidayFrame } from "@/components/worldcompassholiday/WorldCompassHolidayFrame";
import { VisaApply } from "@/components/visa/VisaApply";
import { VisaCountrySection } from "@/components/visa/VisaCountrySection";
import { VisaServiceSection } from "@/components/visa/VisaServiceSection";
import { VisaFaq } from "@/components/visa/VisaFaq";
import { CountryFlag } from "@/components/visa/CountryFlag";
import { PromiseIcon, VisaStatIcon, VisaStepIcon } from "@/components/visa/VisaIcons";
import { theme } from "@/config/theme";
import "@/styles/service-desk.css";
import { getCurrentUser } from "@/lib/auth/session";
import { pageMetadata } from "@/lib/seo";

const pageTitle = "Visa help for Indian passports";
const pageDescription =
  "Visa assistance for Indian passports. We list every document, quote the service fee before you pay, and keep the embassy fee separate. Thailand, Japan, the Schengen area, the UAE, and more.";

export const metadata: Metadata = pageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: "/visa-services",
  image: "/img/visa/visa-hero.jpg",
  imageAlt: "Traveler with a passport at an airport window",
});

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
                <a href="/meet-and-assist">Need someone at the airport? Meet and assist is separate.</a>
              </p>
              <p className="text-14 mt-5">
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
    </WorldCompassHolidayFrame>
  );
}
