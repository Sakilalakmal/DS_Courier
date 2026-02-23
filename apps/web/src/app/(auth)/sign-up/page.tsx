import Link from "next/link";
import { SignUpForm } from "@/components/auth/sign-up-form";

export default function SignUpPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 p-6">
      <Link href="/" className="text-sm text-blue-600">
        Back home
      </Link>
      <SignUpForm />
    </main>
  );
}
