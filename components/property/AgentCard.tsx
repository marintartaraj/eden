import Image from "next/image";
import { Phone, MessageCircle, Mail } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { localize } from "@/lib/localize";
import type { AppLocale } from "@/i18n/routing";
import type { PropertyDetail } from "@/lib/data/properties";

export async function AgentCard({ agent }: { agent: NonNullable<PropertyDetail["agent"]> }) {
  const [t, locale] = await Promise.all([getTranslations("detail"), getLocale()]);
  const title = localize(agent.title_sq ?? "", agent.title_en, locale as AppLocale);
  const whatsappNumber = agent.whatsapp?.replace(/[^\d]/g, "");

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
      <Link href={`/agents/${agent.slug}`} className="flex items-center gap-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-border">
          {agent.photo_url && (
            <Image src={agent.photo_url} alt={agent.full_name} fill sizes="56px" className="object-cover" />
          )}
        </div>
        <div>
          <p className="font-serif text-base text-foreground">{agent.full_name}</p>
          {title && <p className="text-sm text-muted">{title}</p>}
        </div>
      </Link>

      <div className="flex flex-col gap-2">
        {agent.phone && (
          <a
            href={`tel:${agent.phone}`}
            className="flex h-11 items-center justify-center gap-2 rounded-full bg-accent text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            <Phone className="h-4 w-4" />
            {t("callAgent")}
          </a>
        )}
        {whatsappNumber && (
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 items-center justify-center gap-2 rounded-full border border-border text-sm font-medium text-foreground transition-colors hover:border-accent"
          >
            <MessageCircle className="h-4 w-4" />
            {t("whatsapp")}
          </a>
        )}
        {agent.email && (
          <a
            href={`mailto:${agent.email}`}
            className="flex h-11 items-center justify-center gap-2 rounded-full border border-border text-sm font-medium text-foreground transition-colors hover:border-accent"
          >
            <Mail className="h-4 w-4" />
            {t("emailAgent")}
          </a>
        )}
      </div>
    </div>
  );
}
