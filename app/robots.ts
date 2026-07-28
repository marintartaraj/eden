import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/env";

const BASE_URL = publicEnv.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Private/auth-gated areas (proxy.ts PROTECTED_PREFIXES plus the auth flow
// pages themselves) — listed for both the unprefixed default locale (sq)
// and the "en" prefix, since localePrefix is "as-needed".
const PRIVATE_PATHS = [
  "/account",
  "/agent",
  "/admin",
  "/favorites",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/access-denied",
  "/account-suspended",
];

export default function robots(): MetadataRoute.Robots {
  const disallow = PRIVATE_PATHS.flatMap((path) => [path, `/en${path}`]);

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow,
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
