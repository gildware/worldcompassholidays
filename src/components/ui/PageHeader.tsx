import { ButtonLink } from "@/components/ui/Button";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string } | React.ReactNode;
}) {
  const actionNode =
    action && typeof action === "object" && "href" in action ? (
      <ButtonLink href={action.href} className="w-full shrink-0 sm:w-auto">
        {action.label}
      </ButtonLink>
    ) : (
      action
    );

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-navy sm:text-[1.75rem]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p>
        ) : null}
      </div>
      {actionNode}
    </div>
  );
}
