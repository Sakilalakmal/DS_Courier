import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import {
  SHIPMENT_STATUS_UPDATED_TOPIC,
  shipmentStatusUpdatedEventSchema,
} from "@courierflow/contracts";
import { Consumer } from "kafkajs";
import { KafkaService } from "@/common/kafka/kafka.service.js";
import { TrackingProjectionService } from "./tracking-projection.service.js";

@Injectable()
export class TrackingProjectionConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TrackingProjectionConsumer.name);
  private consumer: Consumer | null = null;

  constructor(
    private readonly kafkaService: KafkaService,
    private readonly trackingProjectionService: TrackingProjectionService,
  ) {}

  async onModuleInit() {
    const topic = process.env.KAFKA_SHIPMENT_STATUS_TOPIC ?? SHIPMENT_STATUS_UPDATED_TOPIC;
    const groupId = process.env.KAFKA_PROJECTION_GROUP_ID ?? "courierflow-tracking-projection-v1";

    try {
      this.consumer = await this.kafkaService.createConsumer(groupId);
      await this.consumer.subscribe({ topic, fromBeginning: true });
      await this.consumer.run({
        eachMessage: async ({ message }) => {
          if (!message.value) {
            return;
          }

          try {
            const parsed = shipmentStatusUpdatedEventSchema.parse(
              JSON.parse(message.value.toString()),
            );
            await this.trackingProjectionService.applyShipmentStatusUpdatedEvent(parsed);
          } catch (error) {
            this.logger.error(
              `Failed to process message: ${error instanceof Error ? error.message : "unknown error"}`,
            );
          }
        },
      });
    } catch (error) {
      this.logger.error(
        `Tracking projection consumer failed to start: ${error instanceof Error ? error.message : "unknown error"}`,
      );
    }
  }

  async onModuleDestroy() {
    if (this.consumer) {
      try {
        await this.consumer.stop();
      } catch {
        this.logger.warn("Failed to stop tracking consumer cleanly");
      }
    }
  }
}
