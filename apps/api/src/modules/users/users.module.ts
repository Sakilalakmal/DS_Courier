import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller.js";
import { UsersService } from "./users.service.js";
import { RolesGuard } from "@/common/auth/roles.guard.js";
import { JwtGuard } from "@/common/auth/jwt.guard.js";
import { PrismaService } from "@/common/prisma/prisma.service.js";

@Module({
  controllers: [UsersController],
  providers: [UsersService, RolesGuard, JwtGuard, PrismaService],
})
export class UsersModule {}
