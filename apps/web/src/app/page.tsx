import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { SignOutButton } from "@/components/auth/sign-out-button";

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-8">
      <h1 className="text-3xl font-bold">CourierFlow</h1>
      <p className="text-slate-600">Phase 0 + Phase 1 foundation running on Next.js, Better Auth, NestJS, Prisma, and SQL Server.</p>

      <div className="flex flex-wrap gap-3">
        <Link className="rounded bg-slate-900 px-4 py-2 text-white" href="/sign-in">
          Sign In
        </Link>
        <Link className="rounded border px-4 py-2" href="/sign-up">
          Sign Up
        </Link>
        <Link className="rounded border px-4 py-2" href="/customer/shipments">
          Customer Shipments
        </Link>
        <Link className="rounded border px-4 py-2" href="/staff/dashboard">
          Staff Dashboard
        </Link>
      </div>

      {session ? (
        <div className="rounded border p-4">
          <p className="text-sm">Signed in as {session.user.email}</p>
          <SignOutButton />
        </div>
      ) : null}
    </main>
  );
}
