import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "@/app.module.js";
import { JwtGuard } from "@/common/auth/jwt.guard.js";
import { PrismaService } from "@/common/prisma/prisma.service.js";
import { KafkaService } from "@/common/kafka/kafka.service.js";
import { SHIPMENT_STATUS_UPDATED_TOPIC } from "@courierflow/contracts";

const ENABLE_REAL_KAFKA_TESTS = process.env.ENABLE_REAL_KAFKA_TESTS === "true";
const describeIfKafka = ENABLE_REAL_KAFKA_TESTS ? describe : describe.skip;

describeIfKafka("Kafka projection pipeline (integration)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let kafkaService: KafkaService;
  let trackingId = "";
  const userId = `staff-${Date.now()}`;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtGuard)
      .useValue({
        canActivate: (context: any) => {
          const req = context.switchToHttp().getRequest();
          req.user = {
            sub: req.headers["x-test-user"] ?? userId,
            role: req.headers["x-test-role"] ?? "dispatcher",
          };
          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api");
    await app.init();

    prisma = app.get(PrismaService);
    kafkaService = app.get(KafkaService);

    await prisma.role.upsert({
      where: { code: "dispatcher" },
      update: { label: "Dispatcher" },
      create: { code: "dispatcher", label: "Dispatcher" },
    });

    await prisma.user.upsert({
      where: { email: `${userId}@example.com` },
      update: { role: "dispatcher" },
      create: {
        id: userId,
        name: "Kafka Staff",
        email: `${userId}@example.com`,
        role: "dispatcher",
      },
    });
  });

  afterAll(async () => {
    if (trackingId) {
      await prisma.trackingTimelineCache.deleteMany({ where: { trackingId } });
      await prisma.trackingSnapshot.deleteMany({ where: { trackingId } });
      await prisma.shipmentEventOutbox.deleteMany({ where: { partitionKey: trackingId } });
      await prisma.shipmentEvent.deleteMany({ where: { trackingId } });
      await prisma.shipment.deleteMany({ where: { trackingId } });
    }

    await prisma.address.deleteMany({ where: { userId } });
    await prisma.user.deleteMany({ where: { id: userId } });

    await app.close();
  });

  it("publishes and projects shipment status updates", async () => {
    const createResponse = await request(app.getHttpServer())
      .post("/api/shipments")
      .set("Authorization", "Bearer test")
      .set("x-test-user", userId)
      .set("x-test-role", "dispatcher")
      .send({
        title: "Kafka Integration Box",
        description: "Integration shipment",
        origin: {
          line1: "Origin 1",
          city: "Colombo",
          state: "WP",
          postalCode: "00100",
          country: "LK",
        },
        destination: {
          line1: "Destination 1",
          city: "Kandy",
          state: "CP",
          postalCode: "20000",
          country: "LK",
        },
        weightKg: 2.5,
      });

    expect(createResponse.status).toBe(201);
    trackingId = createResponse.body.trackingId;

    const patchResponse = await request(app.getHttpServer())
      .patch(`/api/shipments/${trackingId}/status`)
      .set("Authorization", "Bearer test")
      .set("x-test-user", userId)
      .set("x-test-role", "dispatcher")
      .send({ status: "SCHEDULED_PICKUP", note: "Integration schedule" });

    expect(patchResponse.status).toBe(200);

    await waitFor(async () => {
      const snapshot = await prisma.trackingSnapshot.findUnique({ where: { trackingId } });
      return snapshot?.currentStatus === "SCHEDULED_PICKUP";
    }, 20000);

    const snapshot = await prisma.trackingSnapshot.findUnique({ where: { trackingId } });
    expect(snapshot?.currentStatus).toBe("SCHEDULED_PICKUP");
  });

  it("keeps projection idempotent for duplicate eventId", async () => {
    const latestEvent = await prisma.shipmentEvent.findFirst({
      where: {
        trackingId,
        newStatus: "SCHEDULED_PICKUP",
      },
      orderBy: {
        occurredAt: "desc",
      },
    });

    expect(latestEvent).toBeTruthy();

    const producer = await kafkaService.getProducer();
    await producer.send({
      topic: process.env.KAFKA_SHIPMENT_STATUS_TOPIC ?? SHIPMENT_STATUS_UPDATED_TOPIC,
      messages: [
        {
          key: trackingId,
          value: JSON.stringify({
            eventType: SHIPMENT_STATUS_UPDATED_TOPIC,
            eventId: latestEvent!.eventId,
            timestamp: latestEvent!.occurredAt.toISOString(),
            payload: {
              trackingId,
              oldStatus: latestEvent!.oldStatus,
              newStatus: latestEvent!.newStatus,
              location:
                latestEvent!.locationLat != null && latestEvent!.locationLng != null
                  ? {
                      lat: latestEvent!.locationLat,
                      lng: latestEvent!.locationLng,
                    }
                  : null,
              actorId: latestEvent!.actorId,
              actorRole: latestEvent!.actorRole,
            },
          }),
        },
      ],
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const timelineRows = await prisma.trackingTimelineCache.findMany({
      where: { eventId: latestEvent!.eventId },
    });

    expect(timelineRows).toHaveLength(1);
  });

  it("returns 409 for invalid state transition", async () => {
    const response = await request(app.getHttpServer())
      .patch(`/api/shipments/${trackingId}/status`)
      .set("Authorization", "Bearer test")
      .set("x-test-user", userId)
      .set("x-test-role", "dispatcher")
      .send({ status: "DELIVERED" });

    expect(response.status).toBe(409);
  });
});

async function waitFor(predicate: () => Promise<boolean>, timeoutMs: number) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    if (await predicate()) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Condition not met within ${timeoutMs}ms`);
}
