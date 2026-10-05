import { NextResponse } from "next/server";
import { can, getCurrentUser } from "@/lib/auth/session";
import { uploadDocument, validateDocumentFile } from "@/lib/storage/documents";

const FOLDERS = new Set(["vehicles", "rental-documents"]);

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }

  const folder = String(formData.get("folder") ?? "");
  if (!FOLDERS.has(folder)) {
    return NextResponse.json({ error: "Unknown upload folder." }, { status: 400 });
  }

  const staffUpload = user.scope === "staff" && can(user, "vehicles.manage");
  const customerUpload =
    user.scope === "customer" &&
    folder === "rental-documents" &&
    can(user, "account.bookings.update");

  if (!staffUpload && !customerUpload) {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }

  const fileValue = formData.get("file");
  const file = fileValue instanceof File ? fileValue : null;
  const validationError = validateDocumentFile(file);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const uploaded = await uploadDocument({ file: file!, folder });
    return NextResponse.json(uploaded);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not upload the file." },
      { status: 500 },
    );
  }
}
