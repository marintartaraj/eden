import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { PropertyDetail } from "@/lib/data/properties";

export async function FloorPlansSection({
  floorPlans,
}: {
  floorPlans: PropertyDetail["floorPlans"];
}) {
  if (floorPlans.length === 0) return null;
  const t = await getTranslations("detail");

  return (
    <section>
      <h2 className="mb-4 font-serif text-xl text-foreground">{t("floorPlans")}</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {floorPlans.map((plan) => (
          <a
            key={plan.url}
            href={plan.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col gap-2"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-border">
              <Image
                src={plan.url}
                alt={plan.label ?? t("floorPlans")}
                fill
                sizes="33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            {plan.label && <p className="text-sm text-muted">{plan.label}</p>}
          </a>
        ))}
      </div>
    </section>
  );
}
