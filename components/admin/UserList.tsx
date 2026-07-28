"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { setUserRole, setAccountStatus } from "@/lib/actions/admin-users";
import type { AdminUser } from "@/lib/data/admin-users";
import type { Database } from "@/types/supabase";

type UserRole = Database["public"]["Enums"]["user_role"];

const ASSIGNABLE_ROLES: UserRole[] = ["registered_user", "agent", "admin"];

function UserRow({ user, isSelf }: { user: AdminUser; isSelf: boolean }) {
  const t = useTranslations("adminUsers");
  const router = useRouter();
  const [role, setRole] = useState<UserRole>(user.role);
  const [status, setStatus] = useState(user.account_status);
  const [busy, setBusy] = useState(false);

  async function handleRoleChange(nextRole: UserRole) {
    setBusy(true);
    const result = await setUserRole(user.id, nextRole);
    if (result.success) {
      setRole(nextRole);
      router.refresh();
    }
    setBusy(false);
  }

  async function handleToggleStatus() {
    const next = status === "active" ? "suspended" : "active";
    setBusy(true);
    const result = await setAccountStatus(user.id, next);
    if (result.success) {
      setStatus(next);
      router.refresh();
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4">
      <div>
        <p className="font-medium text-foreground">{user.full_name || user.email}</p>
        <p className="text-sm text-muted">{user.email}</p>
      </div>
      <div className="flex items-center gap-3">
        {status === "suspended" && (
          <span className="rounded-full bg-danger/10 px-3 py-1 text-xs font-medium text-danger">
            {t("suspended")}
          </span>
        )}
        <Select
          value={role}
          onChange={(e) => handleRoleChange(e.target.value as UserRole)}
          disabled={busy || isSelf}
          className="w-auto"
        >
          {ASSIGNABLE_ROLES.map((r) => (
            <option key={r} value={r}>
              {t(`roles.${r}`)}
            </option>
          ))}
          {!ASSIGNABLE_ROLES.includes(role) && <option value={role}>{role}</option>}
        </Select>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={busy || isSelf}
          onClick={handleToggleStatus}
        >
          {status === "active" ? t("suspend") : t("reactivate")}
        </Button>
      </div>
    </div>
  );
}

export function UserList({ users, currentUserId }: { users: AdminUser[]; currentUserId: string }) {
  const t = useTranslations("adminUsers");

  if (users.length === 0) {
    return <p className="text-sm text-muted">{t("empty")}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {users.map((user) => (
        <UserRow key={user.id} user={user} isSelf={user.id === currentUserId} />
      ))}
    </div>
  );
}
