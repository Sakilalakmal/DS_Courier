import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { Consumer, Kafka, logLevel, Producer } from "kafkajs";

@Injectable()
export class KafkaService implements OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private readonly kafka: Kafka;
  private producerPromise: Promise<Producer> | null = null;
  private readonly consumers = new Set<Consumer>();

  constructor() {
    const brokers = (process.env.KAFKA_BOOTSTRAP_SERVERS ?? "localhost:9092")
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    this.kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID ?? "courierflow-api",
      brokers,
      logLevel: logLevel.NOTHING,
    });

    this.logger.log(`Kafka configured for brokers: ${brokers.join(", ")}`);
  }

  async getProducer() {
    if (!this.producerPromise) {
      this.producerPromise = (async () => {
        const producer = this.kafka.producer();
        await producer.connect();
        return producer;
      })();
    }

    return this.producerPromise;
  }

  async createConsumer(groupId: string) {
    const consumer = this.kafka.consumer({ groupId });
    await consumer.connect();
    this.consumers.add(consumer);
    return consumer;
  }

  async onModuleDestroy() {
    for (const consumer of this.consumers) {
      try {
        await consumer.disconnect();
      } catch {
        this.logger.warn("Failed to disconnect Kafka consumer cleanly");
      }
    }

    if (this.producerPromise) {
      try {
        const producer = await this.producerPromise;
        await producer.disconnect();
      } catch {
        this.logger.warn("Failed to disconnect Kafka producer cleanly");
      }
    }
  }
}
