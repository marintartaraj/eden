"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useTranslations } from "next-intl";
import { publicEnv } from "@/lib/env";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
        },
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

const SITE_KEY = publicEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/** Whether a caller should gate its submit button on having a token yet. */
export const TURNSTILE_ENABLED = Boolean(SITE_KEY);

// Renders nothing when NEXT_PUBLIC_TURNSTILE_SITE_KEY isn't set — Turnstile
// is opt-in (see .env.local.example) so forms keep working before it's
// configured.
export function TurnstileWidget({ onVerify }: { onVerify: (token: string) => void }) {
  const t = useTranslations("common.turnstile");
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  // Keeps the rendered widget's callback pointed at the latest onVerify
  // without re-rendering (and thus duplicating) the widget every time a
  // parent re-render passes a new function reference.
  const onVerifyRef = useRef(onVerify);
  useEffect(() => {
    onVerifyRef.current = onVerify;
  });

  const [scriptState, setScriptState] = useState<"loading" | "loaded" | "blocked">("loading");

  useEffect(() => {
    if (scriptState !== "loaded") return;
    const container = containerRef.current;
    if (!container || !window.turnstile || widgetIdRef.current) return;

    widgetIdRef.current = window.turnstile.render(container, {
      sitekey: SITE_KEY!,
      callback: (token) => onVerifyRef.current(token),
      "expired-callback": () => onVerifyRef.current(""),
    });

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [scriptState]);

  if (!SITE_KEY) return null;

  return (
    <div>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        async
        defer
        onLoad={() => setScriptState("loaded")}
        onError={() => setScriptState("blocked")}
      />
      <div ref={containerRef} />
      {scriptState === "loading" && <p className="text-xs text-muted">{t("loading")}</p>}
      {scriptState === "blocked" && <p className="text-xs text-danger">{t("blocked")}</p>}
    </div>
  );
}
