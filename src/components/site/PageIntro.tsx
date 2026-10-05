import Link from "next/link";

export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow ? (
        <p className="text-sm font-medium tracking-wide text-brand uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
        {title}
      </h1>
      <p className="mt-3 text-base leading-7 text-muted">{description}</p>
    </div>
  );
}

export function EmptyState({
  title,
  body,
  href,
  action,
}: {
  title: string;
  body: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-white px-5 py-8">
      <p className="font-medium">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
      {href && action ? (
        <Link href={href} className="mt-4 inline-flex text-sm font-medium text-brand">
          {action}
        </Link>
      ) : null}
    </div>
  );
}
