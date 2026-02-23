import { Injectable } from "@nestjs/common";
import type { UserRole } from "@courierflow/contracts";
import { PrismaService } from "@/common/prisma/prisma.service.js";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async assignRole(userId: string, role: UserRole) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return { user };
  }
}
