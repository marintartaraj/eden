"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2, FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { pathFromPublicUrl } from "@/lib/storage-path";
import { cn } from "@/lib/utils";

type FloorPlan = { id: string; url: string; label: string | null };

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const BUCKET = "property-floor-plans";

export function AgentFloorPlanManager({
  propertyId,
  initialPlans,
}: {
  propertyId: string;
  initialPlans: FloorPlan[];
}) {
  const t = useTranslations("agentProperties.media");
  const [plans, setPlans] = useState(initialPlans);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function refresh() {
    const supabase = createClient();
    const { data } = await supabase
      .from("property_floor_plans")
      .select("id, url, label")
      .eq("property_id", propertyId);
    setPlans(data ?? []);
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);
    const supabase = createClient();
    const files = Array.from(fileList);
    setUploading(true);

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
      const { error: insertError } = await supabase.from("property_floor_plans").insert({
        property_id: propertyId,
        url: data.publicUrl,
        label: file.name,
      });
      if (insertError) setError(t("uploadError"));
    }

    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
    await refresh();
  }

  async function handleRemove(plan: FloorPlan) {
    const supabase = createClient();
    const path = pathFromPublicUrl(plan.url, BUCKET);
    await supabase.from("property_floor_plans").delete().eq("id", plan.id);
    if (path) await supabase.storage.from(BUCKET).remove([path]);
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
        <span className="text-sm font-medium text-foreground">{t("uploadFloorPlanCta")}</span>
      </label>

      {error && <p className="text-xs text-danger">{error}</p>}

      {plans.length > 0 && (
        <div className="flex flex-col gap-2">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3"
            >
              <a
                href={plan.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm text-foreground hover:underline"
              >
                <FileText className="h-4 w-4" />
                {plan.label ?? plan.url}
              </a>
              <button
                type="button"
                onClick={() => handleRemove(plan)}
                aria-label={t("remove")}
                className="text-muted transition-colors hover:text-danger"
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
