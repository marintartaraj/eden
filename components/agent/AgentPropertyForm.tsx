"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { PropertyCoreFields } from "@/components/property-form/PropertyCoreFields";
import {
  agentPropertySchema,
  AGENT_EDITABLE_STATUSES,
  type AgentPropertyInput,
  type AgentPropertyOutput,
} from "@/lib/validations/agent-property";
import { createAgentProperty, updateAgentProperty } from "@/lib/actions/agent-properties";
import type { Database } from "@/types/supabase";

type CityRow = Database["public"]["Tables"]["cities"]["Row"];
type NeighborhoodRow = Database["public"]["Tables"]["neighborhoods"]["Row"];
type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];

export function AgentPropertyForm({
  cities,
  neighborhoods,
  property,
}: {
  cities: CityRow[];
  neighborhoods: NeighborhoodRow[];
  property?: PropertyRow;
}) {
  const t = useTranslations("agentProperties.form");
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const submittingRef = useRef(false);

  const isEdit = Boolean(property);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AgentPropertyInput, unknown, AgentPropertyOutput>({
    resolver: zodResolver(agentPropertySchema),
    defaultValues: property
      ? {
          purpose: property.purpose,
          propertyType: property.property_type,
          status: property.status as (typeof AGENT_EDITABLE_STATUSES)[number],
          titleSq: property.title_sq,
          titleEn: property.title_en ?? undefined,
          descriptionSq: property.description_sq ?? undefined,
          descriptionEn: property.description_en ?? undefined,
          city: cities.find((c) => c.id === property.city_id)?.slug,
          neighborhood: neighborhoods.find((n) => n.id === property.neighborhood_id)?.slug,
          addressLine: property.address_line ?? undefined,
          price: property.price,
          grossArea: property.gross_area ?? undefined,
          netArea: property.net_area ?? undefined,
          bedrooms: property.bedrooms ?? undefined,
          bathrooms: property.bathrooms ?? undefined,
          floor: property.floor ?? undefined,
          totalFloors: property.total_floors ?? undefined,
          furnishing: property.furnishing ?? undefined,
          hasElevator: property.has_elevator,
          hasParking: property.has_parking,
          constructionCondition: property.construction_condition ?? undefined,
          constructionYear: property.construction_year ?? undefined,
          certificateStatus: property.certificate_status ?? undefined,
        }
      : {
          purpose: "sale",
          status: "draft",
          hasElevator: false,
          hasParking: false,
        },
  });

  async function onSubmit(values: AgentPropertyOutput) {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setErrorMessage(null);

    try {
      if (isEdit) {
        const result = await updateAgentProperty(property!.id, values);
        if (!result.success) {
          setErrorMessage(t("error"));
          return;
        }
        router.refresh();
        return;
      }

      const result = await createAgentProperty(values);
      if (!result.success) {
        setErrorMessage(t("error"));
        return;
      }
      router.push(`/agent/properties/${result.propertyId}`);
      router.refresh();
    } finally {
      submittingRef.current = false;
    }
  }

  // onSubmit reads/writes submittingRef.current inside its own body (an
  // event-handler context, not render); the rule can't see into
  // react-hook-form's handleSubmit to confirm it doesn't invoke the
  // callback synchronously during render, which it never does in practice.
  return (
    // eslint-disable-next-line react-hooks/refs
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
      <PropertyCoreFields
        register={register}
        errors={errors}
        watch={watch}
        setValue={setValue}
        cities={cities}
        neighborhoods={neighborhoods}
        statusOptions={AGENT_EDITABLE_STATUSES}
        showStatus={isEdit}
      />

      {errorMessage && <p className="text-sm text-danger">{errorMessage}</p>}

      <Button type="submit" disabled={isSubmitting} className="self-start">
        {isSubmitting ? t("saving") : isEdit ? t("saveChanges") : t("createProperty")}
      </Button>
    </form>
  );
}
