import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";

export async function SellCta() {
  const t = await getTranslations("home");

  return (
    <section className="py-16">
      <Container>
        <div className="flex flex-col items-center gap-6 rounded-3xl bg-foreground px-6 py-14 text-center text-background sm:px-16">
          <h2 className="max-w-xl font-serif text-2xl sm:text-3xl">{t("sellCtaTitle")}</h2>
          <p className="max-w-md text-background/80">{t("sellCtaDescription")}</p>
          <Link
            href="/sell-property"
            className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-8 text-base font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            {t("sellCtaButton")}
          </Link>
        </div>
      </Container>
    </section>
  );
}
