import { NextResponse, type NextRequest } from "next/server";
import { detectLocale, isLocale, LOCALE_COOKIE } from "@/i18n/locales";

function userLocale(request: NextRequest) {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(saved)) return saved;
  return detectLocale(request.headers.get("accept-language"));
}

// Optimistic redirect only. Pages and server actions still verify the session
// and permissions against the database.
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminLogin = pathname === "/admin/login" || pathname.startsWith("/admin/login/");
  const isAccount = pathname === "/account" || pathname.startsWith("/account/");
  const isApi = pathname.startsWith("/api");

  if (!isApi && !request.cookies.has("session") && ((isAdmin && !isAdminLogin) || isAccount)) {
    const loginPath = isAdmin ? "/admin/login" : "/login";
    const url = new URL(loginPath, request.url);
    url.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  const locale = userLocale(request);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  requestHeaders.set("x-user-locale", locale);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  if (!isAdmin && !isApi && !isLocale(request.cookies.get(LOCALE_COOKIE)?.value)) {
    response.cookies.set(LOCALE_COOKIE, locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons/|img/|sw.js|.*\\..*).*)"],
};
