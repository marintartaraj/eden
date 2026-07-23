import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Database } from "@/types/supabase";

type AgentRow = Database["public"]["Tables"]["agents"]["Row"];

export async function AgentCard({ agent }: { agent: AgentRow }) {
  const t = await getTranslations("home");

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
        {agent.title && <p className="text-sm text-muted">{agent.title}</p>}
      </div>
      <span className="text-sm font-medium text-accent group-hover:opacity-80">{t("viewProfile")}</span>
    </Link>
  );
}
