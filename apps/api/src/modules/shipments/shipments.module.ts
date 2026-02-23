import { Module } from "@nestjs/common";
import { ShipmentsController } from "./shipments.controller.js";
import { ShipmentsService } from "./shipments.service.js";
import { RolesGuard } from "@/common/auth/roles.guard.js";
import { JwtGuard } from "@/common/auth/jwt.guard.js";
import { PrismaService } from "@/common/prisma/prisma.service.js";

@Module({
  controllers: [ShipmentsController],
  providers: [ShipmentsService, RolesGuard, JwtGuard, PrismaService],
})
export class ShipmentsModule {}
