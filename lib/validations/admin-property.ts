import { z } from "zod";
import { agentPropertySchema } from "@/lib/validations/agent-property";

export const PROPERTY_STATUSES = [
  "draft",
  "pending",
  "active",
  "reserved",
  "sold",
  "rented",
  "archived",
] as const;

export const adminPropertySchema = agentPropertySchema.extend({
  status: z.enum(PROPERTY_STATUSES),
  isFeatured: z.boolean().optional(),
  isExclusive: z.boolean().optional(),
  agentId: z.string().optional(),
});

export type AdminPropertyInput = z.input<typeof adminPropertySchema>;
export type AdminPropertyOutput = z.output<typeof adminPropertySchema>;
