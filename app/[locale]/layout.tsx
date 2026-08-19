import type { Metadata } from "next";
import { Inter, Playfair_Display, Cormorant_Garamond, Lora } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { getCurrentUser } from "@/lib/auth/session";
import { getFavoriteIds } from "@/lib/data/favorites";
import { FOCUS_RING } from "@/lib/utils";
import "../globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"] });
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});
const lora = Lora({ variable: "--font-lora", subsets: ["latin"], weight: ["400", "500"] });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site" });

  return {
    title: { default: t("name"), template: `%s · ${t("name")}` },
    description: t("description"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as AppLocale)) {
    notFound();
  }

  setRequestLocale(locale);
  const [messages, current, commonT] = await Promise.all([
    getMessages(),
    getCurrentUser(),
    getTranslations("common"),
  ]);
  const favoriteIds = current ? await getFavoriteIds(current.user.id) : [];

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${playfair.variable} ${cormorant.variable} ${lora.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <a
          href="#main-content"
          className={`sr-only rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 ${FOCUS_RING}`}
        >
          {commonT("skipToContent")}
        </a>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider user={current ? { id: current.user.id } : null} initialFavoriteIds={favoriteIds}>
            <Header current={current} />
            <main id="main-content" className="flex-1">{children}</main>
            <Footer />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
