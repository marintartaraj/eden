"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { LogoutButton } from "@/components/auth/LogoutButton";

type NavLink = { href: string; label: string };

const PANEL_ID = "mobile-nav-panel";

export function MobileNav({
  links,
  authLinks,
  isLoggedIn,
  sellLabel,
  logoutLabel,
  menuLabel,
  closeLabel,
}: {
  links: NavLink[];
  authLinks: NavLink[];
  isLoggedIn: boolean;
  sellLabel: string;
  logoutLabel: string;
  menuLabel: string;
  closeLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Focus is moved back to the trigger here — synchronously, before React
  // even processes the state update — rather than from the effect cleanup
  // below. The DOM node that currently has focus (inside the panel) is
  // about to be unmounted; browsers move focus to <body> the instant a
  // focused element is removed, and by the time a cleanup callback runs
  // that has already happened, so restoring focus has to happen first.
  function closeMenu() {
    triggerRef.current?.focus();
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    if (!panel) return;

    const getFocusable = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );

    getFocusable()[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = getFocusable();
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={menuLabel}
        aria-expanded={open}
        aria-controls={PANEL_ID}
        className="p-2 text-foreground"
      >
        <Menu className="h-6 w-6" />
      </button>

      {open
        ? createPortal(
            <div
              id={PANEL_ID}
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label={menuLabel}
              className="fixed inset-0 z-50 flex flex-col bg-background pt-[env(safe-area-inset-top)]"
            >
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
                <span className="font-serif text-xl font-semibold text-foreground">
                  Eden
                </span>
                <button
                  type="button"
                  onClick={closeMenu}
                  aria-label={closeLabel}
                  className="p-2 text-foreground"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className="rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-border/40"
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="my-2 border-t border-border" />

                {authLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className="rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-border/40"
                  >
                    {link.label}
                  </Link>
                ))}
                {isLoggedIn && (
                  <LogoutButton
                    label={logoutLabel}
                    onBeforeSignOut={closeMenu}
                    className="rounded-lg px-3 py-3 text-left text-base font-medium text-foreground hover:bg-border/40"
                  />
                )}

                <Link
                  href="/sell-property"
                  onClick={closeMenu}
                  className="mt-3 rounded-full bg-accent px-4 py-3 text-center text-sm font-medium text-accent-foreground"
                >
                  {sellLabel}
                </Link>
              </nav>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
