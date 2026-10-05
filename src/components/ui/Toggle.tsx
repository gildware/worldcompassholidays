"use client";

type ToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label: string;
  size?: "sm" | "md";
};

/** Compact switch control — used in permission matrices. */
export function Toggle({
  checked,
  onChange,
  disabled,
  label,
  size = "sm",
}: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={[
        "relative inline-flex shrink-0 items-center rounded-full transition-colors",
        size === "md" ? "h-6 w-11" : "h-4 w-7",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
        disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer",
        checked ? "bg-emerald-500" : "bg-slate-300",
      ].join(" ")}
    >
      <span
        aria-hidden
        className={[
          "pointer-events-none absolute left-0.5 rounded-full bg-white shadow-sm transition-transform",
          size === "md" ? "top-0.5 h-5 w-5" : "top-0.5 h-3 w-3",
          checked ? (size === "md" ? "translate-x-5" : "translate-x-3") : "translate-x-0",
        ].join(" ")}
      />
    </button>
  );
}
