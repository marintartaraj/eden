import {
  Building,
  Building2,
  Briefcase,
  Castle,
  Car,
  DoorOpen,
  Home,
  LandPlot,
  Layers,
  Store,
  Warehouse,
  BedDouble,
  type LucideIcon,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { PROPERTY_TYPES, type PropertyTypeSlug } from "@/lib/property-types";

const ICONS: Record<PropertyTypeSlug, LucideIcon> = {
  apartment: Building,
  studio: DoorOpen,
  villa: Castle,
  house: Home,
  land: LandPlot,
  office: Briefcase,
  shop: Store,
  commercial: Building2,
  warehouse: Warehouse,
  hotel: BedDouble,
  parking: Car,
  building: Layers,
};

export async function PropertyTypeShortcuts() {
  const t = await getTranslations();

  return (
    <section className="py-16">
      <Container>
        <h2 className="mb-8 font-serif text-2xl text-foreground sm:text-3xl">
          {t("home.typesTitle")}
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {PROPERTY_TYPES.map((type) => {
            const Icon = ICONS[type];
            return (
              <Link
                key={type}
                href={`/properties?type=${type}`}
                className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center transition-colors hover:border-accent"
              >
                <Icon className="h-6 w-6 text-accent" />
                <span className="text-sm font-medium text-foreground">
                  {t(`propertyTypes.${type}`)}
                </span>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
