import { z } from "zod";

export const adminAgentSchema = z.object({
  fullName: z.string().trim().min(2).max(200),
  titleSq: z.string().trim().max(200).optional(),
  titleEn: z.string().trim().max(200).optional(),
  bioSq: z.string().trim().max(3000).optional(),
  bioEn: z.string().trim().max(3000).optional(),
  phone: z.string().trim().max(50).optional(),
  whatsapp: z.string().trim().max(50).optional(),
  email: z.string().trim().email().optional().or(z.literal("")),
  photoUrl: z.string().trim().max(500).optional(),
  licenseNo: z.string().trim().max(100).optional(),
});

export type AdminAgentInput = z.input<typeof adminAgentSchema>;
export type AdminAgentOutput = z.output<typeof adminAgentSchema>;
