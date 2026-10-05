export type AddonQuoteInput = {
  configId: string;
  name: string;
  price: number;
  priceUnit: "flat" | "per_day" | string;
  quantity: number;
};

export type QuoteInput = {
  pickupAt: Date;
  returnAt: Date;
  pricePerDay: number;
  pricePerWeek: number;
  pricePerMonth: number;
  securityDeposit: number;
  extraKmCharge: number;
  lateReturnCharge: number;
  includedKmPerDay: number;
  discountType: string;
  discountValue: number;
  taxPercent: number;
  currency: string;
  addons: AddonQuoteInput[];
};

export type QuoteLine = { label: string; amount: number };

export type AddonQuoteLine = AddonQuoteInput & { amount: number };

export type RentalQuote = {
  days: number;
  pickupAt: string;
  returnAt: string;
  lines: QuoteLine[];
  baseAmount: number;
  addons: AddonQuoteLine[];
  addonsAmount: number;
  discountType: string;
  discountValue: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  securityDeposit: number;
  extraKmCharge: number;
  lateReturnChargePerHour: number;
  includedKmPerDay: number;
  totalAmount: number;
  amountDue: number;
  currency: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function rentalDays(pickupAt: Date, returnAt: Date) {
  const span = returnAt.getTime() - pickupAt.getTime();
  if (span <= 0) return 0;
  return Math.ceil(span / DAY_MS);
}

export function quoteRental(input: QuoteInput): RentalQuote {
  const days = rentalDays(input.pickupAt, input.returnAt);
  if (days < 1) {
    throw new Error("Return must be after pickup. The minimum rental is one day.");
  }
  if (input.pricePerDay < 1) {
    throw new Error("This vehicle does not have a daily price yet.");
  }

  const lines: QuoteLine[] = [];
  let remaining = days;
  let baseAmount = 0;

  if (input.pricePerMonth > 0 && remaining >= 30) {
    const months = Math.floor(remaining / 30);
    const amount = months * input.pricePerMonth;
    baseAmount += amount;
    lines.push({
      label: `${months} month${months === 1 ? "" : "s"} × ${input.pricePerMonth}`,
      amount,
    });
    remaining -= months * 30;
  }

  if (input.pricePerWeek > 0 && remaining >= 7) {
    const weeks = Math.floor(remaining / 7);
    const amount = weeks * input.pricePerWeek;
    baseAmount += amount;
    lines.push({
      label: `${weeks} week${weeks === 1 ? "" : "s"} × ${input.pricePerWeek}`,
      amount,
    });
    remaining -= weeks * 7;
  }

  if (remaining > 0) {
    const amount = remaining * input.pricePerDay;
    baseAmount += amount;
    lines.push({
      label: `${remaining} day${remaining === 1 ? "" : "s"} × ${input.pricePerDay}`,
      amount,
    });
  }

  const addons = input.addons.map((addon) => {
    const quantity = Math.max(1, addon.quantity);
    const amount =
      addon.priceUnit === "per_day"
        ? addon.price * days * quantity
        : addon.price * quantity;
    return { ...addon, quantity, amount };
  });
  const addonsAmount = addons.reduce((sum, addon) => sum + addon.amount, 0);

  let discountAmount = 0;
  if (input.discountType === "percent") {
    const percent = Math.min(100, Math.max(0, input.discountValue));
    discountAmount = Math.round((baseAmount * percent) / 100);
  } else if (input.discountType === "flat") {
    discountAmount = Math.min(baseAmount, Math.max(0, input.discountValue));
  }

  const taxable = Math.max(0, baseAmount + addonsAmount - discountAmount);
  const taxPercent = Math.max(0, input.taxPercent);
  const taxAmount = Math.round((taxable * taxPercent) / 100);
  const totalAmount = taxable + taxAmount;
  const securityDeposit = Math.max(0, input.securityDeposit);

  return {
    days,
    pickupAt: input.pickupAt.toISOString(),
    returnAt: input.returnAt.toISOString(),
    lines,
    baseAmount,
    addons,
    addonsAmount,
    discountType: input.discountType,
    discountValue: input.discountValue,
    discountAmount,
    taxPercent,
    taxAmount,
    securityDeposit,
    extraKmCharge: Math.max(0, input.extraKmCharge),
    lateReturnChargePerHour: Math.max(0, input.lateReturnCharge),
    includedKmPerDay: Math.max(0, input.includedKmPerDay),
    totalAmount,
    amountDue: totalAmount + securityDeposit,
    currency: input.currency || "INR",
  };
}

export function parseQuote(snapshot: string): RentalQuote | null {
  try {
    const value = JSON.parse(snapshot) as RentalQuote;
    if (!value || typeof value.amountDue !== "number") return null;
    return value;
  } catch {
    return null;
  }
}

export function extraReturnCharges(input: {
  includedKmPerDay: number;
  days: number;
  drivenKm: number;
  extraKmCharge: number;
  lateHours: number;
  lateReturnChargePerHour: number;
}) {
  const included =
    input.includedKmPerDay > 0 ? input.includedKmPerDay * input.days : null;
  const extraKm =
    included === null ? 0 : Math.max(0, input.drivenKm - included);
  const kmAmount = extraKm * Math.max(0, input.extraKmCharge);
  const lateHours = Math.max(0, input.lateHours);
  const lateAmount = lateHours * Math.max(0, input.lateReturnChargePerHour);
  return { extraKm, kmAmount, lateHours, lateAmount, total: kmAmount + lateAmount };
}
