import { Reflector } from "@nestjs/core";
import { RolesGuard } from "@/common/auth/roles.guard.js";

describe("RolesGuard", () => {
  it("allows when no roles metadata is set", () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(undefined),
    } as unknown as Reflector;

    const guard = new RolesGuard(reflector);
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user: { role: "customer" } }),
      }),
    } as any;

    expect(guard.canActivate(context)).toBe(true);
  });

  it("denies when role does not match", () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(["admin"]),
    } as unknown as Reflector;

    const guard = new RolesGuard(reflector);
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user: { role: "customer" } }),
      }),
    } as any;

    expect(guard.canActivate(context)).toBe(false);
  });
});
