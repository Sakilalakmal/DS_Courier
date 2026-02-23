import { TrackingProjectionService } from "@/modules/tracking/tracking-projection.service.js";

describe("TrackingProjectionService", () => {
  const createPrismaMock = () => {
    const timeline = new Map<string, any>();
    const snapshots = new Map<string, any>();

    const prisma: any = {
      $transaction: jest.fn(async (callback: (tx: any) => Promise<unknown>) => {
        const tx = {
          trackingTimelineCache: {
            findUnique: jest.fn(async ({ where }) => timeline.get(where.eventId) ?? null),
            create: jest.fn(async ({ data }) => {
              if (timeline.has(data.eventId)) {
                const error = new Error("Unique") as Error & { code?: string };
                error.code = "P2002";
                throw error;
              }

              const created = {
                id: `tl-${timeline.size + 1}`,
                ...data,
                createdAt: new Date(),
              };
              timeline.set(data.eventId, created);
              return created;
            }),
          },
          trackingSnapshot: {
            findUnique: jest.fn(async ({ where }) => snapshots.get(where.trackingId) ?? null),
            create: jest.fn(async ({ data }) => {
              const created = {
                id: `snap-${snapshots.size + 1}`,
                ...data,
                updatedAt: new Date(),
              };
              snapshots.set(data.trackingId, created);
              return created;
            }),
            update: jest.fn(async ({ where, data }) => {
              const existing = snapshots.get(where.trackingId);
              const updated = { ...existing, ...data, updatedAt: new Date() };
              snapshots.set(where.trackingId, updated);
              return updated;
            }),
          },
        };

        const result = await callback(tx);
        prisma.__tx = tx;
        return result;
      }),
      trackingSnapshot: {
        findUnique: jest.fn(async ({ where }) => snapshots.get(where.trackingId) ?? null),
      },
      trackingTimelineCache: {
        findMany: jest.fn(async ({ where }) =>
          Array.from(timeline.values())
            .filter((item) => item.trackingId === where.trackingId)
            .sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime()),
        ),
      },
    };

    return { prisma, timeline, snapshots };
  };

  it("is idempotent for duplicate eventId", async () => {
    const { prisma, timeline } = createPrismaMock();
    const service = new TrackingProjectionService(prisma);

    const event = {
      eventType: "shipment.status.updated" as const,
      eventId: "evt-1",
      timestamp: "2026-02-23T10:00:00.000Z",
      payload: {
        trackingId: "CF-20260223-ABC123",
        oldStatus: "CREATED" as const,
        newStatus: "SCHEDULED_PICKUP" as const,
        location: { lat: 6.9, lng: 79.8 },
        actorId: "staff-1",
        actorRole: "dispatcher" as const,
      },
    };

    await service.applyShipmentStatusUpdatedEvent(event);
    await service.applyShipmentStatusUpdatedEvent(event);

    expect(timeline.size).toBe(1);
  });

  it("returns snapshot + timeline", async () => {
    const { prisma } = createPrismaMock();
    const service = new TrackingProjectionService(prisma);

    await service.applyShipmentStatusUpdatedEvent({
      eventType: "shipment.status.updated",
      eventId: "evt-2",
      timestamp: "2026-02-23T11:00:00.000Z",
      payload: {
        trackingId: "CF-20260223-XYZ789",
        oldStatus: "CREATED",
        newStatus: "SCHEDULED_PICKUP",
        location: null,
        actorId: "staff-2",
        actorRole: "dispatcher",
      },
    });

    const result = await service.getTrackingByTrackingId("CF-20260223-XYZ789");
    expect(result.snapshot.currentStatus).toBe("SCHEDULED_PICKUP");
    expect(result.timeline).toHaveLength(1);
  });
});
