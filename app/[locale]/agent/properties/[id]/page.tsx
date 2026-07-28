import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { AgentNav } from "@/components/agent/AgentNav";
import { AgentPropertyForm } from "@/components/agent/AgentPropertyForm";
import { AgentPhotoManager } from "@/components/agent/AgentPhotoManager";
import { AgentFloorPlanManager } from "@/components/agent/AgentFloorPlanManager";
import { getMyAssignedPropertyById } from "@/lib/data/agent-properties";
import { getCities, getNeighborhoods } from "@/lib/data/locations";
import { createClient } from "@/lib/supabase/server";

export default async function EditAgentPropertyPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const property = await getMyAssignedPropertyById(id);
  if (!property) notFound();

  const [t, cities, neighborhoods, supabase] = await Promise.all([
    getTranslations("agentProperties"),
    getCities(),
    getNeighborhoods(),
    createClient(),
  ]);

  const [{ data: images }, { data: floorPlans }] = await Promise.all([
    supabase
      .from("property_images")
      .select("id, url, is_cover, sort_order")
      .eq("property_id", id)
      .order("sort_order"),
    supabase.from("property_floor_plans").select("id, url, label").eq("property_id", id),
  ]);

  return (
    <Container className="py-8 sm:py-12">
      <h1 className="font-serif text-2xl text-foreground sm:text-3xl">{t("editProperty")}</h1>
      <AgentNav />

      <div className="mt-8 max-w-3xl">
        <AgentPropertyForm cities={cities} neighborhoods={neighborhoods} property={property} />

        <div className="mt-10">
          <h2 className="mb-4 font-serif text-lg text-foreground">{t("media.photosTitle")}</h2>
          <AgentPhotoManager propertyId={id} initialImages={images ?? []} />
        </div>

        <div className="mt-10">
          <h2 className="mb-4 font-serif text-lg text-foreground">{t("media.floorPlansTitle")}</h2>
          <AgentFloorPlanManager propertyId={id} initialPlans={floorPlans ?? []} />
        </div>
      </div>
    </Container>
  );
}
