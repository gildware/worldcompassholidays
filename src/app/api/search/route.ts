import { NextResponse } from "next/server";
import { searchCatalog } from "@/lib/search/catalog";
import { recordSearch } from "@/lib/search/log";
import { hasSearchableQuery } from "@/lib/search/rank";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length > 80) {
    return NextResponse.json({ hits: [] }, { headers: { "Cache-Control": "no-store" } });
  }

  try {
    const hits = await searchCatalog(query);
    if (hasSearchableQuery(query)) {
      void recordSearch({
        query,
        source: "catalog",
        results: hits.length,
      });
    }
    return NextResponse.json({ hits }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("catalog search failed", error);
    return NextResponse.json({ error: "Search is unavailable" }, { status: 500 });
  }
}
