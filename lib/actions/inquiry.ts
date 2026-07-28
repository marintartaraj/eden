"use server";

import { createClient } from "@/lib/supabase/server";
import { inquirySchema, type InquiryFormValues } from "@/lib/validations/inquiry";
import { checkRateLimit } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { sendEmail } from "@/lib/email";
import { getAdminEmails } from "@/lib/data/admin-notifications";

// Inquiries aren't assigned to an agent until later (via the admin/agent
// lead tools) — at submission time the only agent link available is the
// property's own listing agent, if any. Falls back to admins so nothing
// goes unnoticed (general contact-form inquiries have no property_id at
// all, and some listings have no agent assigned yet).
async function getInquiryNotificationRecipients(propertyId: string | null): Promise<string[]> {
  if (propertyId) {
    const supabase = await createClient();
    const { data: property } = await supabase
      .from("properties")
      .select("agent_id")
      .eq("id", propertyId)
      .maybeSingle();

    if (property?.agent_id) {
      const { data: agent } = await supabase
        .from("agents")
        .select("email")
        .eq("id", property.agent_id)
        .maybeSingle();
      if (agent?.email) return [agent.email];
    }
  }

  return getAdminEmails();
}

export async function submitInquiry(
  propertyId: string | null,
  values: InquiryFormValues,
  turnstileToken?: string,
) {
  const parsed = inquirySchema.safeParse(values);
  if (!parsed.success) return { success: false as const };

  const allowed = await checkRateLimit("inquiry", 5, 600);
  if (!allowed) return { success: false as const };

  const humanVerified = await verifyTurnstileToken(turnstileToken);
  if (!humanVerified) return { success: false as const };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("inquiries").insert({
    property_id: propertyId,
    type: parsed.data.type,
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    message: parsed.data.message || null,
    preferred_date: parsed.data.preferredDate || null,
    preferred_time: parsed.data.preferredTime || null,
    submitted_by_user_id: user?.id ?? null,
  });

  if (error) return { success: false as const };

  const recipients = await getInquiryNotificationRecipients(propertyId);
  if (recipients.length > 0) {
    await sendEmail({
      to: recipients,
      subject: `New ${parsed.data.type === "viewing_request" ? "viewing request" : "inquiry"} from ${parsed.data.name}`,
      html: `
        <p><strong>${parsed.data.name}</strong> (${parsed.data.email}${parsed.data.phone ? `, ${parsed.data.phone}` : ""}) sent a new ${parsed.data.type === "viewing_request" ? "viewing request" : "inquiry"}.</p>
        ${parsed.data.message ? `<p>${parsed.data.message}</p>` : ""}
        ${parsed.data.preferredDate ? `<p>Preferred date: ${parsed.data.preferredDate}${parsed.data.preferredTime ? ` at ${parsed.data.preferredTime}` : ""}</p>` : ""}
      `,
    });
  }

  return { success: true };
}
