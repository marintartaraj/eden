"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export type UploadedPhoto = { url: string; path: string };

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function PhotoUploadField({
  photos,
  onChange,
  submissionId,
}: {
  photos: UploadedPhoto[];
  onChange: (photos: UploadedPhoto[]) => void;
  submissionId: string;
}) {
  const t = useTranslations("sellProperty.step6");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);
    const supabase = createClient();
    const files = Array.from(fileList);

    setUploading(true);
    const uploaded: UploadedPhoto[] = [];
    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError(t("invalidType"));
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(t("tooLarge"));
        continue;
      }
      const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "-");
      const path = `owner-submissions/${submissionId}/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from("property-images")
        .upload(path, file);
      if (uploadError) {
        setError(t("uploadError"));
        continue;
      }
      const { data } = supabase.storage.from("property-images").getPublicUrl(path);
      uploaded.push({ url: data.publicUrl, path });
    }
    setUploading(false);
    if (uploaded.length > 0) onChange([...photos, ...uploaded]);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleRemove(photo: UploadedPhoto) {
    const supabase = createClient();
    await supabase.storage.from("property-images").remove([photo.path]);
    onChange(photos.filter((p) => p.path !== photo.path));
  }

  return (
    <div className="flex flex-col gap-4">
      <label
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-card px-6 py-10 text-center transition-colors hover:border-accent",
          uploading && "pointer-events-none opacity-60",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(",")}
          onChange={(event) => handleFiles(event.target.files)}
          className="sr-only"
          disabled={uploading}
        />
        {uploading ? (
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
        ) : (
          <Upload className="h-6 w-6 text-accent" />
        )}
        <span className="text-sm font-medium text-foreground">{t("uploadCta")}</span>
        <span className="text-xs text-muted">{t("uploadHint")}</span>
      </label>

      {error && <p className="text-xs text-danger">{error}</p>}

      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {photos.map((photo) => (
            <div key={photo.path} className="relative aspect-square overflow-hidden rounded-xl bg-border">
              <Image src={photo.url} alt="" fill sizes="200px" className="object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(photo)}
                aria-label={t("remove")}
                className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
