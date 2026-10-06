"use client";

import DatePicker, { type DateObject } from "react-multi-date-picker";

export function DateSearch({
  dates,
  onChange,
}: {
  dates: DateObject[];
  onChange: (dates: DateObject[]) => void;
}) {
  return (
    <div className="text-15 text-light-1 ls-2 lh-16 custom_dual_datepicker">
      <DatePicker
        inputClass="custom_input-picker"
        containerClassName="custom_container-picker"
        value={dates}
        onChange={(value) => {
          if (!value) return;
          onChange(Array.isArray(value) ? value : [value]);
        }}
        numberOfMonths={2}
        offsetY={10}
        range
        rangeHover
        format="MMMM DD"
      />
    </div>
  );
}
