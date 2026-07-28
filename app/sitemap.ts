import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getPathname } from "@/i18n/navigation";
import { publicEnv } from "@/lib/env";
import { getAllActivePropertySlugs } from "@/lib/data/properties";
import { getAllNewDevelopments } from "@/lib/data/new-developments";
import { getAllAgents } from "@/lib/data/agents";

const BASE_URL = publicEnv.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// One entry per locale per path, each carrying the full set of alternates
// (including itself) — this is Google's recommended shape for multilingual
// sitemaps, rather than a single canonical URL with alternates bolted on.
function localizedEntries(pathname: string, lastModified?: Date | string): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    routing.locales.map((locale) => [locale, BASE_URL + getPathname({ href: pathname, locale })]),
  );

  return routing.locales.map((locale) => ({
    url: BASE_URL + getPathname({ href: pathname, locale }),
    lastModified,
    alternates: { languages },
  }));
}

const STATIC_PATHS = [
  "/",
  "/properties",
  "/for-sale",
  "/for-rent",
  "/new-developments",
  "/agents",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/sell-property",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [properties, developments, agents] = await Promise.all([
    getAllActivePropertySlugs(),
    getAllNewDevelopments(),
    getAllAgents(),
  ]);

  return [
    ...STATIC_PATHS.flatMap((path) => localizedEntries(path)),
    ...properties.flatMap((p) => localizedEntries(`/properties/${p.slug}`, p.updated_at)),
    ...developments.flatMap((d) => localizedEntries(`/new-developments/${d.slug}`, d.updated_at)),
    ...agents.flatMap((a) => localizedEntries(`/agents/${a.slug}`, a.updated_at)),
  ];
}
