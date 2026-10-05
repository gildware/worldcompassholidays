import type { Metadata } from "next";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { PageIntro } from "@/components/site/PageIntro";
import { getCurrentUser } from "@/lib/auth/session";
import { enquiryInterests } from "@/lib/navigation";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const [{ sent }, user] = await Promise.all([searchParams, getCurrentUser()]);
  const customer =
    user?.scope === "customer"
      ? { name: user.name, email: user.email, phone: user.phone }
      : null;

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[0.9fr_1.1fr]">
      <PageIntro
        eyebrow="Contact"
        title="Tell us what you want to book"
        description="Treks start as an enquiry. The team quotes, confirms, and closes it from the same record."
      />
      <EnquiryForm
        interests={enquiryInterests()}
        sent={sent === "1"}
        customer={customer}
      />
    </div>
  );
}
