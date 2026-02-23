import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";

export type AuthUser = {
  sub: string;
  role: string;
  email?: string;
};

type RequestWithUser = Request & { user?: AuthUser };

@Injectable()
export class JwtGuard implements CanActivate {
  private jwksResolver: unknown;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing bearer token");
    }

    const token = authHeader.replace("Bearer ", "").trim();

    try {
      const { createRemoteJWKSet, jwtVerify } = await import("jose");
      if (!this.jwksResolver) {
        this.jwksResolver = createRemoteJWKSet(
          new URL(`${process.env.BETTER_AUTH_URL ?? "http://localhost:3000"}/api/auth/jwks`),
        );
      }

      const { payload } = await jwtVerify(token, this.jwksResolver as Parameters<typeof jwtVerify>[1]);
      request.user = this.mapPayload(payload);
      return true;
    } catch {
      throw new UnauthorizedException("Invalid token");
    }
  }

  private mapPayload(payload: Record<string, unknown>): AuthUser {
    const sub = typeof payload.sub === "string" ? payload.sub : "";
    const roleFromPayload =
      typeof payload.role === "string"
        ? payload.role
        : typeof payload.userRole === "string"
          ? payload.userRole
          : "customer";

    return {
      sub,
      role: roleFromPayload,
      email: typeof payload.email === "string" ? payload.email : undefined,
    };
  }
}
