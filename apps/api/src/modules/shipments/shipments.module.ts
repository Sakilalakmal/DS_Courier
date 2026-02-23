import { Module } from "@nestjs/common";
import { ShipmentsController } from "./shipments.controller.js";
import { ShipmentsService } from "./shipments.service.js";
import { ShipmentStatusController } from "./shipment-status.controller.js";
import { ShipmentStatusService } from "./shipment-status.service.js";
import { RolesGuard } from "@/common/auth/roles.guard.js";
import { JwtGuard } from "@/common/auth/jwt.guard.js";
import { PrismaService } from "@/common/prisma/prisma.service.js";

@Module({
  controllers: [ShipmentsController, ShipmentStatusController],
  providers: [ShipmentsService, ShipmentStatusService, RolesGuard, JwtGuard, PrismaService],
  exports: [ShipmentsService, ShipmentStatusService],
})
export class ShipmentsModule {}
