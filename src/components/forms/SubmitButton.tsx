"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  pendingLabel,
  variant = "primary",
  className = "",
  disabled = false,
}: {
  children: React.ReactNode;
  pendingLabel: string;
  variant?: "primary" | "secondary" | "danger";
  className?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  const styles = {
    primary: "bg-brand text-white hover:bg-[#2c46b5]",
    secondary: "border border-line bg-white text-navy hover:bg-surface",
    danger: "border border-red-200 bg-white text-red-700 hover:bg-red-50",
  }[variant];

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={[
        "inline-flex h-11 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
        "disabled:cursor-not-allowed disabled:opacity-60",
        styles,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {pending ? `${pendingLabel}…` : children}
    </button>
  );
}
