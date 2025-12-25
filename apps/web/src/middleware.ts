import { NextResponse, type NextRequest } from "next/server";

/**
 * Minimal, safe middleware:
 * - Never blocks public routes
 * - Never blocks /admin/login (prevents redirect loop)
 * - For admin routes, we only do a lightweight cookie presence check
 *   (real auth still happens server-side in guards/actions).
 */

// Change this ONLY if your admin cookie name is different in your session code.
const ADMIN_COOKIE_CANDIDATES = ["admin_session", "mhr_admin", "mhr_admin_session"];

function hasAnyAdminCookie(req: NextRequest) {
  for (const name of ADMIN_COOKIE_CANDIDATES) {
    if (req.cookies.get(name)?.value) return true;
  }
  return false;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow next internals + assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/assets") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".ico")
  ) {
    return NextResponse.next();
  }

  // Public pages
  if (
    pathname === "/" ||
    pathname.startsWith("/request-access") ||
    pathname.startsWith("/login/tenant") ||
    pathname.startsWith("/contact")
  ) {
    return NextResponse.next();
  }

  // CRITICAL: allow admin login always (prevents loop)
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
    return NextResponse.next();
  }

  // Protect admin area (lightweight check)
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!hasAnyAdminCookie(req)) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api).*)"]
};
