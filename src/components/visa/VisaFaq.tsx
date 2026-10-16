"use client";

import { useState } from "react";

export function VisaFaq({ items }: { items: { question: string; answer: string }[] }) {
  const [open, setOpen] = useState(0);

  return (
    <div className="visa-faq-list">
      {items.map((item, index) => {
        const expanded = open === index;
        return (
          <article className={`visa-faq-item${expanded ? " is-open" : ""}`} key={item.question}>
            <h3>
              <button
                type="button"
                aria-expanded={expanded}
                onClick={() => setOpen(expanded ? -1 : index)}
              >
                <span>{item.question}</span>
                <span className="visa-faq-mark" aria-hidden="true">
                  {expanded ? "–" : "+"}
                </span>
              </button>
            </h3>
            {expanded ? <p>{item.answer}</p> : null}
          </article>
        );
      })}
    </div>
  );
}
