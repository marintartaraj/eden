import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { cn, FOCUS_RING } from "@/lib/utils";

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
    <nav aria-label="Breadcrumb" className="text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />}
              {item.href ? (
                <Link href={item.href} className={cn("rounded-sm hover:text-foreground", FOCUS_RING)}>
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={isLast ? "line-clamp-1 text-foreground" : ""}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
