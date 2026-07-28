import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  // Required for app/global-not-found.tsx: this app has no single root
  // app/layout.tsx (the root layout lives at app/[locale]/layout.tsx, a
  // top-level dynamic segment), which is exactly the case Next.js's docs
  // call out as needing globalNotFound instead of a plain app/not-found.tsx.
  experimental: {
    globalNotFound: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

export default withNextIntl(nextConfig);
