"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";

export function SignOutButton() {
  const router = useRouter();

  const onSignOut = async () => {
    await authClient.signOut();
    router.push("/sign-in");
    router.refresh();
  };

  return (
    <button type="button" onClick={onSignOut} className="rounded border px-3 py-1 text-sm">
      Sign Out
    </button>
  );
}
