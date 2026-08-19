import { ShieldCheck, MapPin, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";

export async function WhyChooseUs() {
  const t = await getTranslations("home");

  const items = [
    { icon: ShieldCheck, title: t("whyVerifiedTitle"), description: t("whyVerifiedDescription") },
    { icon: MapPin, title: t("whyLocalTitle"), description: t("whyLocalDescription") },
    { icon: Users, title: t("whySupportTitle"), description: t("whySupportDescription") },
  ];

  return (
    <section className="bg-ink py-20 text-ink-foreground">
      <Container>
        <div className="mb-14 text-center">
          <span className="eyebrow !text-accent-light">{t("whyEyebrow")}</span>
          <h2 className="mt-2 font-serif text-2xl sm:text-3xl">{t("whyTitle")}</h2>
        </div>
        <div className="grid grid-cols-1 gap-px border border-ink-border bg-ink-border sm:grid-cols-3">
          {items.map((item, index) => (
            <div key={item.title} className="flex flex-col gap-4 bg-ink p-10">
              <div className="flex items-center gap-3">
                <item.icon className="h-6 w-6 text-accent-light" />
                <span className="font-label text-xs tracking-[0.2em] text-ink-muted">
                  — {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="font-serif text-xl">{item.title}</h3>
              <p className="text-sm leading-relaxed text-ink-muted">{item.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
