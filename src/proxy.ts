import { NextResponse, type NextRequest } from "next/server";

// Optimistic redirect only. Pages and server actions still verify the session
// and permissions against the database.
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (request.cookies.has("session")) return NextResponse.next();

  const loginPath = pathname.startsWith("/admin") ? "/admin/login" : "/login";
  const url = new URL(loginPath, request.url);
  url.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin", "/admin/((?!login).*)", "/account/:path*"],
};
