import {
  Body,
  Controller,
  Param,
  Patch,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  UserRole,
  updateShipmentStatusDtoSchema,
  userRoles,
} from "@courierflow/contracts";
import { JwtGuard } from "@/common/auth/jwt.guard.js";
import { RolesGuard } from "@/common/auth/roles.guard.js";
import { Roles } from "@/common/auth/roles.decorator.js";
import { ShipmentStatusService } from "./shipment-status.service.js";

type RequestWithUser = {
  user: {
    sub: string;
    role: string;
  };
};

function normalizeUserRole(role: string): UserRole {
  if (userRoles.includes(role as UserRole)) {
    return role as UserRole;
  }

  return "customer";
}

@Controller("shipments")
@UseGuards(JwtGuard, RolesGuard)
export class ShipmentStatusController {
  constructor(private readonly shipmentStatusService: ShipmentStatusService) {}

  @Patch(":trackingId/status")
  @Roles("admin", "dispatcher", "supervisor", "driver")
  async patchStatus(
    @Param("trackingId") trackingId: string,
    @Body() payload: unknown,
    @Req() req: RequestWithUser,
  ) {
    const dto = updateShipmentStatusDtoSchema.parse(payload);

    return this.shipmentStatusService.patchStatus(
      trackingId,
      dto.status,
      dto.note,
      dto.location,
      req.user.sub,
      normalizeUserRole(req.user.role),
    );
  }
}
