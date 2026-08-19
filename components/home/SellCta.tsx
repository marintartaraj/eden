import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";

export async function SellCta() {
  const t = await getTranslations("home");

  return (
    <section className="bg-ink py-20 text-ink-foreground">
      <Container>
        <div className="flex flex-col items-center gap-5 text-center">
          <span className="eyebrow !text-accent-light">{t("sellCtaEyebrow")}</span>
          <h2 className="max-w-xl font-serif text-3xl sm:text-4xl">{t("sellCtaTitle")}</h2>
          <p className="max-w-md text-ink-muted">{t("sellCtaDescription")}</p>
          <Link
            href="/sell-property"
            className="mt-4 inline-flex h-12 items-center justify-center bg-accent-light px-8 text-base font-medium text-ink transition-colors hover:bg-background"
          >
            {t("sellCtaButton")}
          </Link>
        </div>
      </Container>
    </section>
  );
}
