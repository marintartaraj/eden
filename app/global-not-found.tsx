import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you are looking for does not exist.",
};

// Handles genuinely unmatched routes (nothing under app/[locale]/... even
// matched). Required because this app has no single root app/layout.tsx —
// the root layout lives at app/[locale]/layout.tsx, a top-level dynamic
// segment, which is exactly the case Next.js's docs call out as needing
// this file instead of a plain app/not-found.tsx. Bypasses normal
// rendering entirely, so it imports its own styles/fonts and can't use
// next-intl (no locale has been resolved at this point).
export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} antialiased`}>
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center font-sans text-foreground">
        <h1 className="font-serif text-2xl sm:text-3xl">Page Not Found</h1>
        <p className="max-w-md text-sm text-muted">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages --
            global-not-found.tsx bypasses normal app rendering (per Next's
            own docs example), so there's no router context for next/link
            to hook into here — a plain <a> is the documented pattern. */}
        <a
          href="/"
          className="mt-2 inline-flex h-11 items-center rounded-full bg-accent px-6 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
        >
          Back to Home
        </a>
      </body>
    </html>
  );
}
