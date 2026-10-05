import { formatMoney } from "@/lib/format";
import type { RentalQuote } from "@/lib/rentals/pricing";

export function PriceBreakdown({ quote }: { quote: RentalQuote }) {
  const currency = quote.currency || "INR";
  const rows = [
    ...quote.lines.map((line) => ({ label: line.label, amount: line.amount })),
    ...quote.addons.map((addon) => ({
      label: `${addon.name}${addon.priceUnit === "per_day" ? " / day" : ""}`,
      amount: addon.amount,
    })),
  ];

  return (
    <div className="rounded-xl border border-line bg-white">
      <dl className="divide-y divide-line text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 px-4 py-3">
            <dt className="text-muted">{row.label}</dt>
            <dd>{formatMoney(row.amount, currency)}</dd>
          </div>
        ))}
        {quote.discountAmount > 0 ? (
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <dt className="text-muted">Discount</dt>
            <dd>−{formatMoney(quote.discountAmount, currency)}</dd>
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <dt className="text-muted">Tax ({quote.taxPercent}%)</dt>
          <dd>{formatMoney(quote.taxAmount, currency)}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <dt>Rental total</dt>
          <dd className="font-semibold">{formatMoney(quote.totalAmount, currency)}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <dt className="text-muted">Security deposit</dt>
          <dd>{formatMoney(quote.securityDeposit, currency)}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 bg-surface px-4 py-3">
          <dt className="font-semibold">Amount due</dt>
          <dd className="text-base font-semibold">{formatMoney(quote.amountDue, currency)}</dd>
        </div>
      </dl>
      <p className="px-4 py-3 text-xs leading-5 text-muted">
        {quote.includedKmPerDay > 0
          ? `${quote.includedKmPerDay} km included per day. Extra kilometres are ${formatMoney(quote.extraKmCharge, currency)} each.`
          : "Unlimited kilometres on this quote."}{" "}
        Late return is {formatMoney(quote.lateReturnChargePerHour, currency)} per hour. The deposit is
        held separately from the rental total. This price is saved with the booking.
      </p>
    </div>
  );
}
