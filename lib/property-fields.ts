import type { AgentPropertyOutput } from "@/lib/validations/agent-property";

export function toPropertyFields(
  data: Omit<AgentPropertyOutput, "status">,
  city: { id: string },
  neighborhoodId: string | null,
) {
  return {
    purpose: data.purpose,
    property_type: data.propertyType,
    title_sq: data.titleSq,
    title_en: data.titleEn || null,
    description_sq: data.descriptionSq || null,
    description_en: data.descriptionEn || null,
    price: data.price,
    price_period: data.purpose === "rent" ? "month" : null,
    city_id: city.id,
    neighborhood_id: neighborhoodId,
    address_line: data.addressLine || null,
    gross_area: data.grossArea,
    net_area: data.netArea ?? null,
    bedrooms: data.bedrooms ?? null,
    bathrooms: data.bathrooms ?? null,
    floor: data.floor ?? null,
    total_floors: data.totalFloors ?? null,
    furnishing: data.furnishing ?? null,
    has_elevator: data.hasElevator ?? false,
    has_parking: data.hasParking ?? false,
    construction_condition: data.constructionCondition ?? null,
    construction_year: data.constructionYear ?? null,
    certificate_status: data.certificateStatus ?? null,
  };
}
