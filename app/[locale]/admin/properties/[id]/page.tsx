import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminPropertyForm } from "@/components/admin/AdminPropertyForm";
import { getPropertyByIdForAdmin } from "@/lib/data/admin-properties";
import { getCities, getNeighborhoods } from "@/lib/data/locations";
import { getAllAgents } from "@/lib/data/agents";

export default async function EditAdminPropertyPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const property = await getPropertyByIdForAdmin(id);
  if (!property) notFound();

  const [t, cities, neighborhoods, agents] = await Promise.all([
    getTranslations("adminProperties"),
    getCities(),
    getNeighborhoods(),
    getAllAgents(),
  ]);

  return (
    <Container className="py-8 sm:py-12">
      <h1 className="font-serif text-2xl text-foreground sm:text-3xl">{t("editProperty")}</h1>
      <AdminNav />

      <div className="mt-8 max-w-3xl">
        <AdminPropertyForm
          cities={cities}
          neighborhoods={neighborhoods}
          agents={agents}
          property={property}
        />
      </div>
    </Container>
  );
}
