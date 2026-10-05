import Link from "next/link";

const variants = {
  primary:
    "bg-brand text-white hover:bg-[#2c46b5] disabled:bg-brand/60",
  secondary:
    "border border-line bg-white text-navy hover:bg-surface disabled:text-muted",
  ghost: "text-brand hover:bg-brand-soft disabled:text-muted",
  danger:
    "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-600/60",
  dangerOutline:
    "border border-red-200 bg-white text-red-700 hover:bg-red-50 disabled:text-red-300",
} as const;

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-sm",
} as const;

type Variant = keyof typeof variants;
type Size = keyof typeof sizes;

type Common = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

function classes(variant: Variant, size: Size, className?: string) {
  return [
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
    "disabled:cursor-not-allowed",
    variants[variant],
    sizes[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  type = "button",
  ...props
}: Common &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    type?: "button" | "submit" | "reset";
  }) {
  return (
    <button type={type} className={classes(variant, size, className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: Common & { href: string }) {
  return (
    <Link href={href} className={classes(variant, size, className)}>
      {children}
    </Link>
  );
}
