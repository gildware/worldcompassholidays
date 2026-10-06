"use client";

import DatePicker, { type DateObject } from "react-multi-date-picker";

export function DateSearch({
  date,
  onChange,
}: {
  date: DateObject | null;
  onChange: (date: DateObject | null) => void;
}) {
  return (
    <div className="text-15 text-light-1 ls-2 lh-16 custom_dual_datepicker">
      <DatePicker
        inputClass="custom_input-picker"
        containerClassName="custom_container-picker"
        value={date}
        onChange={(value) => {
          if (!value || Array.isArray(value)) {
            onChange(Array.isArray(value) ? (value[0] ?? null) : null);
            return;
          }
          onChange(value);
        }}
        numberOfMonths={2}
        offsetY={10}
        format="MMMM DD"
      />
    </div>
  );
}
