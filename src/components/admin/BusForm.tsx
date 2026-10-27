"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { saveBus } from "@/actions/buses";
import { Field } from "@/components/forms/Field";
import { FormMessage } from "@/components/forms/FormMessage";
import { Button } from "@/components/ui/Button";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { MultiSearchableSelect } from "@/components/ui/SearchableSelect";
import { busCoachTypes, type BusGalleryItem } from "@/lib/buses";
import { initialFormState } from "@/lib/forms";
import type { UploadedImage } from "@/lib/storage/types";

export type BusFacilityOption = { id: string; title: string; iconUrl: string };

export type BusDraft = {
  id: string;
  name: string;
  coachType: string;
  operator: string;
  summary: string;
  about: string;
  facilityIds: string[];
  published: boolean;
  imageUrl: string;
  imageKey: string;
  imageDriver: "local" | "cloudinary";
  gallery: BusGalleryItem[];
};

export function BusForm({
  bus,
  facilities,
}: {
  bus: BusDraft | null;
  facilities: BusFacilityOption[];
}) {
  const [state, action, pending] = useActionState(saveBus, initialFormState);
  const [imageBusy, setImageBusy] = useState(false);
  const [facilityIds, setFacilityIds] = useState(bus?.facilityIds ?? []);
  const [gallery, setGallery] = useState<BusGalleryItem[]>(bus?.gallery ?? []);
  const [adder, setAdder] = useState(0);

  const initialCover: UploadedImage | null = bus?.imageUrl
    ? {
        url: bus.imageUrl,
        key: bus.imageKey || "legacy",
        driver: bus.imageDriver,
      }
    : null;

  return (
    <form action={action} className="grid min-h-0 flex-1 gap-4 overflow-y-auto pb-4">
      <input type="hidden" name="id" value={bus?.id ?? ""} />
      <input type="hidden" name="facilityIds" value={JSON.stringify(facilityIds)} />
      <input type="hidden" name="galleryJson" value={JSON.stringify(gallery)} />

      {state.error ? <FormMessage state={state} /> : null}

      <section className="grid gap-4 rounded-xl border border-line bg-white p-4">
        <div>
          <h2 className="text-sm font-semibold text-navy">Coach and facilities</h2>
          <p className="mt-0.5 text-xs text-muted">
            This is the bus itself. Routes pick it later. Facilities are added under Facilities, then selected here.
          </p>
        </div>
        <Field label="Coach name" required>
          <input name="name" defaultValue={bus?.name ?? ""} placeholder="Valley Volvo" className="!h-10" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Coach">
            <select name="coachType" defaultValue={bus?.coachType || "seater"} className="!h-10">
              {busCoachTypes
                .filter((option) => option.value !== "any")
                .map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Operator">
            <input
              name="operator"
              defaultValue={bus?.operator ?? ""}
              placeholder="World Compass"
              maxLength={80}
              className="!h-10"
            />
          </Field>
        </div>
        <Field label="Facilities">
          <MultiSearchableSelect
            ariaLabel="Facilities"
            values={facilityIds}
            onChange={setFacilityIds}
            options={facilities.map((item) => ({ value: item.id, label: item.title }))}
            placeholder={facilities.length ? "Choose facilities" : "Add facilities first"}
            searchPlaceholder="Search facilities"
            disabled={facilities.length === 0}
          />
        </Field>
        {facilities.length === 0 ? (
          <p className="text-xs text-muted">
            <Link href="/admin/buses/configuration" className="font-medium text-brand hover:underline">
              Add facilities
            </Link>{" "}
            once, then pick them on each bus.
          </p>
        ) : null}
        <Field label="Summary">
          <input
            name="summary"
            defaultValue={bus?.summary ?? ""}
            placeholder="Overnight Volvo with berths and a blanket."
            maxLength={400}
            className="!h-10"
          />
        </Field>
        <Field label="About this coach">
          <textarea
            name="about"
            defaultValue={bus?.about ?? ""}
            rows={5}
            maxLength={8000}
            placeholder="What the ride is like and what is included."
            className="!min-h-0 resize-y"
          />
        </Field>
      </section>

      <section className="grid gap-4 rounded-xl border border-line bg-white p-4">
        <div>
          <h2 className="text-sm font-semibold text-navy">Photos</h2>
          <p className="mt-0.5 text-xs text-muted">
            The cover is the picture on every route this bus runs. Publishing needs a cover and at least one facility.
          </p>
        </div>
        <ImageUploader
          folder="buses"
          scope={bus?.id}
          label="Cover photo"
          hint="Shown on the bus list. JPG, PNG, WebP, or GIF up to 5 MB."
          initialValue={initialCover}
          onBusyChange={setImageBusy}
        />
        {gallery.length ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {gallery.map((item) => (
              <li key={item.url} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt="" className="h-24 w-full rounded-lg border border-line object-cover" />
                <button
                  type="button"
                  className="absolute top-1 right-1 rounded-full bg-white px-2 py-0.5 text-xs text-navy shadow"
                  onClick={() => setGallery((current) => current.filter((photo) => photo.url !== item.url))}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        {gallery.length < 8 ? (
          <ImageUploader
            key={adder}
            folder="buses"
            scope={bus?.id}
            label="Extra photo"
            withHiddenFields={false}
            hint="Up to 8 more photos for the coach page."
            onChange={(image) => {
              if (!image) return;
              setGallery((current) =>
                current.some((item) => item.url === image.url) ? current : [...current, image],
              );
              setAdder((count) => count + 1);
            }}
            onBusyChange={setImageBusy}
          />
        ) : null}
      </section>

      <div className="flex flex-wrap justify-end gap-2">
        <Button type="submit" name="intent" value="draft" variant="secondary" disabled={pending || imageBusy}>
          {pending ? "Saving…" : "Save draft"}
        </Button>
        <Button type="submit" name="intent" value="publish" disabled={pending || imageBusy}>
          {pending ? "Saving…" : bus?.published ? "Update" : "Publish"}
        </Button>
      </div>
    </form>
  );
}
