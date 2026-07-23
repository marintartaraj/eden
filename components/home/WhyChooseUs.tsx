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
    <section className="py-16">
      <Container>
        <h2 className="mb-10 text-center font-serif text-2xl text-foreground sm:text-3xl">
          {t("whyTitle")}
        </h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {items.map((item) => (
            <div key={item.title} className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-lg text-foreground">{item.title}</h3>
              <p className="max-w-xs text-sm text-muted">{item.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
