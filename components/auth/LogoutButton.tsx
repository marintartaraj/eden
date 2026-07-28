"use client";

import { useRouter } from "@/i18n/navigation";
import { signOut } from "@/lib/actions/auth";

export function LogoutButton({
  label,
  className,
  onBeforeSignOut,
}: {
  label: string;
  className?: string;
  onBeforeSignOut?: () => void;
}) {
  const router = useRouter();

  async function handleLogout() {
    onBeforeSignOut?.();
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button type="button" onClick={handleLogout} className={className}>
      {label}
    </button>
  );
}
