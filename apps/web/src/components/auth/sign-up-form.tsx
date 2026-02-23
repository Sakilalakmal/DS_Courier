"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";

export function SignUpForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const response = await authClient.signUp.email({
      name,
      email,
      password,
    });

    setLoading(false);

    if (response.error) {
      setError(response.error.message ?? "Sign up failed");
      return;
    }

    router.push("/customer/shipments");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-md flex-col gap-4 rounded-lg border bg-white p-6">
      <h1 className="text-xl font-semibold">Sign Up</h1>
      <label className="flex flex-col gap-1">
        <span>Name</span>
        <input
          className="rounded border px-3 py-2"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </label>
      <label className="flex flex-col gap-1">
        <span>Email</span>
        <input
          className="rounded border px-3 py-2"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>
      <label className="flex flex-col gap-1">
        <span>Password</span>
        <input
          className="rounded border px-3 py-2"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-60" type="submit" disabled={loading}>
        {loading ? "Creating account..." : "Sign Up"}
      </button>
    </form>
  );
}
