import { Module } from "@nestjs/common";
import { AuthProxyController } from "./auth-proxy.controller.js";
import { AuthProxyService } from "./auth-proxy.service.js";

@Module({
  controllers: [AuthProxyController],
  providers: [AuthProxyService],
})
export class AuthProxyModule {}
