"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Bookmark } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { saveSearch } from "@/lib/actions/saved-searches";
import { toSearchParams, type PropertiesQuery } from "@/lib/filters/property-filters";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function SaveSearchButton({
  basePath,
  query,
}: {
  basePath: string;
  query: PropertiesQuery;
}) {
  const t = useTranslations("savedSearches");
  const auth = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  if (!auth.user) return null;

  async function handleSave() {
    if (!name.trim()) return;
    setStatus("saving");
    const queryString = toSearchParams(query).toString();
    const result = await saveSearch(name.trim(), { basePath, queryString });
    if (result.success) {
      setStatus("saved");
      setOpen(false);
      setName("");
      setTimeout(() => setStatus("idle"), 2000);
    } else {
      setStatus("idle");
    }
  }

  if (open) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={t("namePlaceholder")}
          className="h-11 w-40"
          autoFocus
        />
        <Button type="button" size="sm" onClick={handleSave} disabled={status === "saving"}>
          {t("save")}
        </Button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="flex h-11 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium text-foreground transition-colors hover:border-accent"
    >
      <Bookmark className="h-4 w-4" />
      {status === "saved" ? t("saved") : t("saveSearch")}
    </button>
  );
}
