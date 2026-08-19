import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  DEMO_SESSION_COOKIE,
  parseDemoSession,
} from "@/lib/demo-auth";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = parseDemoSession(
    request.cookies.get(DEMO_SESSION_COOKIE)?.value,
  );

  const isLogin = pathname === "/login";
  const isPublicAsset =
    pathname.startsWith("/docs/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico";

  if (isPublicAsset) {
    return NextResponse.next();
  }

  if (!session && !isLogin) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session && isLogin) {
    const home =
      session.role === "EMPLOYER" ? "/dashboard" : "/";
    return NextResponse.redirect(new URL(home, request.url));
  }

  if (session?.role === "EMPLOYEE") {
    if (
      pathname === "/dashboard" ||
      pathname.startsWith("/dashboard/") ||
      pathname === "/search"
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (session?.role === "EMPLOYER") {
    if (pathname === "/my-requests") {
      return NextResponse.redirect(new URL("/search", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
