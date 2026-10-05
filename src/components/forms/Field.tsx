import { FieldHelp } from "@/components/forms/FieldHelp";

export function Field({
  label,
  hint,
  help,
  children,
}: {
  label: string;
  hint?: string;
  /** Catalog key when this label is used for more than one kind of field. */
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      <span className="inline-flex items-center gap-1.5">
        <span>{label}</span>
        <FieldHelp label={label} help={help} />
      </span>
      {children}
      {hint ? <span className="text-xs font-normal text-muted">{hint}</span> : null}
    </label>
  );
}
