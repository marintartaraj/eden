import { z } from "zod";
import { PROPERTY_TYPES } from "@/lib/property-types";
import {
  FURNISHING_STATUSES,
  CONSTRUCTION_CONDITIONS,
  CERTIFICATE_STATUSES,
} from "@/lib/property-enums";
import { optionalNumber } from "@/lib/validations/zod-helpers";

// Matches the columns the Phase 3 migration actually grants agents UPDATE
// on for `properties.status` — 'active' (publishing) is admin-only.
export const AGENT_EDITABLE_STATUSES = [
  "draft",
  "pending",
  "reserved",
  "sold",
  "rented",
  "archived",
] as const;

export const agentPropertySchema = z.object({
  purpose: z.enum(["sale", "rent"]),
  propertyType: z.enum(PROPERTY_TYPES),
  status: z.enum(AGENT_EDITABLE_STATUSES),

  titleSq: z.string().trim().min(3).max(200),
  titleEn: z.string().trim().max(200).optional(),
  descriptionSq: z.string().trim().max(5000).optional(),
  descriptionEn: z.string().trim().max(5000).optional(),

  city: z.string().min(1),
  neighborhood: z.string().optional(),
  addressLine: z.string().max(200).optional(),

  price: z.coerce.number().positive(),

  grossArea: z.coerce.number().positive(),
  netArea: optionalNumber(z.coerce.number().positive()),
  bedrooms: optionalNumber(z.coerce.number().int().min(0).max(50)),
  bathrooms: optionalNumber(z.coerce.number().int().min(0).max(50)),
  floor: optionalNumber(z.coerce.number().int().min(-2).max(200)),
  totalFloors: optionalNumber(z.coerce.number().int().min(0).max(200)),
  furnishing: z.enum(FURNISHING_STATUSES).optional(),
  hasElevator: z.boolean().optional(),
  hasParking: z.boolean().optional(),

  constructionCondition: z.enum(CONSTRUCTION_CONDITIONS).optional(),
  constructionYear: optionalNumber(z.coerce.number().int().min(1800).max(2100)),
  certificateStatus: z.enum(CERTIFICATE_STATUSES).optional(),
});

export type AgentPropertyInput = z.input<typeof agentPropertySchema>;
export type AgentPropertyOutput = z.output<typeof agentPropertySchema>;
