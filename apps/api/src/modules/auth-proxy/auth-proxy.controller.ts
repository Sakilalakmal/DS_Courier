import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthProxyService } from "./auth-proxy.service.js";
import { loginDtoSchema, registerDtoSchema } from "@courierflow/contracts";

@Controller("auth")
export class AuthProxyController {
  constructor(private readonly authProxyService: AuthProxyService) {}

  @Post("register")
  async register(@Body() payload: unknown, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const body = registerDtoSchema.parse(payload);
    return this.authProxyService.forward(req, res, "POST", "/api/auth/sign-up/email", body);
  }

  @Post("login")
  async login(@Body() payload: unknown, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const body = loginDtoSchema.parse(payload);
    return this.authProxyService.forward(req, res, "POST", "/api/auth/sign-in/email", body);
  }

  @Get("session")
  async session(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authProxyService.forward(req, res, "GET", "/api/auth/get-session");
  }
}
