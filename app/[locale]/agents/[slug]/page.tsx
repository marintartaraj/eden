import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Phone, MessageCircle, Mail } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { PropertyGrid } from "@/components/property/PropertyGrid";
import { getAgentBySlug } from "@/lib/data/agents";
import { getPropertiesByAgentId } from "@/lib/data/properties";
import { localize } from "@/lib/localize";
import type { AppLocale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const agent = await getAgentBySlug(slug);
  if (!agent) return {};
  return { title: agent.full_name };
}

export default async function AgentProfilePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const appLocale = locale as AppLocale;

  const agent = await getAgentBySlug(slug);
  if (!agent) notFound();

  const [t, detailT, properties] = await Promise.all([
    getTranslations("agentProfile"),
    getTranslations("detail"),
    getPropertiesByAgentId(agent.id),
  ]);

  const bio = localize(agent.bio_sq ?? "", agent.bio_en, appLocale);
  const whatsappNumber = agent.whatsapp?.replace(/[^\d]/g, "");

  return (
    <Container className="py-8 sm:py-12">
      <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:text-left">
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full bg-border">
          {agent.photo_url && (
            <Image
              src={agent.photo_url}
              alt={agent.full_name}
              fill
              sizes="112px"
              className="object-cover"
            />
          )}
        </div>
        <div className="flex-1">
          <h1 className="font-serif text-2xl text-foreground sm:text-3xl">{agent.full_name}</h1>
          {agent.title && <p className="mt-1 text-muted">{agent.title}</p>}
          {bio && <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground">{bio}</p>}

          <div className="mt-6 flex flex-wrap justify-center gap-2 sm:justify-start">
            {agent.phone && (
              <a
                href={`tel:${agent.phone}`}
                className="flex h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
              >
                <Phone className="h-4 w-4" />
                {detailT("callAgent")}
              </a>
            )}
            {whatsappNumber && (
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 items-center gap-2 rounded-full border border-border px-5 text-sm font-medium text-foreground transition-colors hover:border-accent"
              >
                <MessageCircle className="h-4 w-4" />
                {detailT("whatsapp")}
              </a>
            )}
            {agent.email && (
              <a
                href={`mailto:${agent.email}`}
                className="flex h-11 items-center gap-2 rounded-full border border-border px-5 text-sm font-medium text-foreground transition-colors hover:border-accent"
              >
                <Mail className="h-4 w-4" />
                {detailT("emailAgent")}
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="mb-6 font-serif text-xl text-foreground">
          {t("listingsTitle", { name: agent.full_name })}
        </h2>
        {properties.length > 0 ? (
          <PropertyGrid properties={properties} locale={appLocale} />
        ) : (
          <p className="text-sm text-muted">{t("noListings")}</p>
        )}
      </div>
    </Container>
  );
}
