"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SearchablePaginatedList } from "@/components/ui/SearchablePaginatedList";
import { setUserRole, setAccountStatus, deleteUserAccount } from "@/lib/actions/admin-users";
import type { AdminUser } from "@/lib/data/admin-users";
import type { Database } from "@/types/supabase";

type UserRole = Database["public"]["Enums"]["user_role"];

const ASSIGNABLE_ROLES: UserRole[] = ["registered_user", "agent", "admin"];

type PendingConfirm =
  | { kind: "role"; nextRole: UserRole }
  | { kind: "suspend" }
  | { kind: "delete" }
  | null;

function UserRow({ user, isSelf }: { user: AdminUser; isSelf: boolean }) {
  const t = useTranslations("adminUsers");
  const common = useTranslations("common");
  const router = useRouter();
  const [role, setRole] = useState<UserRole>(user.role);
  const [status, setStatus] = useState(user.account_status);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<PendingConfirm>(null);
  const [deleteError, setDeleteError] = useState(false);

  const displayName = user.full_name || user.email || "";

  async function handleRoleChange(nextRole: UserRole) {
    setBusy(true);
    const result = await setUserRole(user.id, nextRole);
    if (result.success) {
      setRole(nextRole);
      router.refresh();
    }
    setBusy(false);
    setConfirm(null);
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
    setConfirm(null);
  }

  async function handleDelete() {
    setBusy(true);
    setDeleteError(false);
    const result = await deleteUserAccount(user.id);
    if (result.success) {
      router.refresh();
    } else {
      setDeleteError(true);
      setBusy(false);
      setConfirm(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4">
      <div>
        <p className="font-medium text-foreground">{displayName}</p>
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
          onChange={(e) => setConfirm({ kind: "role", nextRole: e.target.value as UserRole })}
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
          variant={status === "active" ? "destructive" : "secondary"}
          size="sm"
          disabled={busy || isSelf}
          onClick={() => {
            // Reactivating restores access rather than removing it, so it
            // doesn't need the same confirm-before-you-lock-someone-out step.
            if (status === "active") {
              setConfirm({ kind: "suspend" });
            } else {
              void handleToggleStatus();
            }
          }}
        >
          {status === "active" ? t("suspend") : t("reactivate")}
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={busy || isSelf}
          onClick={() => setConfirm({ kind: "delete" })}
        >
          {t("deleteAccount")}
        </Button>
      </div>

      {deleteError && <p className="w-full text-xs text-danger">{t("deleteError")}</p>}

      <ConfirmDialog
        open={confirm?.kind === "suspend"}
        title={t("confirmSuspendTitle")}
        description={t("confirmSuspendBody", { name: displayName })}
        confirmLabel={t("confirmSuspendButton")}
        cancelLabel={common("cancel")}
        destructive
        pending={busy}
        onConfirm={handleToggleStatus}
        onCancel={() => setConfirm(null)}
      />

      <ConfirmDialog
        open={confirm?.kind === "role"}
        title={t("confirmRoleChangeTitle")}
        description={
          confirm?.kind === "role"
            ? t("confirmRoleChangeBody", { name: displayName, role: t(`roles.${confirm.nextRole}`) })
            : ""
        }
        confirmLabel={t("confirmRoleChangeButton")}
        cancelLabel={common("cancel")}
        destructive={confirm?.kind === "role" && confirm.nextRole === "admin"}
        pending={busy}
        onConfirm={() => confirm?.kind === "role" && handleRoleChange(confirm.nextRole)}
        onCancel={() => setConfirm(null)}
      />

      <ConfirmDialog
        open={confirm?.kind === "delete"}
        title={t("confirmDeleteTitle")}
        description={t("confirmDeleteBody", { name: displayName })}
        confirmLabel={t("confirmDeleteButton")}
        cancelLabel={common("cancel")}
        destructive
        pending={busy}
        onConfirm={handleDelete}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}

export function UserList({ users, currentUserId }: { users: AdminUser[]; currentUserId: string }) {
  const t = useTranslations("adminUsers");

  return (
    <SearchablePaginatedList
      items={users.map((user) => (
        <UserRow key={user.id} user={user} isSelf={user.id === currentUserId} />
      ))}
      searchText={users.map((user) => `${user.full_name ?? ""} ${user.email ?? ""}`)}
      searchPlaceholder={t("searchPlaceholder")}
      emptyMessage={t("empty")}
    />
  );
}
