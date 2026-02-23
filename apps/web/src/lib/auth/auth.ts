import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { toNextJsHandler } from "better-auth/next-js";
import { admin, jwt } from "better-auth/plugins";
import { adminAc, defaultAc, userAc } from "better-auth/plugins/admin/access";
import { prisma } from "@/lib/prisma";

const authSecret = process.env.BETTER_AUTH_SECRET || "courierflow-dev-secret-change-in-env";

export const auth = betterAuth({
  secret: authSecret,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: ["http://localhost:3000", "http://localhost:4000"],
  database: prismaAdapter(prisma, {
    provider: "sqlserver",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    admin({
      defaultRole: "customer",
      adminRoles: ["admin", "supervisor"],
      roles: {
        admin: adminAc,
        supervisor: adminAc,
        dispatcher: defaultAc.newRole({
          user: ["list", "get"],
          session: ["list"],
        }),
        driver: userAc,
        customer: userAc,
      },
    }),
    jwt(),
  ],
});

export const authHandler = toNextJsHandler(auth);
