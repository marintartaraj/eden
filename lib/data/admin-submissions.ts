import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

type SubmissionRow = Database["public"]["Tables"]["property_submissions"]["Row"];
type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
type SubmissionStatus = Database["public"]["Enums"]["submission_status"];

export type AdminSubmission = SubmissionRow & {
  property:
    | (Pick<PropertyRow, "id" | "slug" | "title_sq" | "title_en" | "price" | "currency" | "status"> & {
        images: { url: string; is_cover: boolean }[];
      })
    | null;
};

async function attachProperties(submissions: SubmissionRow[]): Promise<AdminSubmission[]> {
  if (submissions.length === 0) return [];
  const supabase = await createClient();

  const { data: properties, error } = await supabase
    .from("properties")
    .select("id, slug, title_sq, title_en, price, currency, status, submission_id")
    .in(
      "submission_id",
      submissions.map((s) => s.id),
    );
  if (error) throw error;

  const propertyIds = (properties ?? []).map((p) => p.id);
  const { data: images } = propertyIds.length
    ? await supabase
        .from("property_images")
        .select("property_id, url, is_cover")
        .in("property_id", propertyIds)
        .order("sort_order")
    : { data: [] as { property_id: string; url: string; is_cover: boolean }[] };

  const imagesByProperty = new Map<string, { url: string; is_cover: boolean }[]>();
  for (const img of images ?? []) {
    const list = imagesByProperty.get(img.property_id) ?? [];
    list.push({ url: img.url, is_cover: img.is_cover });
    imagesByProperty.set(img.property_id, list);
  }

  const propertyBySubmission = new Map((properties ?? []).map((p) => [p.submission_id as string, p]));

  return submissions.map((submission) => {
    const property = propertyBySubmission.get(submission.id);
    return {
      ...submission,
      property: property
        ? {
            id: property.id,
            slug: property.slug,
            title_sq: property.title_sq,
            title_en: property.title_en,
            price: property.price,
            currency: property.currency,
            status: property.status,
            images: imagesByProperty.get(property.id) ?? [],
          }
        : null,
    };
  });
}

export async function getAllSubmissions(statusFilter?: string): Promise<AdminSubmission[]> {
  const supabase = await createClient();
  let query = supabase
    .from("property_submissions")
    .select("*")
    .order("submitted_at", { ascending: false });
  if (statusFilter) {
    query = query.eq("status", statusFilter as SubmissionStatus);
  }
  const { data, error } = await query;
  if (error) throw error;

  return attachProperties(data ?? []);
}

export async function getSubmissionByIdForAdmin(id: string): Promise<AdminSubmission | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("property_submissions")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const [item] = await attachProperties([data]);
  return item;
}
