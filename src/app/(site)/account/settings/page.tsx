import type { Metadata } from "next";
import { PasswordForm } from "@/components/account/PasswordForm";
import { ProfileForm } from "@/components/account/ProfileForm";
import { requireCustomer } from "@/lib/auth/guards";
import { formatDate } from "@/lib/format";
import { listProfileDocuments } from "@/lib/rentals/profile-documents";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = privateMetadata(
  "Account settings",
  "Update your World Compass Holidays profile and password.",
);

export default async function AccountSettingsPage() {
  const user = await requireCustomer("account.profile.update");
  const documents = await listProfileDocuments(user.id);

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-xl font-semibold leading-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted">Profile and password</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ProfileForm
          name={user.name}
          email={user.email.endsWith("@riders.worldcompass.local") ? "" : user.email}
          phone={user.phone}
        />
        <PasswordForm />
      </div>
      <section className="grid gap-3 rounded-xl border border-line bg-white p-5">
        <div>
          <h2 className="text-lg font-semibold">Saved documents</h2>
          <p className="mt-1 text-sm text-muted">
            Documents you upload for a rental stay here. The next booking lets you choose them instead of uploading again.
          </p>
        </div>
        {documents.length === 0 ? (
          <p className="text-sm text-muted">No documents saved yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {documents.map((document) => (
              <li key={document.configId} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-medium">{document.typeName}</p>
                  <p className="text-muted">
                    {document.number || "No number"}
                    {document.expiryDate ? ` · expires ${formatDate(new Date(`${document.expiryDate}T00:00`))}` : ""}
                  </p>
                </div>
                <a href={document.fileUrl} className="font-medium text-brand" target="_blank" rel="noreferrer">
                  Open file
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
