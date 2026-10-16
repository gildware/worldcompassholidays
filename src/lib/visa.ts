export const visaTypeLabels: Record<string, string> = {
  tourist: "Tourist",
  business: "Business",
  family: "Family visit",
  transit: "Transit",
  other: "Not sure yet",
};

export type VisaDetails = {
  country: string;
  nationality: string;
  visaType: string;
  staffNote: string;
  channel: string;
};

export function readVisaDetails(raw: string): VisaDetails {
  try {
    const data = JSON.parse(raw) as Partial<VisaDetails>;
    return {
      country: typeof data.country === "string" ? data.country : "",
      nationality: typeof data.nationality === "string" ? data.nationality : "",
      visaType: typeof data.visaType === "string" ? data.visaType : "",
      staffNote: typeof data.staffNote === "string" ? data.staffNote : "",
      channel: typeof data.channel === "string" ? data.channel : "",
    };
  } catch {
    return { country: "", nationality: "", visaType: "", staffNote: "", channel: "" };
  }
}

export function whatsAppHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return null;
  return `https://wa.me/${digits}`;
}

export function visaTypeLabel(value: string) {
  return visaTypeLabels[value] ?? (value || "Not set");
}

export function visaWhatsAppText(input: {
  reference: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  nationality: string;
  visaType: string;
  departure: string;
  returnDate: string;
  travellers: number;
  message: string;
}) {
  const lines = [
    `Visa help request ${input.reference}`,
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    `Phone: ${input.phone}`,
    `Destination: ${input.country}`,
    `Nationality: ${input.nationality}`,
    `Visa type: ${visaTypeLabel(input.visaType)}`,
    `Departure: ${input.departure}`,
    `Return: ${input.returnDate}`,
    `Travellers: ${input.travellers}`,
  ];
  if (input.message) lines.push(`Note: ${input.message}`);
  return lines.join("\n");
}
