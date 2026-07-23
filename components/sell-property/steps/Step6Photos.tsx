"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { PhotoUploadField, type UploadedPhoto } from "../PhotoUploadField";
import type { PropertySubmissionInput } from "@/lib/validations/property-submission";

export function Step6Photos({ submissionId }: { submissionId: string }) {
  const t = useTranslations("sellProperty.step6");
  const {
    setValue,
    formState: { errors },
  } = useFormContext<PropertySubmissionInput>();
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);

  function handleChange(next: UploadedPhoto[]) {
    setPhotos(next);
    setValue(
      "photos",
      next.map((p) => p.url),
      { shouldValidate: true },
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
