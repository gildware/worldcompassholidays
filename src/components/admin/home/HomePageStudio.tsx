"use client";

import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import { saveHomePage } from "@/actions/home-page";
import { FormMessage } from "@/components/forms/FormMessage";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { Toggle } from "@/components/ui/Toggle";
import { tourImageFrames } from "@/lib/tours/image-frames";
import { initialFormState } from "@/lib/forms";
import {
  HOME_SECTION_LABELS,
  type HomePageContent,
  type HomeRailConfig,
  type HomeSectionId,
  type HomeWhyItem,
} from "@/lib/home-page";
import type { UploadedImage } from "@/lib/storage/types";
import "./home-studio.css";

export type HomePickItem = {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
};

function GripIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <circle cx="5" cy="4" r="1.2" />
      <circle cx="11" cy="4" r="1.2" />
      <circle cx="5" cy="8" r="1.2" />
      <circle cx="11" cy="8" r="1.2" />
      <circle cx="5" cy="12" r="1.2" />
      <circle cx="11" cy="12" r="1.2" />
    </svg>
  );
}

function moveItem<T>(list: T[], from: number, to: number) {
  if (to < 0 || to >= list.length || from === to) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function sameContent(a: HomePageContent, b: HomePageContent) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function Field({
  label,
  value,
  onChange,
  multiline,
  maxLength,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  maxLength?: number;
  hint?: string;
}) {
  return (
    <label className="hs-field">
      <span>{label}</span>
      {multiline ? (
        <textarea
          value={value}
          maxLength={maxLength}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          value={value}
          maxLength={maxLength}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {hint ? <span className="hs-hint">{hint}</span> : null}
    </label>
  );
}

function isDragIgnore(target: EventTarget | null) {
  return Boolean(
    target instanceof Element && target.closest("button, input, textarea, [role='switch']"),
  );
}

function PickRow({
  item,
  index,
  dragIndex,
  onDragStart,
  onDragOver,
  onDragEnd,
  onRemove,
  locked,
}: {
  item: HomePickItem;
  index: number;
  dragIndex: number | null;
  onDragStart: () => void;
  onDragOver: () => void;
  onDragEnd: () => void;
  onRemove?: () => void;
  locked?: boolean;
}) {
  return (
    <div
      className={`hs-pick${locked ? "" : " is-sortable"}${dragIndex === index ? " is-dragging" : ""}`}
      draggable={!locked}
      onDragStart={(event) => {
        if (locked || isDragIgnore(event.target)) {
          event.preventDefault();
          return;
        }
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", item.id);
        onDragStart();
      }}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        onDragOver();
      }}
      onDragEnd={onDragEnd}
    >
      {locked ? (
        <span className="hs-pick-n">{index + 1}</span>
      ) : (
        <span className="hs-handle" aria-hidden>
          <GripIcon />
        </span>
      )}
      {item.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image} alt="" draggable={false} />
      ) : (
        <span className="hs-pick-ph" />
      )}
      <div>
        <strong>{item.title}</strong>
        {item.subtitle ? <em>{item.subtitle}</em> : null}
      </div>
      {onRemove ? (
        <button type="button" className="hs-icon" aria-label={`Remove ${item.title}`} onClick={onRemove}>
          ×
        </button>
      ) : null}
    </div>
  );
}

