import { NextResponse } from "next/server";
import type { StaffPermission } from "@/lib/auth/permissions";
import { can, getCurrentUser } from "@/lib/auth/session";
import { isImageFolder } from "@/lib/storage/folders";
import { uploadImage, validateImageFile } from "@/lib/storage";

const FOLDER_PERMISSION: Record<string, StaffPermission> = {
  destinations: "destinations.manage",
  tours: "tours.manage",
  hotels: "hotels.manage",
  vehicles: "vehicles.manage",
  buses: "buses.manage",
};

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.scope !== "staff") {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }

  const folderValue = String(formData.get("folder") ?? "");
  if (!isImageFolder(folderValue)) {
    return NextResponse.json({ error: "Unknown upload folder." }, { status: 400 });
  }

  const permission = FOLDER_PERMISSION[folderValue];
  if (!permission || !can(user, permission)) {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }

  const fileValue = formData.get("file");
  const file = fileValue instanceof File ? fileValue : null;
  const validationError = validateImageFile(file);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const uploaded = await uploadImage({ file: file!, folder: folderValue });
    return NextResponse.json(uploaded);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not upload the image.",
      },
      { status: 500 },
    );
  }
}
