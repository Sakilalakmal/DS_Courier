import Link from "next/link";
import { SignInForm } from "@/components/auth/sign-in-form";

export default function SignInPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 p-6">
      <Link href="/" className="text-sm text-blue-600">
        Back home
      </Link>
      <SignInForm />
    </main>
  );
}
