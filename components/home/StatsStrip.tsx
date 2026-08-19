import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";

export async function StatsStrip({
  listings,
  cities,
  agents,
}: {
  listings: number;
  cities: number;
  agents: number;
}) {
  if (listings === 0) return null;

  const t = await getTranslations("home");

  const stats = [
    { value: listings, label: t("statsListingsLabel") },
    { value: cities, label: t("statsCitiesLabel") },
    { value: agents, label: t("statsAgentsLabel") },
  ].filter((stat) => stat.value > 0);

  return (
    <div className="border-b border-ink-border bg-ink py-10 text-ink-foreground">
      <Container className="flex flex-wrap justify-between gap-8">
        {stats.map((stat) => (
          <div key={stat.label}>
            <div className="font-serif text-3xl text-accent-light sm:text-4xl">{stat.value}+</div>
            <div className="mt-2 font-label text-xs uppercase tracking-[0.14em] text-ink-muted">
              {stat.label}
            </div>
          </div>
        ))}
      </Container>
    </div>
  );
}
