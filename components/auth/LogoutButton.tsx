"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { signOut } from "@/lib/actions/auth";

export function LogoutButton({
  label,
  className,
  role,
  onBeforeSignOut,
}: {
  label: string;
  className?: string;
  role?: string;
  onBeforeSignOut?: () => void;
}) {
  const common = useTranslations("common");
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    onBeforeSignOut?.();
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      role={role}
      onClick={handleLogout}
      disabled={loggingOut}
      className={className}
    >
      {loggingOut ? common("loggingOut") : label}
    </button>
  );
}
