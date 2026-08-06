"use server";

import { createClient } from "@/lib/supabase/server";
import { getCities, getNeighborhoods } from "@/lib/data/locations";
import {
  propertySubmissionSchema,
  type PropertySubmissionOutput,
} from "@/lib/validations/property-submission";
import { slugify, randomSuffix } from "@/lib/slug";
import { checkRateLimit } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { geocodeAddress } from "@/lib/geocode";
import { sendEmail } from "@/lib/email";
import { getAdminEmails } from "@/lib/data/admin-notifications";
import sqMessages from "@/messages/sq.json";
import type { SubmitResult } from "@/lib/actions/result";

export async function submitPropertyListing(
  input: PropertySubmissionOutput,
  turnstileToken?: string,
): Promise<SubmitResult> {
  const parsed = propertySubmissionSchema.safeParse(input);
  if (!parsed.success) return { success: false, reason: "validation_error" };

  // Turnstile is checked before the rate limit: a slow-loading widget or an
  // ad/privacy blocker (which prevents a token from ever arriving) must not
  // burn through the rate-limit allowance before the user gets a real shot
  // at submitting — that combination is what previously let a handful of
  // quick retries lock a legitimate seller out for a full hour with no
  // explanation.
  const verification = await verifyTurnstileToken(turnstileToken);
  if (!verification.verified) {
    return {
      success: false,
      reason: verification.reason === "invalid_token" ? "verification_failed" : "verification_unavailable",
    };
  }

  const allowed = await checkRateLimit("property-submission", 3, 3600);
  if (!allowed) return { success: false, reason: "rate_limited" };

  const data = parsed.data;

  const cities = await getCities();
  const city = cities.find((c) => c.slug === data.city);
  if (!city) return { success: false, reason: "validation_error" };

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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // IDs are generated here rather than read back from the insert (no
  // `.select()`/representation requested) because a guest submission is
  // intentionally unreadable by its own anonymous submitter under RLS
  // (`submitted_by_user_id is null` can never match `= auth.uid()`) — asking
  // PostgREST for a representation it can't return under RLS fails the
  // whole request, even though the insert's own check passed.
  const submissionId = crypto.randomUUID();
  const propertyId = crypto.randomUUID();

  const { error: submissionError } = await supabase.from("property_submissions").insert({
    id: submissionId,
    submitted_by_user_id: user?.id ?? null,
    guest_name: user ? null : data.ownerName,
    guest_phone: user ? null : data.ownerPhone,
    guest_email: user ? null : data.ownerEmail,
    status: "submitted",
  });

  if (submissionError) return { success: false, reason: "database_error" };

  const geocodeQuery = [data.addressLine, neighborhood?.name_sq, city.name_sq, "Albania"]
    .filter(Boolean)
    .join(", ");
  const coordinates = await geocodeAddress(geocodeQuery);

  const { error } = await supabase.from("properties").insert({
    id: propertyId,
    slug,
    purpose: data.purpose,
    property_type: data.propertyType,
    status: "draft",
    source: "owner_submission",
    submission_id: submissionId,
    submitted_by: user?.id ?? null,
    title_sq: titleSq,
    price: data.price,
    currency: "EUR",
    price_period: data.purpose === "rent" ? "month" : null,
    city_id: city.id,
    neighborhood_id: neighborhood?.id ?? null,
    address_line: data.addressLine || null,
    lat: coordinates?.lat ?? null,
    lng: coordinates?.lng ?? null,
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
  });

  if (error) return { success: false, reason: "database_error" };

  if (data.photos.length > 0) {
    await supabase.from("property_images").insert(
      data.photos.map((url, index) => ({
        property_id: propertyId,
        url,
        sort_order: index,
        is_cover: index === 0,
      })),
    );
  }

  const adminEmails = await getAdminEmails();
  if (adminEmails.length > 0) {
    await sendEmail({
      to: adminEmails,
      subject: `New property submission / Paraqitje e re prone: ${titleSq}`,
      html: `
        <p>A new property was submitted for review: <strong>${titleSq}</strong>.</p>
        <p>Submitted by: ${data.ownerName} (${data.ownerEmail}, ${data.ownerPhone})</p>
        <p>Price: €${data.price}</p>
        <hr />
        <p>Një pronë e re u paraqit për shqyrtim: <strong>${titleSq}</strong>.</p>
        <p>Dërguar nga: ${data.ownerName} (${data.ownerEmail}, ${data.ownerPhone})</p>
        <p>Çmimi: €${data.price}</p>
      `,
    });
  }

  return { success: true, reference: submissionId.slice(0, 8).toUpperCase() };
}