function RailEditor({
  rail,
  items,
  liveItems,
  addLabel,
  onChange,
  autoHint,
}: {
  rail: HomeRailConfig;
  items: HomePickItem[];
  liveItems: HomePickItem[];
  addLabel: string;
  autoHint: string;
  onChange: (next: HomeRailConfig) => void;
}) {
  const byId = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);
  const selected = rail.ids.flatMap((id) => {
    const item = byId.get(id);
    return item ? [item] : [];
  });
  const shown = rail.mode === "manual" ? selected : liveItems;
  const available = items.filter((item) => !rail.ids.includes(item.id));
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  return (
    <>
      <Field label="Title" value={rail.title} maxLength={80} onChange={(title) => onChange({ ...rail, title })} />
      <Field
        label="Description"
        value={rail.subtitle}
        multiline
        maxLength={240}
        onChange={(subtitle) => onChange({ ...rail, subtitle })}
      />
      <Field
        label="Link label"
        value={rail.linkLabel}
        maxLength={40}
        onChange={(linkLabel) => onChange({ ...rail, linkLabel })}
      />
      <div className="hs-field">
        <span>What to show</span>
        <div className="hs-mode">
          <button
            type="button"
            className={rail.mode === "auto" ? "is-on" : undefined}
            onClick={() => onChange({ ...rail, mode: "auto" })}
          >
            <strong>Automatic</strong>
            <span>{autoHint}</span>
          </button>
          <button
            type="button"
            className={rail.mode === "manual" ? "is-on" : undefined}
            onClick={() =>
              onChange({
                ...rail,
                mode: "manual",
                ids: rail.ids.length ? rail.ids : liveItems.map((item) => item.id),
              })
            }
          >
            <strong>Choose and arrange</strong>
            <span>Start from the current homepage list, then drag.</span>
          </button>
        </div>
      </div>
      <div className="hs-field">
        <span>
          {rail.mode === "manual" ? "List on the homepage" : "On the homepage now"}
        </span>
        {rail.mode === "manual" ? (
          <SearchableSelect
            key={rail.ids.join("-")}
            options={available.map((item) => ({
              value: item.id,
              label: item.title,
              keywords: item.subtitle,
              iconUrl: item.image,
            }))}
            value=""
            placeholder={addLabel}
            searchPlaceholder="Search to add"
            emptyLabel="Choose one to add"
            onChange={(id) => {
              if (!id) return;
              onChange({ ...rail, ids: [...rail.ids, id] });
            }}
          />
        ) : null}
        <div className="hs-picks">
          {shown.length === 0 ? (
            <p className="hs-hint">Nothing is showing in this block yet.</p>
          ) : (
            shown.map((item, index) => (
              <PickRow
                key={item.id}
                item={item}
                index={index}
                dragIndex={dragIndex}
                locked={rail.mode !== "manual"}
                onDragStart={() => setDragIndex(index)}
                onDragEnd={() => setDragIndex(null)}
                onDragOver={() => {
                  if (dragIndex === null || dragIndex === index) return;
                  onChange({ ...rail, ids: moveItem(rail.ids, dragIndex, index) });
                  setDragIndex(index);
                }}
                onRemove={
                  rail.mode === "manual"
                    ? () => onChange({ ...rail, ids: rail.ids.filter((id) => id !== item.id) })
                    : undefined
                }
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}

function sectionDetail(
  id: HomeSectionId,
  content: HomePageContent,
  live: Record<"destinations" | "tours" | "hotels" | "cars" | "bikes" | "buses", HomePickItem[]>,
) {
  if (id === "hero") return content.hero.title;
  if (id === "destinations") {
    const n = content.destinations.mode === "manual" ? content.destinations.ids.length : live.destinations.length;
    return `${content.destinations.title} · ${n} place${n === 1 ? "" : "s"}`;
  }
  if (id === "tours") {
    const n = content.tours.mode === "manual" ? content.tours.ids.length : live.tours.length;
    return `${content.tours.title} · ${n}`;
  }
  if (id === "hotels") {
    const n = content.hotels.mode === "manual" ? content.hotels.ids.length : live.hotels.length;
    return `${content.hotels.title} · ${n}`;
  }
  if (id === "cars") {
    const n = content.cars.mode === "manual" ? content.cars.ids.length : live.cars.length;
    return `${content.cars.title} · ${n}`;
  }
  if (id === "bikes") {
    const n = content.bikes.mode === "manual" ? content.bikes.ids.length : live.bikes.length;
    return `${content.bikes.title} · ${n}`;
  }
  if (id === "buses") {
    const n = content.buses.mode === "manual" ? content.buses.ids.length : live.buses.length;
    return `${content.buses.title} · ${n}`;
  }
  if (id === "visa") return content.visa.title;
  if (id === "assist") return content.assist.title;
  if (id === "cta") return content.cta.title;
  if (id === "why") {
    const n = content.why.items.length;
    return `${n} point${n === 1 ? "" : "s"} · ${content.why.items[0]?.title ?? ""}`;
  }
  return "On the public homepage";
}

function WhyEditor({
  items,
  onChange,
}: {
  items: HomeWhyItem[];
  onChange: (items: HomeWhyItem[]) => void;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const patchItem = (index: number, next: Partial<HomeWhyItem>) => {
    onChange(items.map((item, i) => (i === index ? { ...item, ...next } : item)));
  };

  return (
    <>
      <p className="hs-hint">
        These lines sit under the listings. Drag a card to change the order. Hide the block
        from the layout if you do not want it on the home page.
      </p>
      <div className="hs-why">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`hs-why-card is-sortable${dragIndex === index ? " is-dragging" : ""}`}
            draggable
            onDragStart={(event) => {
              if (isDragIgnore(event.target)) {
                event.preventDefault();
                return;
              }
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData("text/plain", item.id);
              setDragIndex(index);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
              if (dragIndex === null || dragIndex === index) return;
              onChange(moveItem(items, dragIndex, index));
              setDragIndex(index);
            }}
            onDragEnd={() => setDragIndex(null)}
          >
            <span className="hs-handle" aria-hidden>
              <GripIcon />
            </span>
            <div className="hs-why-fields">
              <Field
                label={`Point ${index + 1} title`}
                value={item.title}
                maxLength={80}
                onChange={(title) => patchItem(index, { title })}
              />
              <Field
                label="Text"
                value={item.text}
                multiline
                maxLength={240}
                onChange={(text) => patchItem(index, { text })}
              />
            </div>
            <button
              type="button"
              className="hs-icon"
              aria-label={`Remove ${item.title || `point ${index + 1}`}`}
              disabled={items.length <= 1}
              onClick={() => onChange(items.filter((row) => row.id !== item.id))}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      {items.length < 4 ? (
        <button
          type="button"
          className="hs-add"
          onClick={() =>
            onChange([
              ...items,
              {
                id: `why-${Date.now()}`,
                title: "",
                text: "",
              },
            ])
          }
        >
          Add a point
        </button>
      ) : null}
    </>
  );
}

export function HomePageStudio({
  initial,
  coverUrl,
  live,
  destinations,
  tours,
  hotels,
  cars,
  bikes,
  buses,
}: {
  initial: HomePageContent;
  coverUrl: string;
  live: {
    destinations: HomePickItem[];
    tours: HomePickItem[];
    hotels: HomePickItem[];
    cars: HomePickItem[];
    bikes: HomePickItem[];
    buses: HomePickItem[];
  };
  destinations: HomePickItem[];
  tours: HomePickItem[];
  hotels: HomePickItem[];
  cars: HomePickItem[];
  bikes: HomePickItem[];
  buses: HomePickItem[];
}) {
  const [state, action, actionPending] = useActionState(saveHomePage, initialFormState);
  const [saving, startSave] = useTransition();
  const pending = actionPending || saving;
  const [saved, setSaved] = useState(initial);
  const [content, setContent] = useState(initial);
  const [selected, setSelected] = useState<HomeSectionId>("hero");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const dirty = !sameContent(content, saved);

  useEffect(() => {
    if (state.success) setSaved(content);
    // Content at the moment the server confirms save is the new baseline.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  function save() {
    const data = new FormData();
    data.set("contentJson", JSON.stringify(content));
    startSave(() => {
      action(data);
    });
  }

  useEffect(() => {
    const onLeave = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [dirty]);

  function patch<K extends keyof HomePageContent>(key: K, value: HomePageContent[K]) {
    setContent((current) => ({ ...current, [key]: value }));
  }

  const selectedSection = content.sections.find((section) => section.id === selected);

  return (
    <form
      className="home-studio"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <div className="home-studio__intro">
        <div>
          <p>
            Drag sections to set the order visitors see. Open a section to change the copy, the
            hero photo, and which destinations or listings appear.
          </p>
        </div>
        {dirty ? <span className="home-studio__dirty">Unsaved changes</span> : null}
      </div>

      <div className="home-studio__grid">
        <section className="home-studio__col" aria-label="Homepage sections">
          <div className="home-studio__col-head">
            <h2>Layout</h2>
            <p>Drag the handle. Hide a block without deleting its copy.</p>
          </div>
          <div className="home-studio__list">
            {content.sections.map((section, index) => {
              const active = section.id === selected;
              return (
                <div
                  key={section.id}
                  className={[
                    "hs-row",
                    "is-sortable",
                    active ? "is-active" : "",
                    section.enabled ? "" : "is-off",
                    dragIndex === index ? "is-dragging" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  draggable
                  onDragStart={(event) => {
                    if (isDragIgnore(event.target)) {
                      event.preventDefault();
                      return;
                    }
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", section.id);
                    setSelected(section.id);
                    setDragIndex(index);
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "move";
                    if (dragIndex === null || dragIndex === index) return;
                    patch("sections", moveItem(content.sections, dragIndex, index));
                    setDragIndex(index);
                  }}
                  onDragEnd={() => setDragIndex(null)}
                  onClick={() => setSelected(section.id)}
                >
                  <span className="hs-handle" aria-hidden>
                    <GripIcon />
                  </span>
                  <div className="hs-row-main">
                    <strong>{HOME_SECTION_LABELS[section.id]}</strong>
                    <span>
                      {sectionDetail(section.id, content, live)}
                      {section.enabled ? "" : " · Hidden"}
                    </span>
                  </div>
                  <div className="hs-row-tools" onClick={(event) => event.stopPropagation()}>
                    <button
                      type="button"
                      className="hs-icon"
                      aria-label="Move up"
                      disabled={index === 0}
                      onClick={() => patch("sections", moveItem(content.sections, index, index - 1))}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="hs-icon"
                      aria-label="Move down"
                      disabled={index === content.sections.length - 1}
                      onClick={() => patch("sections", moveItem(content.sections, index, index + 1))}
                    >
                      ↓
                    </button>
                    <Toggle
                      checked={section.enabled}
                      label={`Show ${HOME_SECTION_LABELS[section.id]}`}
                      onChange={(enabled) =>
                        patch(
                          "sections",
                          content.sections.map((item) =>
                            item.id === section.id ? { ...item, enabled } : item,
                          ),
                        )
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="home-studio__col" aria-label="Section editor">
          <div className="home-studio__col-head">
            <h2>{HOME_SECTION_LABELS[selected]}</h2>
            <p>
              {selectedSection?.enabled
                ? "This block is live on the public homepage."
                : "Hidden on the public homepage until you turn it on."}
            </p>
          </div>
          <div className="home-studio__editor">
            <div className="hs-editor">
              {selected === "hero" ? (
                <>
                  <ImageUploader
                    folder="home"
                    scope="hero"
                    label="Hero image"
                    withHiddenFields={false}
                    frame={tourImageFrames.banner}
                    value={
                      content.hero.image ??
                      (coverUrl
                        ? { url: coverUrl, key: "", driver: "local" }
                        : null)
                    }
                    onChange={(image: UploadedImage | null) =>
                      patch("hero", {
                        ...content.hero,
                        image: image?.key ? image : null,
                      })
                    }
                    hint="The photo on the homepage banner. Click or drop a file to replace it."
                  />
                  <Field
                    label="Title"
                    value={content.hero.title}
                    maxLength={90}
                    onChange={(title) => patch("hero", { ...content.hero, title })}
                  />
                  <Field
                    label="Description"
                    value={content.hero.description}
                    multiline
                    maxLength={240}
                    onChange={(description) => patch("hero", { ...content.hero, description })}
                  />
                </>
              ) : null}

              {selected === "destinations" ? (
                <RailEditor
                  rail={content.destinations}
                  items={destinations}
                  liveItems={live.destinations}
                  addLabel="Add a destination"
                  autoHint="Uses destinations marked popular, in name order."
                  onChange={(destinationsConfig) => patch("destinations", destinationsConfig)}
                />
              ) : null}

              {selected === "tours" ? (
                <RailEditor
                  rail={content.tours}
                  items={tours}
                  liveItems={live.tours}
                  addLabel="Add a tour"
                  autoHint="Uses published tours, featured first."
                  onChange={(toursConfig) => patch("tours", toursConfig)}
                />
              ) : null}

              {selected === "hotels" ? (
                <RailEditor
                  rail={content.hotels}
                  items={hotels}
                  liveItems={live.hotels}
                  addLabel="Add a hotel"
                  autoHint="Uses published hotels, featured first."
                  onChange={(hotelsConfig) => patch("hotels", hotelsConfig)}
                />
              ) : null}

              {selected === "cars" ? (
                <RailEditor
                  rail={content.cars}
                  items={cars}
                  liveItems={live.cars}
                  addLabel="Add a car"
                  autoHint="Uses the latest published cars."
                  onChange={(carsConfig) => patch("cars", carsConfig)}
                />
              ) : null}

              {selected === "bikes" ? (
                <RailEditor
                  rail={content.bikes}
                  items={bikes}
                  liveItems={live.bikes}
                  addLabel="Add a bike"
                  autoHint="Uses the latest published bikes."
                  onChange={(bikesConfig) => patch("bikes", bikesConfig)}
                />
              ) : null}

              {selected === "buses" ? (
                <RailEditor
                  rail={content.buses}
                  items={buses}
                  liveItems={live.buses}
                  addLabel="Add a bus"
                  autoHint="Uses the latest published buses."
                  onChange={(busesConfig) => patch("buses", busesConfig)}
                />
              ) : null}

              {selected === "why" ? (
                <WhyEditor
                  items={content.why.items}
                  onChange={(items) => patch("why", { items })}
                />
              ) : null}

              {selected === "visa" ? (
                <>
                  <Field label="Title" value={content.visa.title} maxLength={80} onChange={(title) => patch("visa", { ...content.visa, title })} />
                  <Field label="Description" value={content.visa.subtitle} multiline maxLength={320} onChange={(subtitle) => patch("visa", { ...content.visa, subtitle })} />
                  <Field label="Supporting line" value={content.visa.meta} maxLength={160} onChange={(meta) => patch("visa", { ...content.visa, meta })} />
                  <Field label="Details link" value={content.visa.moreLabel} maxLength={40} onChange={(moreLabel) => patch("visa", { ...content.visa, moreLabel })} />
                  <Field label="Button" value={content.visa.ctaLabel} maxLength={40} onChange={(ctaLabel) => patch("visa", { ...content.visa, ctaLabel })} />
                </>
              ) : null}

              {selected === "assist" ? (
                <>
                  <Field label="Title" value={content.assist.title} maxLength={80} onChange={(title) => patch("assist", { ...content.assist, title })} />
                  <Field label="Description" value={content.assist.subtitle} multiline maxLength={320} onChange={(subtitle) => patch("assist", { ...content.assist, subtitle })} />
                  <Field label="Details link" value={content.assist.moreLabel} maxLength={40} onChange={(moreLabel) => patch("assist", { ...content.assist, moreLabel })} />
                  <Field label="Button" value={content.assist.ctaLabel} maxLength={40} onChange={(ctaLabel) => patch("assist", { ...content.assist, ctaLabel })} />
                </>
              ) : null}

              {selected === "cta" ? (
                <>
                  <Field label="Title" value={content.cta.title} maxLength={90} onChange={(title) => patch("cta", { ...content.cta, title })} />
                  <Field label="Description" value={content.cta.subtitle} multiline maxLength={240} onChange={(subtitle) => patch("cta", { ...content.cta, subtitle })} />
                  <Field label="Button" value={content.cta.buttonLabel} maxLength={40} onChange={(buttonLabel) => patch("cta", { ...content.cta, buttonLabel })} />
                </>
              ) : null}
            </div>
          </div>
        </section>
      </div>

      <div className="home-studio__bar">
        <div className="home-studio__bar-status">
          <FormMessage state={state} />
        </div>
        <Button
          type="button"
          variant="secondary"
          disabled={!dirty || pending}
          onClick={() => setContent(saved)}
        >
          Discard
        </Button>
        <div className="home-studio__bar-actions">
          <ButtonLink href="/" variant="secondary">
            View website
          </ButtonLink>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save homepage"}
          </Button>
        </div>
      </div>
    </form>
  );
}
