import { Module } from "@nestjs/common";
import { PrismaService } from "@/common/prisma/prisma.service.js";
import { KafkaModule } from "@/common/kafka/kafka.module.js";
import { TrackController } from "./tracking.controller.js";
import { TrackingProjectionConsumer } from "./tracking-projection.consumer.js";
import { TrackingProjectionService } from "./tracking-projection.service.js";

@Module({
  imports: [KafkaModule],
  controllers: [TrackController],
  providers: [PrismaService, TrackingProjectionService, TrackingProjectionConsumer],
  exports: [TrackingProjectionService],
})
export class TrackingModule {}
