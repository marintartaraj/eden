import { z } from "zod";

export const inquirySchema = z
  .object({
    type: z.enum(["general", "viewing_request"]),
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().min(1).email(),
    phone: z.string().trim().max(30).optional(),
    message: z.string().trim().max(2000).optional(),
    preferredDate: z.string().optional(),
    preferredTime: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "viewing_request" && !data.preferredDate) {
      ctx.addIssue({ code: "custom", path: ["preferredDate"], message: "required" });
    }
  });

export type InquiryFormValues = z.infer<typeof inquirySchema>;
