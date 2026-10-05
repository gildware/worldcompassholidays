"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteCatalogItem, saveCatalogItem } from "@/actions/catalog";
import { Field } from "@/components/forms/Field";
import { FormMessage } from "@/components/forms/FormMessage";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { Modal } from "@/components/ui/Modal";
import {
  catalogGroups,
  catalogKindHasAnswer,
  catalogKindHasIcon,
  catalogKindLabel,
  type CatalogKind,
} from "@/lib/catalog";
import { initialFormState } from "@/lib/forms";
import type { UploadedImage } from "@/lib/storage/types";

export type CatalogRow = {
  id: string;
  kind: CatalogKind;
  title: string;
  content: string;
  iconUrl: string;
  iconKey: string;
  iconDriver: "local" | "cloudinary";
};

const KIND_HINTS: Record<CatalogKind, { label: string; hint: string }> = {
  category: {
    label: "Tour categories",
    hint: "Categories a tour can use. Each one has an icon and a title.",
  },
  style: {
    label: "Travel styles",
    hint: "Styles a tour can use. Each one has an icon and a title.",
  },
  facility: {
    label: "Facilities",
    hint: "Facilities a tour can use. Each one has an icon and a title.",
  },
  faq: {
    label: "FAQs",
    hint: "Questions and answers a tour can reuse.",
  },
  include: {
    label: "Includes",
    hint: "Items a tour can list as included. Each one has an icon and a title.",
  },
  exclude: {
    label: "Excludes",
    hint: "Items a tour can list as excluded. Each one has an icon and a title.",
  },
};

