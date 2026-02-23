import { authClient } from "@/lib/auth/auth-client";

const appUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const backendUrl = appUrl.includes(":3000") ? appUrl.replace(":3000", ":4000") : appUrl;

async function getToken() {
  const tokenResponse = await authClient.token();

  if (tokenResponse.error || !tokenResponse.data?.token) {
    throw new Error(tokenResponse.error?.message ?? "Unable to get JWT token");
  }

  return tokenResponse.data.token;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getToken();

  const response = await fetch(`${backendUrl}/api${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message ?? "API request failed");
  }

  return data as T;
}

export async function publicApiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${backendUrl}/api${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message ?? "API request failed");
  }

  return data as T;
}
