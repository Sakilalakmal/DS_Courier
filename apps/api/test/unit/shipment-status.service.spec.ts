import { ConflictException, NotFoundException } from "@nestjs/common";
import { ShipmentStatusService } from "@/modules/shipments/shipment-status.service.js";

describe("ShipmentStatusService", () => {
  const makePrisma = () => {
    const shipmentRecord = {
      id: "shp-1",
      trackingId: "CF-20260223-ABC123",
      title: "Box",
      status: "CREATED",
      customerId: "cust-1",
      createdAt: new Date("2026-02-20T10:00:00.000Z"),
      updatedAt: new Date("2026-02-20T10:00:00.000Z"),
    };

    const prisma: any = {
      shipment: {
        findUnique: jest.fn(async ({ where }) => (where.trackingId === shipmentRecord.trackingId ? shipmentRecord : null)),
      },
      $transaction: jest.fn(async (callback: (tx: any) => Promise<unknown>) => {
        const tx = {
          shipment: {
            update: jest.fn(async ({ data }) => ({
              ...shipmentRecord,
              status: data.status,
              updatedAt: new Date("2026-02-21T10:00:00.000Z"),
            })),
          },
          shipmentEvent: {
            create: jest.fn(async () => ({})),
          },
          shipmentEventOutbox: {
            create: jest.fn(async () => ({})),
          },
        };

        const result = await callback(tx);
        prisma.__tx = tx;
        return result;
      }),
    };

    return prisma;
  };

  it("throws NotFoundException when shipment is missing", async () => {
    const prisma = makePrisma();
    prisma.shipment.findUnique.mockResolvedValueOnce(null);
    const service = new ShipmentStatusService(prisma);

    await expect(
      service.patchStatus("missing", "SCHEDULED_PICKUP", undefined, null, "user-1", "dispatcher"),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("throws ConflictException for invalid transition", async () => {
    const prisma = makePrisma();
    const service = new ShipmentStatusService(prisma);

    await expect(
      service.patchStatus("CF-20260223-ABC123", "DELIVERED", undefined, null, "user-1", "dispatcher"),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("writes shipment event and outbox for valid transition", async () => {
    const prisma = makePrisma();
    const service = new ShipmentStatusService(prisma);

    const result = await service.patchStatus(
      "CF-20260223-ABC123",
      "SCHEDULED_PICKUP",
      "Pickup booked",
      { lat: 6.9271, lng: 79.8612 },
      "user-1",
      "dispatcher",
    );

    expect(result.status).toBe("SCHEDULED_PICKUP");
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.__tx.shipmentEvent.create).toHaveBeenCalledTimes(1);
    expect(prisma.__tx.shipmentEventOutbox.create).toHaveBeenCalledTimes(1);
  });
});
