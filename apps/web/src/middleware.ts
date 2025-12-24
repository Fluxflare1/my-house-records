import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isPublicPath(pathname: string) {
  // Login routes will be added in Step A4
  return (
    pathname === "/" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/api")
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublicPath(pathname)) return NextResponse.next();

  const role = req.cookies.get("mhr_role")?.value || "";

  // Admin routes protection
  if (pathname.startsWith("/admin")) {
    if (role !== "admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/login/admin";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Tenant routes protection
  if (pathname.startsWith("/tenant")) {
    if (role !== "tenant") {
      const url = req.nextUrl.clone();
      url.pathname = "/login/tenant";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
