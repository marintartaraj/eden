"use client";

import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslations } from "next-intl";
import { PhotoUploadField, type UploadedPhoto } from "../PhotoUploadField";
import { pathFromPublicUrl } from "@/lib/storage-path";
import type { PropertySubmissionInput } from "@/lib/validations/property-submission";

const BUCKET = "property-images";

export function Step6Photos({ submissionId }: { submissionId: string | null }) {
  const t = useTranslations("sellProperty.step6");
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<PropertySubmissionInput>();

  // Photos live in the shared form state (just an array of public URLs) so
  // they survive step navigation like every other field. `path` is not
  // stored in the form — it's re-derived from the URL only for the
  // remove/upload UI, which needs it to target the right storage object.
  const photoUrls = useWatch({ control, name: "photos" });
  const photos = useMemo<UploadedPhoto[]>(
    () =>
      (photoUrls ?? []).map((url) => ({
        url,
        path: pathFromPublicUrl(url, BUCKET) ?? url,
      })),
    [photoUrls],
  );

  function handleChange(next: UploadedPhoto[]) {
    setValue(
      "photos",
      next.map((p) => p.url),
      { shouldValidate: true, shouldDirty: true },
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-xl text-foreground">{t("title")}</h2>
        <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
      </div>

      <PhotoUploadField photos={photos} onChange={handleChange} submissionId={submissionId} />
      {errors.photos && <p className="text-xs text-danger">{t("minPhotosError")}</p>}
    </div>
  );
}
