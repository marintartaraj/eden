"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn, FOCUS_RING } from "@/lib/utils";

const DIALOG_ID = "property-gallery-lightbox";

export function Gallery({
  images,
  title,
}: {
  images: { url: string }[];
  title: string;
}) {
  const t = useTranslations("detail.gallery");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const open = lightboxIndex !== null;

  function openLightbox(index: number, event: React.MouseEvent<HTMLButtonElement>) {
    triggerRef.current = event.currentTarget;
    setLightboxIndex(index);
  }

  // Focus is moved back to the triggering thumbnail here — synchronously,
  // before the state update — rather than from an effect cleanup. The DOM
  // node that currently has focus (inside the portal) is about to unmount;
  // browsers move focus to <body> the instant a focused element is removed,
  // and by the time a cleanup callback runs that's already happened. Same
  // pattern as MobileNav's closeMenu().
  function closeLightbox() {
    triggerRef.current?.focus();
    setLightboxIndex(null);
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
        closeLightbox();
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setLightboxIndex((i) => (i === null ? 0 : (i - 1 + images.length) % images.length));
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setLightboxIndex((i) => (i === null ? 0 : (i + 1) % images.length));
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
  }, [open, images.length]);

  if (images.length === 0) {
    return <div className="aspect-[16/9] w-full rounded-2xl bg-border" />;
  }

  const main = images[0];
  const thumbs = images.slice(1, 5);

  return (
    <>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:grid-rows-2">
        <button
          type="button"
          onClick={(event) => openLightbox(0, event)}
          className={cn(
            "relative col-span-1 row-span-2 aspect-[4/3] overflow-hidden rounded-2xl bg-border sm:col-span-2 sm:aspect-auto",
            FOCUS_RING,
          )}
        >
          <Image
            src={main.url}
            alt={title}
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            priority
            className="object-cover"
          />
        </button>
        {thumbs.map((image, index) => (
          <button
            key={image.url}
            type="button"
            onClick={(event) => openLightbox(index + 1, event)}
            className={cn(
              "relative hidden aspect-square overflow-hidden rounded-2xl bg-border sm:block",
              FOCUS_RING,
            )}
          >
            <Image src={image.url} alt={title} fill sizes="25vw" className="object-cover" />
            {index === 3 && images.length > 5 && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-medium text-white">
                +{images.length - 5}
              </span>
            )}
          </button>
        ))}
      </div>

      {open &&
        lightboxIndex !== null &&
        createPortal(
          <div
            id={DIALOG_ID}
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={t("dialogLabel", { title })}
            className="fixed inset-0 z-50 flex flex-col bg-black/95"
          >
            <button
              type="button"
              onClick={closeLightbox}
              aria-label={t("close")}
              className={cn(
                "absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white",
                FOCUS_RING,
              )}
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative flex-1">
              <Image
                src={images[lightboxIndex].url}
                alt={title}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setLightboxIndex((i) => (i === null ? 0 : (i - 1 + images.length) % images.length))
                  }
                  aria-label={t("previous")}
                  className={cn(
                    "absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white",
                    FOCUS_RING,
                  )}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxIndex((i) => (i === null ? 0 : (i + 1) % images.length))}
                  aria-label={t("next")}
                  className={cn(
                    "absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white",
                    FOCUS_RING,
                  )}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
            <div aria-live="polite" className="flex justify-center gap-1 p-4 text-sm text-white/70">
              {t("imageCounter", { current: lightboxIndex + 1, total: images.length })}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
