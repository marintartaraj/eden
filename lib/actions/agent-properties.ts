"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentAgentId } from "@/lib/auth/agent";
import { getCities, getNeighborhoods } from "@/lib/data/locations";
import { slugify, randomSuffix } from "@/lib/slug";
import { toPropertyFields } from "@/lib/property-fields";
import { geocodeAddress } from "@/lib/geocode";
import { agentPropertySchema, type AgentPropertyOutput } from "@/lib/validations/agent-property";

export async function resolveLocation(data: Omit<AgentPropertyOutput, "status">) {
  const cities = await getCities();
  const city = cities.find((c) => c.slug === data.city);
  if (!city) return null;

  const neighborhoods = await getNeighborhoods();
  const neighborhood = data.neighborhood
    ? (neighborhoods.find((n) => n.slug === data.neighborhood && n.city_id === city.id) ?? null)
    : null;

  return { city, neighborhood };
}

export async function createAgentProperty(input: AgentPropertyOutput) {
  const parsed = agentPropertySchema.safeParse(input);
  if (!parsed.success) return { success: false as const };

  const agentId = await getCurrentAgentId();
  if (!agentId) return { success: false as const };

  const location = await resolveLocation(parsed.data);
  if (!location) return { success: false as const };

  const slug = `${slugify(parsed.data.propertyType)}-${slugify(location.city.slug)}-${randomSuffix()}`;
  const propertyId = crypto.randomUUID();

  const geocodeQuery = [
    parsed.data.addressLine,
    location.neighborhood?.name_sq,
    location.city.name_sq,
    "Albania",
  ]
    .filter(Boolean)
    .join(", ");
  const coordinates = await geocodeAddress(geocodeQuery);

  const supabase = await createClient();
  const { error } = await supabase.from("properties").insert({
    id: propertyId,
    slug,
    status: "draft",
    source: "agent",
    agent_id: agentId,
    currency: "EUR",
    lat: coordinates?.lat ?? null,
    lng: coordinates?.lng ?? null,
    ...toPropertyFields(parsed.data, location.city, location.neighborhood?.id ?? null),
  });

  if (error) return { success: false as const };
  return { success: true as const, propertyId };
}

export async function updateAgentProperty(id: string, input: AgentPropertyOutput) {
  const parsed = agentPropertySchema.safeParse(input);
  if (!parsed.success) return { success: false as const };

  const location = await resolveLocation(parsed.data);
  if (!location) return { success: false as const };

  const supabase = await createClient();
  const { error } = await supabase
    .from("properties")
    .update({
      status: parsed.data.status,
      ...toPropertyFields(parsed.data, location.city, location.neighborhood?.id ?? null),
    })
    .eq("id", id);

  if (error) return { success: false as const };
  return { success: true as const };
}
