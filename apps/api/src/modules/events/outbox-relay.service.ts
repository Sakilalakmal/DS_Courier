import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { PrismaService } from "@/common/prisma/prisma.service.js";
import { EVENT_PUBLISHER, EventPublisher } from "./event-publisher.interface.js";

const PENDING_STATUSES = ["PENDING", "FAILED"];

@Injectable()
export class OutboxRelayService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxRelayService.name);
  private readonly intervalMs = Number(process.env.OUTBOX_RELAY_INTERVAL_MS ?? 2000);
  private readonly batchSize = Number(process.env.OUTBOX_BATCH_SIZE ?? 25);
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  constructor(
    private readonly prisma: PrismaService,
    @Inject(EVENT_PUBLISHER) private readonly eventPublisher: EventPublisher,
  ) {}

  async onModuleInit() {
    void this.processPendingBatch();
    this.timer = setInterval(() => {
      void this.processPendingBatch();
    }, this.intervalMs);
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async processPendingBatch() {
    if (this.running) {
      return;
    }

    this.running = true;

    try {
      const items = await this.prisma.shipmentEventOutbox.findMany({
        where: {
          status: {
            in: PENDING_STATUSES,
          },
        },
        orderBy: {
          createdAt: "asc",
        },
        take: this.batchSize,
      });

      for (const item of items) {
        try {
          const payload = JSON.parse(item.payload);
          await this.eventPublisher.publish({
            topic: item.topic,
            key: item.partitionKey,
            value: payload,
          });

          await this.prisma.shipmentEventOutbox.update({
            where: { id: item.id },
            data: {
              status: "PUBLISHED",
              publishedAt: new Date(),
              attemptCount: {
                increment: 1,
              },
              lastError: null,
            },
          });
        } catch (error) {
          await this.prisma.shipmentEventOutbox.update({
            where: { id: item.id },
            data: {
              status: "FAILED",
              attemptCount: {
                increment: 1,
              },
              lastError: error instanceof Error ? error.message.slice(0, 1000) : "Unknown publish error",
            },
          });
        }
      }
    } catch (error) {
      this.logger.error(`Outbox batch failed: ${error instanceof Error ? error.message : "unknown error"}`);
    } finally {
      this.running = false;
    }
  }
}
