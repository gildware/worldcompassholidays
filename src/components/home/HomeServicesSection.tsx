import { GlowLink } from "@/components/home/HomeInteractive";
import type { HomeServiceGroup, HomeServiceItem, HomeServicesContent } from "@/lib/home-page";
import "@/styles/home-services.css";

const groupStyles = ["tiles", "stays", "tours", "rides"] as const;

export type HomeServicePart = "overview" | "stays" | "tours" | "rides";

function groupStyle(id: string, index: number) {
  if (id === "all") return "tiles";
  if (id === "stays") return "stays";
  if (id === "tour-types" || id === "tours") return "tours";
  if (id === "vehicles") return "rides";
  return groupStyles[index % groupStyles.length];
}

function partOf(id: string, index: number): HomeServicePart {
  const style = groupStyle(id, index);
  if (style === "stays") return "stays";
  if (style === "tours") return "tours";
  if (style === "rides") return "rides";
  return "overview";
}

function visibleGroups(services: HomeServicesContent, part: HomeServicePart) {
  return services.groups
    .map((group, index) => ({
      ...group,
      style: groupStyle(group.id, index),
      part: partOf(group.id, index),
      items: group.items.filter((item) => item.title.trim()),
    }))
    .filter((group) => group.part === part && group.items.length > 0);
}

export function hasServicePart(services: HomeServicesContent, part: HomeServicePart) {
  return visibleGroups(services, part).length > 0;
}

function cardSrc(item: HomeServiceItem) {
  return item.image?.url || item.imageUrl;
}

function ServiceCard({ item, spot }: { item: HomeServiceItem; spot?: boolean }) {
  const src = cardSrc(item);
  if (spot) {
    return (
      <GlowLink href={item.href || "/"} className="hic-spot">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" />
        ) : (
          <span className="hic-spot__fallback" />
        )}
        <span className="hic-spot__shade" />
        {item.description ? <span className="hic-spot__more">{item.description}</span> : null}
        <span className="hic-spot__label">
          <small>Service</small>
          <strong>{item.title}</strong>
        </span>
      </GlowLink>
    );
  }

  return (
    <GlowLink href={item.href || "/"} className="home-services__card">
      <div className="home-services__media">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" />
        ) : (
          <div className="home-services__ph" aria-hidden />
        )}
      </div>
      <div className="home-services__body">
        <strong>{item.title}</strong>
        {item.description ? <p>{item.description}</p> : null}
        <span className="home-services__go">View</span>
      </div>
    </GlowLink>
  );
}

function GroupBlock({
  group,
  embedded,
  part,
}: {
  group: HomeServiceGroup & { style: string };
  embedded: boolean;
  part: HomeServicePart;
}) {
  const showTitle = part !== "overview";
  return (
    <div className={`home-services__group home-services__group--${group.style}`}>
      {showTitle ? <h3>{group.title}</h3> : null}
      {group.subtitle && showTitle ? <p className="home-services__group-lead">{group.subtitle}</p> : null}
      <div className="home-services__grid">
        {group.items.map((item) => (
          <ServiceCard key={item.id} item={item} spot={group.style === "tiles"} />
        ))}
      </div>
    </div>
  );
}

export function HomeServicesSection({
  headingId = "home-services",
  services,
  part = "overview",
  embedded = false,
}: {
  headingId?: string;
  services: HomeServicesContent;
  part?: HomeServicePart;
  /** Sits inside another homepage block, without the page heading. */
  embedded?: boolean;
}) {
  const groups = visibleGroups(services, part);
  if (!groups.length) return null;

  const classes = [
    "home-services",
    embedded ? "home-services--embed" : "",
    embedded ? `home-services--${part}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const groupsView = groups.map((group) => (
    <GroupBlock key={group.id} group={group} embedded={embedded} part={part} />
  ));

  if (embedded) {
    const inner = part === "tours" ? groupsView : <div className="container home-services__frame">{groupsView}</div>;
    return <div className={classes}>{inner}</div>;
  }

  return (
    <section className={classes} aria-labelledby={headingId}>
      <div className="container home-services__inner">
        {services.badge ? <p className="home-services__badge">{services.badge}</p> : null}
        <h2 id={headingId}>{services.title}</h2>
        {services.subtitle ? <p className="home-services__lead">{services.subtitle}</p> : null}
        {groupsView}
      </div>
    </section>
  );
}
