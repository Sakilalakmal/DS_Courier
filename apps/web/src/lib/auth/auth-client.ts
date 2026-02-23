import { createAuthClient } from "better-auth/react";
import { adminClient, jwtClient } from "better-auth/client/plugins";

const appBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL: `${appBaseUrl}/api/auth`,
  plugins: [adminClient(), jwtClient()],
});
