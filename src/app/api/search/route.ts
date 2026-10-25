import { NextResponse } from "next/server";
import { searchCatalog } from "@/lib/search/catalog";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length > 80) {
    return NextResponse.json({ hits: [] }, { headers: { "Cache-Control": "no-store" } });
  }

  try {
    const hits = await searchCatalog(query);
    return NextResponse.json({ hits }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("catalog search failed", error);
    return NextResponse.json({ error: "Search is unavailable" }, { status: 500 });
  }
}
