"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import {
  adminAgentSchema,
  type AdminAgentInput,
  type AdminAgentOutput,
} from "@/lib/validations/admin-agent";
import { createAgent, updateAgent, linkAgentProfile, unlinkAgentProfile } from "@/lib/actions/admin-agents";
import type { AdminAgent } from "@/lib/data/admin-agents";
import type { AdminUser } from "@/lib/data/admin-users";

export function AgentDirectoryForm({ agent, users }: { agent?: AdminAgent; users: AdminUser[] }) {
  const t = useTranslations("adminAgents");
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [profileId, setProfileId] = useState(agent?.profile_id ?? "");
  const [linking, setLinking] = useState(false);
  const submittingRef = useRef(false);

  const isEdit = Boolean(agent);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminAgentInput, unknown, AdminAgentOutput>({
    resolver: zodResolver(adminAgentSchema),
    defaultValues: agent
      ? {
          fullName: agent.full_name,
          titleSq: agent.title_sq ?? undefined,
          titleEn: agent.title_en ?? undefined,
          bioSq: agent.bio_sq ?? undefined,
          bioEn: agent.bio_en ?? undefined,
          phone: agent.phone ?? undefined,
          whatsapp: agent.whatsapp ?? undefined,
          email: agent.email ?? undefined,
          photoUrl: agent.photo_url ?? undefined,
          licenseNo: agent.license_no ?? undefined,
        }
      : undefined,
  });

  async function onSubmit(values: AdminAgentOutput) {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setErrorMessage(null);

    try {
      if (isEdit) {
        const result = await updateAgent(agent!.id, values);
        if (!result.success) {
          setErrorMessage(t("error"));
          return;
        }
        router.refresh();
        return;
      }

      const result = await createAgent(values);
      if (!result.success) {
        setErrorMessage(t("error"));
        return;
      }
      router.push(`/admin/agents/${result.agentId}`);
      router.refresh();
    } finally {
      submittingRef.current = false;
    }
  }

  async function handleLinkChange(nextProfileId: string) {
    if (!agent) return;
    setLinking(true);
    setProfileId(nextProfileId);
    if (nextProfileId) {
      await linkAgentProfile(agent.id, nextProfileId);
    } else {
      await unlinkAgentProfile(agent.id);
    }
    setLinking(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-8">
      {isEdit && (
        <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-serif text-lg text-foreground">{t("linkProfileTitle")}</h2>
          <Select value={profileId} onChange={(e) => handleLinkChange(e.target.value)} disabled={linking}>
            <option value="">{t("unlinked")}</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.full_name || u.email}
              </option>
            ))}
          </Select>
        </section>
      )}

      {/* eslint-disable-next-line react-hooks/refs -- onSubmit reads/writes
          submittingRef.current inside its own body (an event-handler
          context, not render); the rule can't see into react-hook-form's
          handleSubmit to confirm it doesn't invoke the callback
          synchronously during render, which it never does in practice. */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
        <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">{t("fullName")}</label>
            <Input {...register("fullName")} />
            {errors.fullName && <p className="mt-1 text-xs text-danger">{t("requiredError")}</p>}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">{t("titleSq")}</label>
              <Input {...register("titleSq")} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">{t("titleEn")}</label>
              <Input {...register("titleEn")} />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">{t("bioSq")}</label>
            <textarea
              {...register("bioSq")}
              rows={3}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">{t("bioEn")}</label>
            <textarea
              {...register("bioEn")}
              rows={3}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">{t("phone")}</label>
              <Input {...register("phone")} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">{t("whatsapp")}</label>
              <Input {...register("whatsapp")} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">{t("email")}</label>
              <Input {...register("email")} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">{t("licenseNo")}</label>
              <Input {...register("licenseNo")} />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">{t("photoUrl")}</label>
            <Input {...register("photoUrl")} />
          </div>
        </section>

        {errorMessage && <p className="text-sm text-danger">{errorMessage}</p>}

        <Button type="submit" disabled={isSubmitting} className="self-start">
          {isSubmitting ? t("saving") : isEdit ? t("saveChanges") : t("createAgent")}
        </Button>
      </form>
    </div>
  );
}
