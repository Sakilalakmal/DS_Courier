import { ShipmentsService } from "@/modules/shipments/shipments.service.js";

describe("Tracking ID", () => {
  it("generates CF-YYYYMMDD-XXXXXX format", () => {
    const prisma = {
      address: { create: jest.fn() },
      shipment: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
      shipmentEvent: { create: jest.fn() },
    } as any;

    const service = new ShipmentsService(prisma);
    const trackingId = (service as any).generateTrackingId() as string;

    expect(trackingId).toMatch(/^CF-\d{8}-[A-Z0-9]{6}$/);
  });
});
