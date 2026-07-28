import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

type SubmissionRow = Database["public"]["Tables"]["property_submissions"]["Row"];
type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];

export type SubmissionWithProperty = SubmissionRow & {
  property:
    | (Pick<PropertyRow, "id" | "slug" | "title_sq" | "title_en" | "price" | "currency"> & {
        coverImageUrl: string | null;
      })
    | null;
};

async function attachProperties(submissions: SubmissionRow[]): Promise<SubmissionWithProperty[]> {
  if (submissions.length === 0) return [];
  const supabase = await createClient();

  const { data: properties, error } = await supabase
    .from("properties")
    .select("id, slug, title_sq, title_en, price, currency, submission_id")
    .in(
      "submission_id",
      submissions.map((s) => s.id),
    );
  if (error) throw error;

  const propertyIds = (properties ?? []).map((p) => p.id);
  const images = propertyIds.length
    ? await supabase
        .from("property_images")
        .select("property_id, url, is_cover, sort_order")
        .in("property_id", propertyIds)
        .order("sort_order")
    : { data: [] as { property_id: string; url: string; is_cover: boolean }[] };

  const coverByProperty = new Map<string, string>();
  for (const img of images.data ?? []) {
    if (img.is_cover || !coverByProperty.has(img.property_id)) {
      coverByProperty.set(img.property_id, img.url);
    }
  }

  const propertyBySubmission = new Map(
    (properties ?? []).map((p) => [p.submission_id as string, p]),
  );

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
            coverImageUrl: coverByProperty.get(property.id) ?? null,
          }
        : null,
    };
  });
}

export async function getMySubmissions(): Promise<SubmissionWithProperty[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("property_submissions")
    .select("*")
    .eq("submitted_by_user_id", user.id)
    .order("submitted_at", { ascending: false });
  if (error) throw error;

  return attachProperties(data ?? []);
}

export async function getMySubmissionById(id: string): Promise<SubmissionWithProperty | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("property_submissions")
    .select("*")
    .eq("id", id)
    .eq("submitted_by_user_id", user.id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const [item] = await attachProperties([data]);
  return item;
}
