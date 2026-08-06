"use client";

import { useEffect, useId, useRef, useState } from "react";
import { User } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { LogoutButton } from "@/components/auth/LogoutButton";

type NavLink = { href: string; label: string };

/**
 * Collapses the account/role links (My Account, Admin Dashboard, Agent
 * Dashboard, Log Out) that used to sit as flat top-level items in the
 * header into a single dropdown. Flat items were the reason the header
 * nav wrapped onto two lines for admin/agent accounts (more top-level
 * items than the row had room for, even at 1920px) — collapsing the
 * role-specific links here keeps the header's item count constant
 * regardless of role.
 */
export function AccountMenu({
  menuLabel,
  links,
  logoutLabel,
}: {
  menuLabel: string;
  links: NavLink[];
  logoutLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={menuLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-border/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <User className="h-4 w-4" />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 whitespace-nowrap rounded-xl border border-border bg-card p-1 shadow-lg"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-foreground hover:bg-border/30"
            >
              {link.label}
            </Link>
          ))}
          <LogoutButton
            label={logoutLabel}
            role="menuitem"
            onBeforeSignOut={() => setOpen(false)}
            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-border/30"
          />
        </div>
      )}
    </div>
  );
}
