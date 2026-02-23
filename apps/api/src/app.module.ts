import { Module } from "@nestjs/common";
import { AuthProxyModule } from "./modules/auth-proxy/auth-proxy.module.js";
import { UsersModule } from "./modules/users/users.module.js";
import { ShipmentsModule } from "./modules/shipments/shipments.module.js";
import { PrismaService } from "./common/prisma/prisma.service.js";
import { KafkaModule } from "./common/kafka/kafka.module.js";
import { EventsModule } from "./modules/events/events.module.js";
import { TrackingModule } from "./modules/tracking/tracking.module.js";

@Module({
  imports: [KafkaModule, AuthProxyModule, UsersModule, ShipmentsModule, EventsModule, TrackingModule],
  providers: [PrismaService],
})
export class AppModule {}
