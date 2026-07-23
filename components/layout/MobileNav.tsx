"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "@/i18n/navigation";

type NavLink = { href: string; label: string };

export function MobileNav({
  links,
  sellLabel,
  closeLabel,
}: {
  links: NavLink[];
  sellLabel: string;
  closeLabel: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={closeLabel}
        className="p-2 text-foreground"
      >
        <Menu className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-background">
          <div className="flex h-16 items-center justify-between border-b border-border px-4">
            <span className="font-serif text-xl font-semibold text-foreground">
              Eden
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={closeLabel}
              className="p-2 text-foreground"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex flex-col gap-1 p-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-border/40"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/sell-property"
              onClick={() => setOpen(false)}
              className="mt-3 rounded-full bg-accent px-4 py-3 text-center text-sm font-medium text-accent-foreground"
            >
              {sellLabel}
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
