import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { ShipmentsModule } from "@/modules/shipments/shipments.module.js";
import { PrismaService } from "@/common/prisma/prisma.service.js";
import { JwtGuard } from "@/common/auth/jwt.guard.js";

describe("Shipments API (integration)", () => {
  let app: INestApplication;

  const db = {
    addresses: new Map<string, any>(),
    shipments: new Map<string, any>(),
    events: [] as any[],
  };

  const prismaMock = {
    address: {
      create: jest.fn(async ({ data }) => {
        const id = `addr-${db.addresses.size + 1}`;
        const value = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
        db.addresses.set(id, value);
        return value;
      }),
    },
    shipment: {
      create: jest.fn(async ({ data }) => {
        const id = `shp-${db.shipments.size + 1}`;
        const value = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
        db.shipments.set(data.trackingId, value);
        return value;
      }),
      findMany: jest.fn(async ({ where }) => {
        const all = Array.from(db.shipments.values());
        if (!where) return all;
        return all.filter((item) => item.customerId === where.customerId);
      }),
      findUnique: jest.fn(async ({ where, include }) => {
        const shipment = db.shipments.get(where.trackingId);
        if (!shipment) return null;
        if (include?.events) {
          return { ...shipment, events: db.events.filter((e) => e.shipmentId === shipment.id) };
        }
        return shipment;
      }),
      update: jest.fn(async ({ where, data }) => {
        const shipment = db.shipments.get(where.trackingId);
        const updated = { ...shipment, ...data, updatedAt: new Date() };
        db.shipments.set(where.trackingId, updated);
        return updated;
      }),
    },
    shipmentEvent: {
      create: jest.fn(async ({ data }) => {
        const event = { id: `evt-${db.events.length + 1}`, ...data, createdAt: new Date() };
        db.events.push(event);
        return event;
      }),
    },
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ShipmentsModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .overrideGuard(JwtGuard)
      .useValue({
        canActivate: (context: any) => {
          const req = context.switchToHttp().getRequest();
          req.user = {
            sub: req.headers["x-test-user"] ?? "user-1",
            role: req.headers["x-test-role"] ?? "customer",
          };
          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api");
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it("POST /api/shipments creates a shipment", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/shipments")
      .set("Authorization", "Bearer test")
      .send({
        title: "Laptop",
        description: "Fragile",
        origin: {
          line1: "Colombo 01",
          city: "Colombo",
          state: "WP",
          postalCode: "00100",
          country: "LK",
        },
        destination: {
          line1: "Kandy",
          city: "Kandy",
          state: "CP",
          postalCode: "20000",
          country: "LK",
        },
        weightKg: 1.5,
      });

    expect(response.status).toBe(201);
    expect(response.body.trackingId).toMatch(/^CF-\d{8}-[A-Z0-9]{6}$/);
  });

  it("GET /api/shipments/:trackingId is forbidden for non-owner customer", async () => {
    const shipment = Array.from(db.shipments.values())[0];

    const response = await request(app.getHttpServer())
      .get(`/api/shipments/${shipment.trackingId}`)
      .set("Authorization", "Bearer test")
      .set("x-test-role", "customer")
      .set("x-test-user", "user-2");

    expect(response.status).toBe(403);
  });

  it("PATCH /api/shipments/:trackingId/status is blocked for customer role", async () => {
    const shipment = Array.from(db.shipments.values())[0];

    const response = await request(app.getHttpServer())
      .patch(`/api/shipments/${shipment.trackingId}/status`)
      .set("Authorization", "Bearer test")
      .set("x-test-role", "customer")
      .send({ status: "IN_TRANSIT" });

    expect(response.status).toBe(403);
  });
});
