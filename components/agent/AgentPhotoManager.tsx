"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2, ArrowUp, ArrowDown, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { pathFromPublicUrl } from "@/lib/storage-path";
import { cn } from "@/lib/utils";

type PropertyImage = { id: string; url: string; is_cover: boolean; sort_order: number };

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const BUCKET = "property-images";

export function AgentPhotoManager({
  propertyId,
  initialImages,
}: {
  propertyId: string;
  initialImages: PropertyImage[];
}) {
  const t = useTranslations("agentProperties.media");
  const [images, setImages] = useState(initialImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function refresh() {
    const supabase = createClient();
    const { data } = await supabase
      .from("property_images")
      .select("id, url, is_cover, sort_order")
      .eq("property_id", propertyId)
      .order("sort_order");
    setImages(data ?? []);
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);
    const supabase = createClient();
    const files = Array.from(fileList);
    setUploading(true);
    let nextOrder = images.length;

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
      const path = `agent-properties/${propertyId}/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file);
      if (uploadError) {
        setError(t("uploadError"));
        continue;
      }
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const { error: insertError } = await supabase.from("property_images").insert({
        property_id: propertyId,
        url: data.publicUrl,
        sort_order: nextOrder,
        is_cover: nextOrder === 0 && images.length === 0,
      });
      if (insertError) setError(t("uploadError"));
      nextOrder += 1;
    }

    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
    await refresh();
  }

  async function handleRemove(image: PropertyImage) {
    const supabase = createClient();
    const path = pathFromPublicUrl(image.url, BUCKET);
    await supabase.from("property_images").delete().eq("id", image.id);
    if (path) await supabase.storage.from(BUCKET).remove([path]);
    await refresh();
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const supabase = createClient();
    const a = images[index];
    const b = images[targetIndex];
    await Promise.all([
      supabase.from("property_images").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("property_images").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    await refresh();
  }

  async function handleSetCover(image: PropertyImage) {
    const supabase = createClient();
    await supabase.from("property_images").update({ is_cover: false }).eq("property_id", propertyId);
    await supabase.from("property_images").update({ is_cover: true }).eq("id", image.id);
    await refresh();
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
      </label>

      {error && <p className="text-xs text-danger">{error}</p>}

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((image, index) => (
            <div key={image.id} className="relative aspect-square overflow-hidden rounded-xl bg-border">
              <Image src={image.url} alt="" fill sizes="200px" className="object-cover" />
              {image.is_cover && (
                <span className="absolute left-1 top-1 rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-accent-foreground">
                  {t("cover")}
                </span>
              )}
              <div className="absolute right-1 top-1 flex gap-1">
                <button
                  type="button"
                  onClick={() => handleRemove(image)}
                  aria-label={t("remove")}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="absolute bottom-1 left-1 flex gap-1">
                <button
                  type="button"
                  onClick={() => handleMove(index, -1)}
                  disabled={index === 0}
                  aria-label={t("moveUp")}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white disabled:opacity-40"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(index, 1)}
                  disabled={index === images.length - 1}
                  aria-label={t("moveDown")}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white disabled:opacity-40"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                {!image.is_cover && (
                  <button
                    type="button"
                    onClick={() => handleSetCover(image)}
                    aria-label={t("setCover")}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
