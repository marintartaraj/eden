"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
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
    };
  }
}

const SITE_KEY = publicEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

// Renders nothing when NEXT_PUBLIC_TURNSTILE_SITE_KEY isn't set — Turnstile
// is opt-in (see .env.local.example) so forms keep working before it's
// configured.
export function TurnstileWidget({ onVerify }: { onVerify: (token: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (!SITE_KEY || !scriptLoaded || !containerRef.current || !window.turnstile) return;
    window.turnstile.render(containerRef.current, {
      sitekey: SITE_KEY,
      callback: onVerify,
      "expired-callback": () => onVerify(""),
    });
  }, [scriptLoaded, onVerify]);

  if (!SITE_KEY) return null;

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        async
        defer
        onLoad={() => setScriptLoaded(true)}
      />
      <div ref={containerRef} />
    </>
  );
}
