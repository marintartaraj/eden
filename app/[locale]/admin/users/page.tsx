import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { AdminNav } from "@/components/admin/AdminNav";
import { UserList } from "@/components/admin/UserList";
import { getAllUsers } from "@/lib/data/admin-users";
import { getCurrentUser } from "@/lib/auth/session";

export default async function AdminUsersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, users, current] = await Promise.all([
    getTranslations("adminUsers"),
    getAllUsers(),
    getCurrentUser(),
  ]);

  return (
    <Container className="py-8 sm:py-12">
      <h1 className="font-serif text-2xl text-foreground sm:text-3xl">{t("title")}</h1>
      <AdminNav />
      <div className="mt-8">
        <UserList users={users} currentUserId={current!.user.id} />
      </div>
    </Container>
  );
}
