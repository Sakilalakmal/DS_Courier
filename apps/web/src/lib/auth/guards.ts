import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { UserRole } from "@courierflow/contracts";
import { auth } from "@/lib/auth/auth";

const staffRoles: UserRole[] = ["admin", "dispatcher", "supervisor", "driver"];

export async function requireSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return session;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const session = await requireSession();
  const role = (session.user as { role?: string }).role as UserRole | undefined;

  if (!role || !allowedRoles.includes(role)) {
    if (staffRoles.includes(role as UserRole)) {
      redirect("/staff/dashboard");
    }

    redirect("/customer/shipments");
  }

  return session;
}
