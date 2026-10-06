"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  createDestination,
  updateDestination,
} from "@/actions/destinations";
import { Field } from "@/components/forms/Field";
import { FormMessage } from "@/components/forms/FormMessage";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { Button } from "@/components/ui/Button";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { LocationMapPicker } from "@/components/admin/LocationMapPicker";
import { countries } from "@/lib/data/countries";
import { initialFormState } from "@/lib/forms";
import type { UploadedImage } from "@/lib/storage/types";

export type DestinationFormValues = {
  id: string;
  name: string;
  region: string;
  country: string;
  summary: string;
  mapLat: string;
  mapLng: string;
  mapZoom: number;
  imageUrl: string;
  imageKey: string;
  imageDriver: string;
  published: boolean;
  popular: boolean;
  parentId: string | null;
};

export type DestinationParentOption = {
  id: string;
  label: string;
};

export function DestinationForm({
  destination,
  parentOptions,
  mapApiKey,
  published = true,
  popular = false,
  onCancel,
  onSuccess,
}: {
  destination?: DestinationFormValues;
  parentOptions: DestinationParentOption[];
  mapApiKey: string;
  published?: boolean;
  popular?: boolean;
  onCancel?: () => void;
  onSuccess?: (message: string) => void;
}) {
  const [state, action] = useActionState(
    destination ? updateDestination : createDestination,
    initialFormState,
  );
  const initialImage: UploadedImage | null = destination
    ? {
        url: destination.imageUrl,
        key: destination.imageKey,
        driver:
          destination.imageDriver === "cloudinary" ? "cloudinary" : "local",
      }
    : null;
  const [image, setImage] = useState<UploadedImage | null>(initialImage);
  const [imageBusy, setImageBusy] = useState(false);
  const [name, setName] = useState(destination?.name ?? "");
  const [parentId, setParentId] = useState(destination?.parentId ?? "");
  const [region, setRegion] = useState(destination?.region ?? "");
  const [country, setCountry] = useState(destination?.country ?? "");
  const [summary, setSummary] = useState(destination?.summary ?? "");
  const [mapLat, setMapLat] = useState(destination?.mapLat ?? "");
  const [mapLng, setMapLng] = useState(destination?.mapLng ?? "");
  const [mapZoom, setMapZoom] = useState(destination?.mapZoom ?? 8);
  const changed = destination
    ? name.trim() !== destination.name.trim() ||
      parentId !== (destination.parentId ?? "") ||
      region.trim() !== destination.region.trim() ||
      country !== destination.country ||
      summary.trim() !== destination.summary.trim() ||
      mapLat.trim() !== destination.mapLat.trim() ||
      mapLng.trim() !== destination.mapLng.trim() ||
      mapZoom !== destination.mapZoom ||
      published !== destination.published ||
      popular !== destination.popular ||
      image?.url !== initialImage?.url ||
      image?.key !== initialImage?.key ||
      image?.driver !== initialImage?.driver
    : true;

  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  useEffect(() => {
    if (!state.success) return;
    onSuccessRef.current?.(state.success);
  }, [state.success]);

  return (
    <form
      action={action}
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={(event) => {
        if (imageBusy || !image || !changed) {
          event.preventDefault();
        }
      }}
    >
      <div className="grid min-h-0 flex-1 gap-3 overflow-y-auto px-5 py-5 sm:px-6">
      {destination ? (
        <input type="hidden" name="destinationId" value={destination.id} />
      ) : null}
      {published ? <input type="hidden" name="published" value="on" /> : null}
      {popular ? <input type="hidden" name="popular" value="on" /> : null}
      {state.error ? <FormMessage state={state} /> : null}

      <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="grid gap-3">
          <Field label="Name" help="destination.name">
            <input
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              placeholder="e.g. Kashmir"
              autoComplete="off"
              className="!h-10"
            />
          </Field>

          <Field label="Parent destination">
            <SearchableSelect
              name="parentId"
              value={parentId}
              onChange={setParentId}
              emptyLabel="None - top-level destination"
              searchPlaceholder="Search destinations"
              options={parentOptions.map((option) => ({
                value: option.id,
                label: option.label,
              }))}
              className="!h-10"
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Region">
              <input
                name="region"
                value={region}
                onChange={(event) => setRegion(event.target.value)}
                required
                placeholder="e.g. Jammu and Kashmir"
                className="!h-10"
              />
            </Field>
            <Field label="Country">
              <SearchableSelect
                name="country"
                value={country}
                onChange={setCountry}
                required
                placeholder="Choose a country"
                searchPlaceholder="Search countries"
                options={countries.map((country) => ({
                  value: country,
                  label: country,
                }))}
                className="!h-10"
              />
            </Field>
          </div>
        </div>

        <ImageUploader
          folder="destinations"
          label="Image"
          required
          value={image}
          initialValue={initialImage}
          onChange={setImage}
          onBusyChange={setImageBusy}
          hint="JPG, PNG, WebP, or GIF up to 5 MB. Drag onto the box or click to browse."
        />

        <div className="sm:col-span-2">
          <Field label="Summary" hint="Shown on the website cards. Keep it short.">
            <textarea
              name="summary"
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              required
              rows={3}
              className="!min-h-0 w-full resize-y"
            />
          </Field>
        </div>

        <div className="grid gap-3 sm:col-span-2">
          <p className="text-xs text-muted">
            Search the map for a place, or enter latitude and longitude. Tours
            linked to this destination can use the same pin.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Latitude" help="destination.latitude">
              <input
                name="mapLat"
                value={mapLat}
                onChange={(event) => setMapLat(event.target.value)}
                inputMode="decimal"
                placeholder="e.g. 34.0837"
                autoComplete="off"
                className="!h-10"
              />
            </Field>
            <Field label="Longitude" help="destination.longitude">
              <input
                name="mapLng"
                value={mapLng}
                onChange={(event) => setMapLng(event.target.value)}
                inputMode="decimal"
                placeholder="e.g. 74.7973"
                autoComplete="off"
                className="!h-10"
              />
            </Field>
            <Field label="Map zoom" help="destination.zoom">
              <input
                name="mapZoom"
                type="number"
                min={1}
                max={20}
                value={mapZoom}
                onChange={(event) => setMapZoom(Number(event.target.value))}
                className="!h-10"
              />
            </Field>
          </div>
          {mapApiKey ? (
            <LocationMapPicker
              apiKey={mapApiKey}
              lat={mapLat}
              lng={mapLng}
              zoom={mapZoom}
              onChange={({ lat: nextLat, lng: nextLng, zoom: nextZoom }) => {
                setMapLat(nextLat);
                setMapLng(nextLng);
                setMapZoom(nextZoom);
              }}
            />
          ) : (
            <div className="flex h-52 items-center justify-center rounded-lg border border-dashed border-line bg-surface px-4 text-center text-xs text-muted">
              Set MAP_API_KEY to search and preview this pin on Google Maps.
            </div>
          )}
        </div>
      </div>
      </div>

      <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-line px-5 py-3 sm:flex-row sm:justify-end sm:px-6">
        {onCancel ? (
          <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <SubmitButton
          pendingLabel="Saving"
          className="!h-9"
          disabled={imageBusy || !image || !changed}
        >
          {destination ? "Save changes" : "Add destination"}
        </SubmitButton>
      </div>
    </form>
  );
}
