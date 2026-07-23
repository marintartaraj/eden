import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { localize } from "@/lib/localize";
import type { AppLocale } from "@/i18n/routing";
import type { Database } from "@/types/supabase";

type AgentRow = Database["public"]["Tables"]["agents"]["Row"];

export async function AgentCard({ agent }: { agent: AgentRow }) {
  const [t, locale] = await Promise.all([getTranslations("home"), getLocale()]);
  const title = localize(agent.title_sq ?? "", agent.title_en, locale as AppLocale);

  return (
    <Link
      href={`/agents/${agent.slug}`}
      className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center transition-shadow hover:shadow-lg"
    >
      <div className="relative h-24 w-24 overflow-hidden rounded-full bg-border">
        {agent.photo_url && (
          <Image src={agent.photo_url} alt={agent.full_name} fill sizes="96px" className="object-cover" />
        )}
      </div>
      <div>
        <p className="font-serif text-base text-foreground">{agent.full_name}</p>
        {title && <p className="text-sm text-muted">{title}</p>}
      </div>
      <span className="text-sm font-medium text-accent group-hover:opacity-80">{t("viewProfile")}</span>
    </Link>
  );
}
