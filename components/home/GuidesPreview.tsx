import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { getLatestGuides } from "@/lib/data/guides";
import { localize } from "@/lib/localize";
import type { AppLocale } from "@/i18n/routing";

export async function GuidesPreview({ locale }: { locale: AppLocale }) {
  const [t, guides] = await Promise.all([getTranslations("home"), getLatestGuides(3)]);

  if (guides.length === 0) return null;

  return (
    <section className="py-16">
      <Container>
        <div className="mb-8">
          <h2 className="font-serif text-2xl text-foreground sm:text-3xl">{t("guidesTitle")}</h2>
          <p className="mt-2 text-muted">{t("guidesSubtitle")}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {guides.map((guide) => (
            <Link
              key={guide.id}
              href={`/guides/${guide.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-border">
                {guide.cover_image && (
                  <Image
                    src={guide.cover_image}
                    alt={localize(guide.title_sq, guide.title_en, locale)}
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-5">
                <h3 className="line-clamp-2 font-serif text-base text-foreground">
                  {localize(guide.title_sq, guide.title_en, locale)}
                </h3>
                <span className="mt-auto pt-2 text-sm font-medium text-accent group-hover:opacity-80">
                  {t("readMore")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
