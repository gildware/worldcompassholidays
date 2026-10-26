import Link from "next/link";
import { CountryFlag } from "@/components/visa/CountryFlag";
import { VisaApply } from "@/components/visa/VisaApply";
import { visaApplyPath } from "@/lib/visa";

type Country = { code: string; name: string; note: string };
type Customer = { name: string; email: string; phone: string } | null;

function countryAction(name: string) {
  return name === "Schengen area" ? "Apply for the Schengen area Visa" : `Apply for ${name} Visa`;
}

export function VisaCountrySection({
  countries,
  sent,
  reference,
  customer,
  whatsappPhone,
}: {
  countries: Country[];
  sent: boolean;
  reference: string;
  customer: Customer;
  whatsappPhone?: string;
}) {
  return (
    <section className="pt-20 pb-40">
      <div className="container">
        <div className="d-flex flex-wrap items-end justify-between y-gap-10">
          <h2 className="text-26 fw-500">Countries we prepare visas for</h2>
          <p className="text-14 text-light-1">Choose a country to start the file.</p>
        </div>
        <div className="row y-gap-15 pt-20">
          {countries.map((item) => (
            <div className="col-lg-3 col-md-4 col-6" key={item.name}>
              <Link href={visaApplyPath({ country: item.name })} className="visa-country">
                <div className="visa-country-name">
                  <CountryFlag code={item.code} />
                  <strong>{item.name}</strong>
                </div>
                <p>{item.note}</p>
                <span className="visa-country-hint">
                  {countryAction(item.name)}
                  <span className="visa-action-arrow" aria-hidden="true">
                    →
                  </span>
                </span>
              </Link>
            </div>
          ))}
          <div className="col-6 col-md-4 col-lg-3">
            <VisaApply
              sent={sent}
              reference={reference}
              customer={customer}
              tile
              whatsappPhone={whatsappPhone}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
