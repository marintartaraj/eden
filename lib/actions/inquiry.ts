"use server";

import { createClient } from "@/lib/supabase/server";
import { inquirySchema, type InquiryFormValues } from "@/lib/validations/inquiry";
import { checkRateLimit } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { sendEmail } from "@/lib/email";
import { getAdminEmails } from "@/lib/data/admin-notifications";
import type { SubmitResult } from "@/lib/actions/result";

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
): Promise<SubmitResult> {
  const parsed = inquirySchema.safeParse(values);
  if (!parsed.success) return { success: false, reason: "validation_error" };

  // Turnstile is checked before the rate limit: a slow-loading widget or an
  // ad/privacy blocker (which prevents a token from ever arriving) must not
  // burn through the rate-limit allowance before the user gets a real shot
  // at submitting — that combination is what previously let a handful of
  // quick retries lock a legitimate visitor out for the full rate-limit
  // window with no explanation.
  const verification = await verifyTurnstileToken(turnstileToken);
  if (!verification.verified) {
    return {
      success: false,
      reason: verification.reason === "invalid_token" ? "verification_failed" : "verification_unavailable",
    };
  }

  const allowed = await checkRateLimit("inquiry", 5, 600);
  if (!allowed) return { success: false, reason: "rate_limited" };

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

  if (error) return { success: false, reason: "database_error" };

  const recipients = await getInquiryNotificationRecipients(propertyId);
  if (recipients.length > 0) {
    // Recipients here can be the property's assigned agent, not just
    // internal admin staff (see getInquiryNotificationRecipients above) —
    // an Albanian-speaking agent is a very plausible reader, so unlike a
    // purely internal ops notification this needs both languages.
    const isViewing = parsed.data.type === "viewing_request";
    await sendEmail({
      to: recipients,
      subject: `New ${isViewing ? "viewing request" : "inquiry"} from ${parsed.data.name} / Kërkesë e re nga ${parsed.data.name}`,
      html: `
        <p><strong>${parsed.data.name}</strong> (${parsed.data.email}${parsed.data.phone ? `, ${parsed.data.phone}` : ""}) sent a new ${isViewing ? "viewing request" : "inquiry"}.</p>
        ${parsed.data.message ? `<p>${parsed.data.message}</p>` : ""}
        ${parsed.data.preferredDate ? `<p>Preferred date: ${parsed.data.preferredDate}${parsed.data.preferredTime ? ` at ${parsed.data.preferredTime}` : ""}</p>` : ""}
        <hr />
        <p><strong>${parsed.data.name}</strong> (${parsed.data.email}${parsed.data.phone ? `, ${parsed.data.phone}` : ""}) dërgoi ${isViewing ? "një kërkesë të re për vizitë" : "një kërkesë të re"}.</p>
        ${parsed.data.message ? `<p>${parsed.data.message}</p>` : ""}
        ${parsed.data.preferredDate ? `<p>Data e preferuar: ${parsed.data.preferredDate}${parsed.data.preferredTime ? ` në ${parsed.data.preferredTime}` : ""}</p>` : ""}
      `,
    });
  }

  return { success: true };
}
