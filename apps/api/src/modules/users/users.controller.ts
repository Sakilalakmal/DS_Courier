import {
  Body,
  Controller,
  Param,
  Patch,
  UseGuards,
} from "@nestjs/common";
import { assignRoleDtoSchema } from "@courierflow/contracts";
import { UsersService } from "./users.service.js";
import { JwtGuard } from "@/common/auth/jwt.guard.js";
import { RolesGuard } from "@/common/auth/roles.guard.js";
import { Roles } from "@/common/auth/roles.decorator.js";

@Controller("users")
@UseGuards(JwtGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch(":id/role")
  @Roles("admin", "supervisor")
  async assignRole(@Param("id") id: string, @Body() payload: unknown) {
    const dto = assignRoleDtoSchema.parse(payload);
    return this.usersService.assignRole(id, dto.role);
  }
}
