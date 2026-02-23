import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/staff", "/customer", "/shipments"];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtectedPath = PROTECTED_PREFIXES.some((prefix) => path.startsWith(prefix));

  if (!isProtectedPath) {
    return NextResponse.next();
  }

  const hasSessionToken =
    request.cookies.has("better-auth.session_token") ||
    request.cookies.has("__Secure-better-auth.session_token");

  if (!hasSessionToken) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/staff/:path*", "/customer/:path*", "/shipments/:path*"],
};
