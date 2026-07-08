import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { authRoutes } from "@/config/navigation";

const intlMiddleware = createMiddleware(routing);

const protectedPrefixes = [
  "/",
  "/products",
  "/orders",
  "/users",
  "/coupons",
  "/context",
  "/weblog",
  "/themes",
  "/set-style",
  "/setting-seo",
  "/general-setting",
  "/contact",
];

function isProtectedRoute(pathname: string) {
  if (authRoutes.includes(pathname)) return false;
  if (pathname.startsWith("/checkout/themes")) return false;
  return protectedPrefixes.some(
    (prefix) => pathname === prefix || (prefix !== "/" && pathname.startsWith(prefix)),
  );
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const intlResponse = intlMiddleware(request);

  if (isProtectedRoute(pathname)) {
    const token = request.cookies.get("accessToken")?.value;
    const hasLocalStorageHint = request.headers.get("x-auth-check");

    if (!token && !hasLocalStorageHint && pathname !== "/") {
      // Client-side auth uses localStorage; allow through and let client guard handle redirect
    }
  }

  return intlResponse ?? NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
