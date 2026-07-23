"use server";

import { createClient } from "@/lib/supabase/server";
import { getCities, getNeighborhoods } from "@/lib/data/locations";
import {
  propertySubmissionSchema,
  type PropertySubmissionOutput,
} from "@/lib/validations/property-submission";
import sqMessages from "@/messages/sq.json";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 8);
}

export async function submitPropertyListing(input: PropertySubmissionOutput) {
  const parsed = propertySubmissionSchema.safeParse(input);
  if (!parsed.success) return { success: false as const };

  const data = parsed.data;

  const cities = await getCities();
  const city = cities.find((c) => c.slug === data.city);
  if (!city) return { success: false as const };

  const neighborhoods = await getNeighborhoods();
  const neighborhood = data.neighborhood
    ? (neighborhoods.find((n) => n.slug === data.neighborhood && n.city_id === city.id) ?? null)
    : null;

  const typeNames = sqMessages.propertyTypes as Record<string, string>;
  const typeName = typeNames[data.propertyType] ?? data.propertyType;
  const location = neighborhood ? `${city.name_sq}, ${neighborhood.name_sq}` : city.name_sq;
  const titleSq = `${typeName} në ${location}`;
  const slug = `${slugify(data.propertyType)}-${slugify(city.slug)}-${randomSuffix()}`;

  const supabase = await createClient();

  const { data: property, error } = await supabase
    .from("properties")
    .insert({
      slug,
      purpose: data.purpose,
      property_type: data.propertyType,
      status: "pending",
      source: "owner_submission",
      title_sq: titleSq,
      price: data.price,
      currency: "EUR",
      price_period: data.purpose === "rent" ? "month" : null,
      city_id: city.id,
      neighborhood_id: neighborhood?.id ?? null,
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
      owner_contact_name: data.ownerName,
      owner_contact_phone: data.ownerPhone,
      owner_contact_email: data.ownerEmail,
    })
    .select("id")
    .single();

  if (error || !property) return { success: false as const };

  if (data.photos.length > 0) {
    await supabase.from("property_images").insert(
      data.photos.map((url, index) => ({
        property_id: property.id,
        url,
        sort_order: index,
        is_cover: index === 0,
      })),
    );
  }

  return { success: true as const };
}
