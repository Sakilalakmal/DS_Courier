import { Module } from "@nestjs/common";
import { PrismaService } from "@/common/prisma/prisma.service.js";
import { KafkaModule } from "@/common/kafka/kafka.module.js";
import { EVENT_PUBLISHER } from "./event-publisher.interface.js";
import { KafkaEventPublisher } from "./kafka-event-publisher.service.js";
import { OutboxRelayService } from "./outbox-relay.service.js";

@Module({
  imports: [KafkaModule],
  providers: [
    PrismaService,
    KafkaEventPublisher,
    OutboxRelayService,
    {
      provide: EVENT_PUBLISHER,
      useExisting: KafkaEventPublisher,
    },
  ],
  exports: [EVENT_PUBLISHER, OutboxRelayService],
})
export class EventsModule {}
