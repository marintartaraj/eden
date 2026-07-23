"use server";

import { createClient } from "@/lib/supabase/server";
import { inquirySchema, type InquiryFormValues } from "@/lib/validations/inquiry";

export async function submitInquiry(propertyId: string, values: InquiryFormValues) {
  const parsed = inquirySchema.safeParse(values);
  if (!parsed.success) return { success: false as const };

  const supabase = await createClient();
  const { error } = await supabase.from("inquiries").insert({
    property_id: propertyId,
    type: parsed.data.type,
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    message: parsed.data.message || null,
    preferred_date: parsed.data.preferredDate || null,
    preferred_time: parsed.data.preferredTime || null,
  });

  return { success: !error };
}