export function CatalogWorkspace({ items }: { items: CatalogRow[] }) {
  const router = useRouter();
  const [groupId, setGroupId] = useState<(typeof catalogGroups)[number]["id"]>("tours");
  const [kind, setKind] = useState<CatalogKind>("category");
  const [editing, setEditing] = useState<CatalogRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [removing, setRemoving] = useState<CatalogRow | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const group = catalogGroups.find((item) => item.id === groupId) ?? catalogGroups[0];
  const kinds = [...group.kinds] as CatalogKind[];
  const activeKind = kinds.includes(kind) ? kind : kinds[0];
  const tab = activeKind ? KIND_HINTS[activeKind] : null;
  const rows = activeKind ? items.filter((item) => item.kind === activeKind) : [];

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-navy">
          Configuration
        </h1>
        <p className="mt-1 text-sm text-muted">
          Shared lists for tours. Hotel settings will be added separately.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {catalogGroups.map((item) => {
          const selected = item.id === group.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setGroupId(item.id);
                setNotice(null);
                const next = item.kinds[0];
                if (next) setKind(next);
              }}
              className={`inline-flex h-9 items-center rounded-lg border px-3 text-sm font-medium ${
                selected
                  ? "border-navy bg-navy text-white"
                  : "border-line bg-white text-navy hover:bg-surface"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <p className="text-sm text-muted">{group.description}</p>

      {kinds.length > 0 ? (
      <div className="flex flex-wrap gap-2">
        {kinds.map((item) => {
          const selected = item === activeKind;
          const count = items.filter((row) => row.kind === item).length;
          return (
            <button
              key={item}
              type="button"
              onClick={() => {
                setKind(item);
                setNotice(null);
              }}
              className={`inline-flex h-9 items-center gap-2 rounded-full border px-3 text-sm ${
                selected
                  ? "border-brand bg-brand-soft text-brand"
                  : "border-line bg-white text-navy hover:bg-surface"
              }`}
            >
              {KIND_HINTS[item].label}
              <span
                className={`rounded-full px-1.5 text-xs ${
                  selected ? "bg-white text-brand" : "bg-surface text-muted"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
      ) : (
        <section className="rounded-lg border border-dashed border-line bg-white px-4 py-8 text-sm text-muted">
          No hotel settings yet.
        </section>
      )}

      {activeKind && tab ? (
      <section className="rounded-lg border border-line bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <p className="text-sm text-muted">{tab.hint}</p>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setNotice(null);
              setEditing(null);
              setCreating(true);
            }}
          >
            Add {catalogKindLabel(activeKind).toLowerCase()}
          </Button>
        </div>

        {notice ? (
          <p role="alert" className="mx-4 mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {notice}
          </p>
        ) : null}

        {rows.length === 0 ? (
          <p className="px-4 py-8 text-sm text-muted">Nothing here yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 px-4 py-3"
              >
                {catalogKindHasIcon(item.kind) ? (
                  <ItemIcon url={item.iconUrl} title={item.title} />
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-navy">{item.title}</p>
                  {item.content ? (
                    <p className="truncate text-xs text-muted">{item.content}</p>
                  ) : null}
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setNotice(null);
                    setCreating(false);
                    setEditing(item);
                  }}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="dangerOutline"
                  onClick={() => {
                    setNotice(null);
                    setRemoving(item);
                  }}
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
      ) : null}

      <Modal
        open={Boolean(activeKind) && (creating || Boolean(editing))}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        title={
          activeKind
            ? `${editing ? "Edit" : "Add"} ${catalogKindLabel(activeKind).toLowerCase()}`
            : "Add"
        }
        description={
          activeKind && catalogKindHasAnswer(activeKind)
            ? "Question and answer. Tours can reuse this."
            : activeKind && catalogKindHasIcon(activeKind)
              ? "Icon and title. Tours can reuse this."
              : "A title tours can reuse."
        }
      >
        {activeKind && (creating || editing) ? (
          <CatalogItemForm
            key={editing?.id ?? "new"}
            kind={activeKind}
            item={editing}
            onClose={() => {
              setCreating(false);
              setEditing(null);
            }}
            onSaved={() => {
              setCreating(false);
              setEditing(null);
              router.refresh();
            }}
          />
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        title={`Delete ${removing?.title ?? "item"}?`}
        description="Tours that already use it must drop it before it can be deleted."
        confirmLabel="Delete"
        onConfirm={async () => {
          if (!removing) return;
          const result = await deleteCatalogItem(removing.id);
          if (result.error) {
            setNotice(result.error);
            setRemoving(null);
            return;
          }
          setRemoving(null);
          router.refresh();
        }}
      />
    </div>
  );
}

function CatalogItemForm({
  kind,
  item,
  onClose,
  onSaved,
}: {
  kind: CatalogKind;
  item: CatalogRow | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [state, action, pending] = useActionState(saveCatalogItem, initialFormState);
  const [imageBusy, setImageBusy] = useState(false);
  const initialImage: UploadedImage | null =
    item?.iconUrl && item.iconKey
      ? { url: item.iconUrl, key: item.iconKey, driver: item.iconDriver }
      : null;
  const [image, setImage] = useState<UploadedImage | null>(initialImage);

  useEffect(() => {
    if (state.success) onSaved();
  }, [onSaved, state.success]);

  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="id" value={item?.id ?? ""} />
      <input type="hidden" name="kind" value={kind} />
      <Field label={catalogKindHasAnswer(kind) ? "Question" : "Title"} required>
        <input
          name="title"
          defaultValue={item?.title ?? ""}
          placeholder={catalogKindHasAnswer(kind) ? "Question" : "Title"}
          className="!h-10"
          required
        />
      </Field>
      {catalogKindHasAnswer(kind) ? (
        <Field label="Answer" required>
          <textarea
            name="content"
            defaultValue={item?.content ?? ""}
            rows={4}
            placeholder="Answer"
            className="!min-h-0 resize-y"
            required
          />
        </Field>
      ) : null}
      {catalogKindHasIcon(kind) ? (
        <ImageUploader
          folder="catalog"
          label="Icon"
          compact
          value={image}
          initialValue={initialImage}
          onChange={setImage}
          onBusyChange={setImageBusy}
          hint="Square image works best. JPG, PNG, WebP, or GIF up to 5 MB."
        />
      ) : null}
      {state.error ? <FormMessage state={state} /> : null}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending || imageBusy}>
          {pending ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}

function ItemIcon({ url, title }: { url: string; title: string }) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt="" className="size-10 rounded-md object-cover" />
    );
  }
  return (
    <span className="flex size-10 items-center justify-center rounded-md bg-surface text-sm font-semibold text-muted">
      {title.slice(0, 1).toUpperCase()}
    </span>
  );
}
