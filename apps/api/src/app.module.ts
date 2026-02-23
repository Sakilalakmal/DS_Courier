import { Module } from "@nestjs/common";
import { AuthProxyModule } from "./modules/auth-proxy/auth-proxy.module.js";
import { UsersModule } from "./modules/users/users.module.js";
import { ShipmentsModule } from "./modules/shipments/shipments.module.js";
import { PrismaService } from "./common/prisma/prisma.service.js";

@Module({
  imports: [AuthProxyModule, UsersModule, ShipmentsModule],
  providers: [PrismaService],
})
export class AppModule {}
