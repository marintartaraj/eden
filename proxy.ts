import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createMiddleware(routing);

const PROTECTED_PREFIXES = ["/account", "/agent", "/admin"];

function splitLocalePrefix(pathname: string): { prefix: string; rest: string } {
  for (const locale of routing.locales) {
    if (pathname === `/${locale}`) return { prefix: `/${locale}`, rest: "/" };
    if (pathname.startsWith(`/${locale}/`)) {
      return { prefix: `/${locale}`, rest: pathname.slice(locale.length + 1) };
    }
  }
  return { prefix: "", rest: pathname };
}

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => to.cookies.set(cookie));
}

export default async function proxy(request: NextRequest) {
  const { response: sessionResponse, user } = await updateSession(request);

  const { prefix, rest } = splitLocalePrefix(request.nextUrl.pathname);

  if (isProtected(rest) && !user) {
    const loginUrl = new URL(`${prefix}/login`, request.url);
    // Locale-agnostic on purpose: LoginForm pushes this through next-intl's
    // locale-aware router, which prepends the current locale prefix itself.
    // Storing the already-prefixed pathname here double-prefixes it
    // (e.g. /en/login?redirect_to=/en/account -> push("/en/account") -> /en/en/account).
    loginUrl.searchParams.set("redirect_to", rest + request.nextUrl.search);
    const redirectResponse = NextResponse.redirect(loginUrl);
    copyCookies(sessionResponse, redirectResponse);
    return redirectResponse;
  }

  const intlResponse = intlMiddleware(request);
  copyCookies(sessionResponse, intlResponse);
  return intlResponse;
}

export const config = {
  matcher: ["/((?!api|auth|_next|_vercel|.*\\..*).*)"],
};
