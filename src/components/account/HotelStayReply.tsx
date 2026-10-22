"use client";

import { useActionState, useState } from "react";
import { leaveHotelReply } from "@/actions/account";
import { FormMessage } from "@/components/forms/FormMessage";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { initialFormState } from "@/lib/forms";
import { hotelReplyTopics, type HotelReply } from "@/lib/hotel-reply";

function TopicStars({ name, label, initial }: { name: string; label: string; initial: number }) {
  const [value, setValue] = useState(initial);

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm">{label}</span>
      <span className="inline-flex" role="group" aria-label={`${label} rating`}>
        {Array.from({ length: 5 }, (_, index) => {
          const score = index + 1;
          const selected = score <= value;
          return (
            <button
              key={score}
              type="button"
              className={`px-0.5 text-base leading-none ${selected ? "text-amber-500" : "text-gray-300"}`}
              aria-label={`${score} star${score === 1 ? "" : "s"}`}
              aria-pressed={selected}
              onClick={() => setValue(score)}
            >
              ★
            </button>
          );
        })}
      </span>
      <input type="hidden" name={name} value={value} />
    </div>
  );
}

export function HotelStayReply({ reference, review }: { reference: string; review: HotelReply | null }) {
  const [state, action] = useActionState(leaveHotelReply, initialFormState);

  return (
    <form action={action} className="grid gap-4 rounded-xl border border-line bg-white p-5">
      <div>
        <h2 className="text-lg font-semibold">Leave a Reply</h2>
        <p className="mt-1 text-sm text-muted">This stay is on your account, so the reply is saved with the booking.</p>
      </div>
      <FormMessage state={state} />
      <input type="hidden" name="reference" value={reference} />
      <div className="grid gap-2 sm:grid-cols-2">
        {hotelReplyTopics.map((topic) => (
          <TopicStars key={topic} name={topic} label={topic} initial={review?.ratings[topic] ?? 5} />
        ))}
      </div>
      <label className="grid gap-2 text-sm font-medium">
        Comment
        <textarea name="comment" required rows={3} defaultValue={review?.comment ?? ""} maxLength={2000} />
      </label>
      <div>
        <SubmitButton pendingLabel="Saving">{review ? "Update reply" : "Post comment"}</SubmitButton>
      </div>
    </form>
  );
}
