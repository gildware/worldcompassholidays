"use client";

import { useActionState, useEffect, useState } from "react";
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
import { countries } from "@/lib/data/countries";
import { initialFormState } from "@/lib/forms";
import type { UploadedImage } from "@/lib/storage/types";

export type DestinationFormValues = {
  id: string;
  name: string;
  region: string;
  country: string;
  summary: string;
  imageUrl: string;
  imageKey: string;
  imageDriver: string;
  published: boolean;
  parentId: string | null;
};

export type DestinationParentOption = {
  id: string;
  label: string;
};

export function DestinationForm({
  destination,
  parentOptions,
  published = true,
  onCancel,
  onSuccess,
}: {
  destination?: DestinationFormValues;
  parentOptions: DestinationParentOption[];
  published?: boolean;
  onCancel?: () => void;
  onSuccess?: () => void;
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

  useEffect(() => {
    if (state.success) onSuccess?.();
  }, [state.success, onSuccess]);

  return (
    <form
      action={action}
      className="grid gap-3"
      onSubmit={(event) => {
        if (imageBusy || !image) {
          event.preventDefault();
        }
      }}
    >
      {destination ? (
        <input type="hidden" name="destinationId" value={destination.id} />
      ) : null}
      {published ? <input type="hidden" name="published" value="on" /> : null}
      <FormMessage state={state} />

      <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="grid gap-3">
          <Field label="Name" help="destination.name">
            <input
              name="name"
              defaultValue={destination?.name}
              required
              placeholder="e.g. Kashmir"
              autoComplete="off"
              className="!h-10"
            />
          </Field>

          <Field label="Parent destination">
            <SearchableSelect
              name="parentId"
              defaultValue={destination?.parentId ?? ""}
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
                defaultValue={destination?.region}
                required
                placeholder="e.g. Jammu and Kashmir"
                className="!h-10"
              />
            </Field>
            <Field label="Country">
              <SearchableSelect
                name="country"
                defaultValue={destination?.country ?? ""}
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

        <div className="sm:sticky sm:top-0">
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
        </div>

        <div className="sm:col-span-2">
          <Field label="Summary" hint="Shown on the website cards. Keep it short.">
            <textarea
              name="summary"
              defaultValue={destination?.summary}
              required
              rows={3}
              className="!min-h-0 w-full resize-y"
            />
          </Field>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-line pt-3 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <SubmitButton
          pendingLabel="Saving"
          className="!h-9"
          disabled={imageBusy || !image}
        >
          {destination ? "Save changes" : "Add destination"}
        </SubmitButton>
      </div>
    </form>
  );
}
