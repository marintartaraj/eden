"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import type { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { PropertyCoreFields } from "@/components/property-form/PropertyCoreFields";
import {
  adminPropertySchema,
  PROPERTY_STATUSES,
  type AdminPropertyInput,
  type AdminPropertyOutput,
} from "@/lib/validations/admin-property";
import type { AgentPropertyInput } from "@/lib/validations/agent-property";
import { updateAdminProperty } from "@/lib/actions/admin-properties";
import type { Database } from "@/types/supabase";

type CityRow = Database["public"]["Tables"]["cities"]["Row"];
type NeighborhoodRow = Database["public"]["Tables"]["neighborhoods"]["Row"];
type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
type AgentRow = { id: string; full_name: string };

export function AdminPropertyForm({
  cities,
  neighborhoods,
  agents,
  property,
}: {
  cities: CityRow[];
  neighborhoods: NeighborhoodRow[];
  agents: AgentRow[];
  property: PropertyRow;
}) {
  const t = useTranslations("agentProperties.form");
  const adminT = useTranslations("adminProperties");
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const submittingRef = useRef(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AdminPropertyInput, unknown, AdminPropertyOutput>({
    resolver: zodResolver(adminPropertySchema),
    defaultValues: {
      purpose: property.purpose,
      propertyType: property.property_type,
      status: property.status,
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
      isFeatured: property.is_featured,
      isExclusive: property.is_exclusive,
      agentId: property.agent_id ?? undefined,
    },
  });

  const isFeatured = watch("isFeatured");
  const isExclusive = watch("isExclusive");

  async function onSubmit(values: AdminPropertyOutput) {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setErrorMessage(null);

    try {
      const result = await updateAdminProperty(property.id, values);
      if (!result.success) {
        setErrorMessage(t("error"));
        return;
      }
      router.refresh();
    } finally {
      submittingRef.current = false;
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
      <div className="rounded-2xl border border-border bg-card p-6">
        <CollapsibleSection title={adminT("controlsTitle")}>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">{adminT("agentAssign")}</label>
                <Select {...register("agentId")}>
                  <option value="">{adminT("unassigned")}</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.full_name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="flex flex-wrap gap-6">
              <Checkbox
                checked={Boolean(isFeatured)}
                onChange={(checked) => setValue("isFeatured", checked)}
                label={adminT("featured")}
              />
              <Checkbox
                checked={Boolean(isExclusive)}
                onChange={(checked) => setValue("isExclusive", checked)}
                label={adminT("exclusive")}
              />
            </div>
          </div>
        </CollapsibleSection>
      </div>

      <PropertyCoreFields
        register={register as unknown as UseFormRegister<AgentPropertyInput>}
        errors={errors as unknown as FieldErrors<AgentPropertyInput>}
        watch={watch as unknown as UseFormWatch<AgentPropertyInput>}
        setValue={setValue as unknown as UseFormSetValue<AgentPropertyInput>}
        cities={cities}
        neighborhoods={neighborhoods}
        statusOptions={PROPERTY_STATUSES}
        showStatus
      />

      {errorMessage && <p className="text-sm text-danger">{errorMessage}</p>}

      <Button type="submit" disabled={isSubmitting} className="self-start">
        {isSubmitting ? t("saving") : t("saveChanges")}
      </Button>
    </form>
  );
}
