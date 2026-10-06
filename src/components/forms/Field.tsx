import { FieldHelp } from "@/components/forms/FieldHelp";

export function Field({
  label,
  hint,
  help,
  required = false,
  error,
  name,
  className,
  children,
}: {
  label: string;
  hint?: string;
  /** Catalog key when this label is used for more than one kind of field. */
  help?: string;
  required?: boolean;
  error?: string | null;
  /** Stable key for scroll-to-error targeting (`data-field`). */
  name?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={["grid gap-2 text-sm font-medium", className].filter(Boolean).join(" ")} data-field={name}>
      <div className="inline-flex items-center gap-1.5">
        <span>
          {label}
          {required ? (
            <span className="ml-0.5 text-red-600" aria-hidden="true">
              *
            </span>
          ) : null}
        </span>
        <FieldHelp label={label} help={help} />
      </div>
      <div
        className={
          error
            ? [
                "[&_button]:!border-red-500 [&_button:focus]:!outline-none [&_button:focus]:!shadow-[0_0_0_2px_#ef4444] [&_button:focus-visible]:!outline-none [&_button:focus-visible]:!shadow-[0_0_0_2px_#ef4444]",
                "[&_input:not([type=checkbox]):not([type=radio]):not([type=hidden]):not([type=file])]:!border-red-500",
                "[&_input:not([type=checkbox]):not([type=radio]):not([type=hidden]):not([type=file]):focus]:!outline-none",
                "[&_input:not([type=checkbox]):not([type=radio]):not([type=hidden]):not([type=file]):focus]:!shadow-[0_0_0_2px_#ef4444]",
                "[&_input:not([type=checkbox]):not([type=radio]):not([type=hidden]):not([type=file]):focus-visible]:!outline-none",
                "[&_input:not([type=checkbox]):not([type=radio]):not([type=hidden]):not([type=file]):focus-visible]:!shadow-[0_0_0_2px_#ef4444]",
                "[&_textarea]:!border-red-500 [&_textarea:focus]:!outline-none [&_textarea:focus]:!shadow-[0_0_0_2px_#ef4444]",
                "[&_textarea:focus-visible]:!outline-none [&_textarea:focus-visible]:!shadow-[0_0_0_2px_#ef4444]",
              ].join(" ")
            : undefined
        }
      >
        {children}
      </div>
      {error ? (
        <p role="alert" className="text-xs font-normal text-red-700">
          {error}
        </p>
      ) : hint ? (
        <span className="text-xs font-normal text-muted">{hint}</span>
      ) : null}
    </div>
  );
}
