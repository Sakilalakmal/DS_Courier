import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { SignOutButton } from "@/components/auth/sign-out-button";

export default async function StaffDashboardPage() {
  const session = await requireRole(["admin", "dispatcher", "supervisor", "driver"]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-4 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Staff Dashboard</h1>
          <p className="text-sm text-slate-600">Welcome, {session.user.name}</p>
        </div>
        <SignOutButton />
      </header>

      <section className="grid gap-3 md:grid-cols-3">
        <article className="rounded border bg-white p-4">
          <p className="text-sm text-slate-500">Shipments</p>
          <p className="text-2xl font-semibold">Core API Ready</p>
        </article>
        <article className="rounded border bg-white p-4">
          <p className="text-sm text-slate-500">Auth</p>
          <p className="text-2xl font-semibold">Better Auth Active</p>
        </article>
        <article className="rounded border bg-white p-4">
          <p className="text-sm text-slate-500">RBAC</p>
          <p className="text-2xl font-semibold">Enabled</p>
        </article>
      </section>

      <nav className="flex gap-3">
        <Link href="/customer/shipments" className="rounded border px-3 py-1">
          View Customer UI
        </Link>
      </nav>
    </main>
  );
}
