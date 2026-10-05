"use client";

import { useState } from "react";
import { MultiSearchableSelect, type SelectOption } from "@/components/ui/SearchableSelect";

export function NamedMultiSelect({
  name,
  defaultValues,
  options,
  placeholder,
  searchPlaceholder,
  ariaLabel,
}: {
  name: string;
  defaultValues: string[];
  options: readonly SelectOption[];
  placeholder: string;
  searchPlaceholder: string;
  ariaLabel: string;
}) {
  const [values, setValues] = useState(defaultValues);

  return (
    <>
      {values.map((id) => (
        <input key={id} type="hidden" name={name} value={id} />
      ))}
      <MultiSearchableSelect
        values={values}
        onChange={setValues}
        options={options}
        placeholder={placeholder}
        searchPlaceholder={searchPlaceholder}
        ariaLabel={ariaLabel}
      />
    </>
  );
}
