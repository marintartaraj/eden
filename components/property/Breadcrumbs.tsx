import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export async function Breadcrumbs({
  cityName,
  title,
}: {
  cityName: string | null;
  title: string;
}) {
  const t = await getTranslations("nav");

  const items: { href?: string; label: string }[] = [
    { href: "/", label: t("home") },
    { href: "/properties", label: t("properties") },
    ...(cityName ? [{ label: cityName }] : []),
    { label: title },
  ];

  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-muted">
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1">
          {index > 0 && <ChevronRight className="h-3.5 w-3.5" />}
          {item.href ? (
            <Link href={item.href} className="hover:text-foreground">
              {item.label}
            </Link>
          ) : (
            <span className={index === items.length - 1 ? "line-clamp-1 text-foreground" : ""}>
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
