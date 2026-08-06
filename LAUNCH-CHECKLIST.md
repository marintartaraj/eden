# Eden — Pre-Launch Checklist (Your To-Dos)

Items that need you specifically — payment, real content, or account access I don't have. Last updated 2026-08-01.

1. **Buy a domain** — payment + choice, needed for hosting and real email deliverability.

2. **Legal content (Privacy/Terms)** — currently placeholder. Provide real business details (legal entity name, registered address, any registration number) and I'll write the actual policy text.

3. **Review all other static/marketing copy** (About page, agent bios, etc.) for accuracy — flag anything that's still placeholder/demo content.

4. **Upgrade Supabase to a paid plan** — free plan currently has zero backups. Needed before real customer data goes in.

5. **Set up hosting** — Vercel project, production environment variables, connecting your domain. Needs your Vercel account access.

6. **Real screen-reader testing** (NVDA/JAWS/VoiceOver) — automated scanning already passed (0 issues), but a human should verify with real assistive tech before launch.

7. **Real device testing** — an actual iPhone/Android in hand, not just emulated browsers.

8. **Once you have a domain**: verify it with Resend (DNS records at your registrar), register it with Cloudflare Turnstile, point it at Vercel. I can guide each step, but the actual dashboard actions are in accounts only you can access.

9. **Add real property listings** — the add-listing flow is fixed and working. Sourcing/entering real inventory is on you, though I can help with bulk import if you hand me structured data.

10. **True legal compliance sign-off** — I can flag technical gaps, but I'm not a lawyer. If this will handle real customer data at scale, worth commissioning an independent legal/security review.

---

For reference, things I can do myself whenever you're ready (no account/payment needed): live-verify the destructive confirmation dialogs, run a real load/stress test, re-run the cross-browser e2e suite clean, a technical GDPR readiness pass, and a second independent-style automated code review.
