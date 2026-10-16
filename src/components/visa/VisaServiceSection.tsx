"use client";

import { useState } from "react";
import { VisaApplyDialog } from "@/components/visa/VisaApply";

type Service = {
  title: string;
  image: string;
  alt: string;
  text: string;
  visaType: string;
  hint: string;
  heading: string;
};

type Customer = { name: string; email: string; phone: string } | null;

export function VisaServiceSection({
  services,
  customer,
}: {
  services: Service[];
  customer: Customer;
}) {
  const [service, setService] = useState<Service | null>(null);

  return (
    <section className="visa-band pt-40 pb-40">
      <div className="container">
        <h2 className="text-26 fw-500">What we prepare</h2>
        <div className="row y-gap-20 pt-20">
          {services.map((item) => (
            <div className="col-lg-3 col-sm-6" key={item.title}>
              <button type="button" className="visa-service" onClick={() => setService(item)}>
                <div className="visa-shot">
                  <img src={item.image} alt={item.alt} />
                </div>
                <div className="visa-service-body">
                  <h3 className="text-18 fw-500">{item.title}</h3>
                  <p className="text-14 text-light-1 mt-10">{item.text}</p>
                  <span className="visa-service-hint">
                    {item.hint}
                    <span className="visa-action-arrow" aria-hidden="true">
                      →
                    </span>
                  </span>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>
      <VisaApplyDialog
        open={service !== null}
        onClose={() => setService(null)}
        customer={customer}
        visaType={service?.visaType ?? ""}
        heading={service?.heading ?? ""}
      />
    </section>
  );
}
