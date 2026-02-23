import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  createShipmentDtoSchema,
} from "@courierflow/contracts";
import { ShipmentsService } from "./shipments.service.js";
import { JwtGuard } from "@/common/auth/jwt.guard.js";
import { RolesGuard } from "@/common/auth/roles.guard.js";
import { Roles } from "@/common/auth/roles.decorator.js";

type RequestWithUser = {
  user: {
    sub: string;
    role: string;
  };
};

@Controller("shipments")
@UseGuards(JwtGuard, RolesGuard)
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Post()
  @Roles("admin", "dispatcher", "supervisor", "driver", "customer")
  async create(@Body() payload: unknown, @Req() req: RequestWithUser) {
    const dto = createShipmentDtoSchema.parse(payload);
    return this.shipmentsService.create(req.user.sub, req.user.role, dto);
  }

  @Get()
  @Roles("admin", "dispatcher", "supervisor", "driver", "customer")
  async list(@Req() req: RequestWithUser) {
    return this.shipmentsService.list(req.user.sub, req.user.role);
  }

  @Get(":trackingId")
  @Roles("admin", "dispatcher", "supervisor", "driver", "customer")
  async getByTrackingId(@Param("trackingId") trackingId: string, @Req() req: RequestWithUser) {
    return this.shipmentsService.getByTrackingId(trackingId, req.user.sub, req.user.role);
  }

}
