"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { cn, FOCUS_RING } from "@/lib/utils";

type NavLink = { href: string; label: string };

export function HeaderNavLinks({ links }: { links: NavLink[] }) {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-6 lg:flex">
      {links.map((link) => {
        const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "whitespace-nowrap rounded-sm text-sm font-medium transition-colors hover:text-foreground",
              FOCUS_RING,
              active ? "text-foreground" : "text-muted",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
