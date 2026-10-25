"use client";

import { useActionState, useState } from "react";
import { saveBrand } from "@/actions/brand";
import { FormMessage } from "@/components/forms/FormMessage";
import { Button } from "@/components/ui/Button";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { initialFormState } from "@/lib/forms";
import type { UploadedImage } from "@/lib/storage/types";

export function BrandScreen({
  logo,
  covers,
}: {
  logo: UploadedImage | null;
  covers: UploadedImage[];
}) {
  const [state, action, pending] = useActionState(saveBrand, initialFormState);
  const [logoValue, setLogoValue] = useState<UploadedImage | null>(logo);
  const [coverValues, setCoverValues] = useState<UploadedImage[]>(covers);

  return (
    <form action={action} className="mx-auto flex max-w-3xl flex-col gap-8">
      <FormMessage state={state} />
      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="text-base font-semibold text-navy">Logo</h2>
        <p className="mt-1 text-sm text-muted">
          Shown in the header, footer, and admin. Replacing it removes the previous file from Cloudinary.
        </p>
        <div className="mt-4 max-w-sm">
          <ImageUploader
            folder="brand"
            scope="logo"
            label="Logo"
            value={logoValue}
            onChange={setLogoValue}
            hint="PNG, JPG, or WebP. A wide lockup works best."
          />
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="text-base font-semibold text-navy">Cover photos</h2>
        <p className="mt-1 text-sm text-muted">
          The first photo is the homepage banner. Removing or replacing a photo deletes it from Cloudinary.
        </p>
        <input type="hidden" name="coversJson" value={JSON.stringify(coverValues)} />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {coverValues.map((cover, index) => (
            <div key={cover.key} className="flex flex-col gap-2">
              <ImageUploader
                folder="brand"
                scope="covers"
                label={index === 0 ? "Homepage cover" : `Cover ${index + 1}`}
                withHiddenFields={false}
                value={cover}
                onChange={(next) => {
                  setCoverValues((current) => {
                    if (!next) return current.filter((item) => item.key !== cover.key);
                    return current.map((item) => (item.key === cover.key ? next : item));
                  });
                }}
              />
              <Button
                type="button"
                variant="dangerOutline"
                size="sm"
                onClick={() =>
                  setCoverValues((current) => current.filter((item) => item.key !== cover.key))
                }
              >
                Remove
              </Button>
            </div>
          ))}
          {coverValues.length < 8 ? (
            <ImageUploader
              folder="brand"
              scope="covers"
              label="Add a cover photo"
              withHiddenFields={false}
              value={null}
              onChange={(next) => {
                if (!next) return;
                setCoverValues((current) =>
                  current.some((item) => item.key === next.key) ? current : [...current, next],
                );
              }}
            />
          ) : null}
        </div>
      </section>

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save brand images"}
        </Button>
      </div>
    </form>
  );
}
